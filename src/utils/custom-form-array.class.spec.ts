import { CustomFormArray } from './custom-form-array.class';

describe('CustomFormArray', () => {
    let form: CustomFormArray<string>;
    let mockValue: string;

    beforeEach(() => {
        form = new CustomFormArray<string>();
        mockValue = 'foo';
    });

    it('initializes with an empty array', () => {
        expect(form.value).toEqual([]);
    });

    describe('patchValue', () => {
        it('clones objects', () => {
            const feeForm = new CustomFormArray<any>();
            const mockFee = {};

            feeForm.patchValue([mockFee]);
            expect(feeForm.value[0] === mockFee).toBe(false);
        });

        it('can add controls if needed', () => {
            form.patchValue([mockValue]);
            expect(form.value).toEqual([mockValue]);
        });

        it('can remove controls if needed', () => {
            form.patchValue([mockValue]);
            expect(form.value).toEqual([mockValue]);

            form.patchValue([]);
            expect(form.value).toEqual([]);
        });
    });
});
