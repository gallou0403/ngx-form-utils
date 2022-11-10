import { Directive, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AbstractControl, FormGroup } from '@angular/forms';
import { clone } from 'ramda';
import { GlobalSelectorService } from '@ersa/common/facades';

export const SAVE_DEBOUNCE_TIME = 500;

/**
 * This is the component that orchestrates getting data into our forms and out to our API
 * It is designed to save immediately when changes are detected, so a localForm must be used
 * in child components that want to delay saving (eg. save by button)
 */
@Directive()
export abstract class LiveFormAbstractComponent<T> implements OnInit, OnDestroy {
    abstract form: AbstractControl;
    abstract data$: Observable<T>;

    protected destroyed = new Subject();
    protected debounceTimeMs = SAVE_DEBOUNCE_TIME;

    @ViewChildren(MatInput) inputs!: QueryList<MatInput>;

    ngOnInit() {
        this.dataUpdates$().subscribe();
        this.formValueChanges$().subscribe();
        this.campaignSelectionChanges$().subscribe();
    }

    ngOnDestroy() {
        this.destroyed.next();
    }

    protected constructor(protected selectorService: GlobalSelectorService) {}

    protected dataUpdates$(): Observable<void> {
        return this.data$.pipe(
            takeUntil(this.destroyed),
            map((settings: T) => {
                if (!settings) {
                    this.form.reset();
                    return;
                }

                const cloned = clone(settings);

                // do not patch inputs that are currently focused
                if (this.inputs?.length) {
                    this.inputs.forEach((input) => {
                        if (input.focused) {
                            delete cloned[input.ngControl.name];
                        }
                    });
                }

                //mark form as pristine to avoid infinite loops
                this.form.patchValue(cloned);
                // mark pristine after patching because patchValue marks inputs as dirty
                this.form.markAsPristine();
            })
        );
    }

    protected formValueChanges$() {
        return this.form.valueChanges.pipe(
            debounceTime(this.debounceTimeMs),
            takeUntil(this.destroyed),
            filter(() => {
                //don't continue if form is invalid
                if (this.form.invalid) {
                    console.warn('form is invalid', this.form.value);
                    return false;
                }

                //don't continue if the form is pristine
                return !!this.form.dirty;
            }),
            switchMap(() => {
                // error is caught deep in legacy chatbot settings service
                return this.save();
            })
        );
    }

    // reset forms whenever campaign changes
    // if a call for new fails, we don't want stale data to hang around
    protected campaignSelectionChanges$() {
        return this.selectorService.selectedCampaignId$.pipe(tap(() => this.form.reset()));
    }

    abstract save();
}
