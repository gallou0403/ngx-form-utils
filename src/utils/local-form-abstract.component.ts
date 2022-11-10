import { Directive, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

/**
 * This abstract component is useful when you need to be able to "cancel" new input
 * and revert to the DB value after changes have been made. A form is passed in via
 * @Input() and the value is used to patch a localForm of the same type.
 *
 * Using save() will emit a formChange event that can be used by a parent
 * component to save data via API and update the form, which in turn updates the localForm
 *
 * Using cancel() will overwrite the localForm with the value of form undoing any
 * unsaved changes
 */
@Directive()
export abstract class LocalFormAbstractComponent<
    T extends AbstractControl, // the type for the local form. can just be a FormControl
    K // the type that is emitted by the formChange. not a form
> implements OnChanges, OnDestroy {
    @Output() formChange: EventEmitter<K> = new EventEmitter();
    @Input() form: T;

    localForm: T;
    sub: Subscription;

    ngOnChanges(changes: SimpleChanges) {
        // ngOnChanges will fire if the reference to this.form changes.
        // if that happens we need to resubscribe.
        // To be safe, we also unsubscribe from any existing subscription

        if (this.sub) this.sub.unsubscribe();
        this.sub = this.form.valueChanges.pipe(startWith(this.form.value)).subscribe((value) => {
            this.localForm.patchValue(value);
        });
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    cancel(evt?) {
        if (evt) {
            evt.preventDefault();
        }
        this.localForm.patchValue(this.form.value);
    }

    save() {
        if (this.localForm.invalid) {
            console.warn('form is invalid', this.localForm);
            return;
        }

        this.formChange.emit(this.localForm.value);
    }
}
