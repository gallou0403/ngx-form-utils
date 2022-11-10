import { AbstractControl, FormArray, FormControl } from '@angular/forms';
import { clone } from 'ramda';

export class CustomFormArray<T> extends FormArray {
    override value!: T[];

    constructor() {
        super([]);
    }

    override patchValue(values: T[]) {
        let curr = 0;
        const len = this.value.length;

        //remove all controls
        while (curr < len) {
            this.removeAt(0);
            curr++;
        }

        //add all patched controls
        if (values?.length) {
            for (const value of values) {
                this.push(this.createControl(value));
            }
        }
    }

    override push(ctrl?: AbstractControl) {
        super.push(ctrl || this.createControl());
    }

    patchAt(index: number, ctrl: AbstractControl) {
        this.removeAt(index);
        this.insert(index, ctrl);
    }

    createControl(value?: T): AbstractControl {
        return new FormControl(clone(value));
    }
}
