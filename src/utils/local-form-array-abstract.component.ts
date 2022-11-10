import { LocalFormAbstractComponent } from './local-form-abstract.component';
import { filter, first } from 'rxjs/operators';
import { CustomFormArray } from '@respage/domain';
import { equals, remove, update } from 'ramda';
import { Observable, of } from 'rxjs';
import { Directive } from '@angular/core';

/*
 * A specialized version of LocalFormAbstract component designed for use with CustomFormArrays.
 * adds methods for dealing with controls at given indexes
 *
 * */

@Directive()
export abstract class LocalFormArrayAbstractComponent<
    T extends CustomFormArray<K>, // the type for the local form
    K // the type that is emitted by the formChange. not a form
> extends LocalFormAbstractComponent<T, K[]> {
    activeIndex = null;

    protected constructor() {
        super();
    }

    cancelAt(event, index: number) {
        event.preventDefault();

        if (!this.form.at(index)) {
            this.localForm.removeAt(index);
            return;
        }

        // don't patch if form is equal to prevent flickering in image gallery
        if (!equals(this.localForm.at(index), this.form.at(index))) {
            this.localForm.patchAt(index, this.form.createControl(this.form.value[index]));
        }
    }

    saveAt(index, ctrl: T) {
        let updated;

        if (ctrl.invalid) {
            console.warn('form is not valid', ctrl.value);
            return;
        }

        updated = this.form.at(index) ? update(index, ctrl.value, this.form.value) : [...this.form.value, ctrl.value];

        this.formChange.emit(updated);
    }

    confirmDelete(evt, index) {
        evt.preventDefault();
        evt.stopPropagation();

        if (!this.form.at(index)) {
            this.localForm.removeAt(index);
        } else {
            this.doConfirmDelete()
                .pipe(first(), filter(Boolean))
                .subscribe(() => {
                    const currentValue = this.form.value;
                    const updated = remove(index, 1, currentValue);
                    this.formChange.emit(updated);
                });
        }
    }

    addControl() {
        this.localForm.push();
        this.activeIndex = this.localForm.controls.length - 1;
    }

    protected doConfirmDelete(): Observable<boolean> {
        return of(true);
    }
}
