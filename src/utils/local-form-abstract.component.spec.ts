import { FormControl, FormGroup } from '@angular/forms';
import { LocalFormAbstractComponent } from './local-form-abstract.component';

class MockModel {
    foo = true;
    bar = true;
}

class MockForm extends FormGroup {
    constructor() {
        super({
            foo: new FormControl(false),
            bar: new FormControl(false),
        });
    }
}

class MockComponent extends LocalFormAbstractComponent<MockForm, MockModel> {
    form = new MockForm();
    localForm = new MockForm();
}

describe('LocalFormAbstractComponent', () => {
    let component: MockComponent;

    beforeEach(() => {
        component = new MockComponent();
        component.ngOnChanges(null);
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('creates the component', () => {
        expect(component).toBeDefined();
    });

    describe('ngOnChanges', () => {
        it('unsubscribes from any existing subscription', () => {
            const unsubSpy = jest.spyOn(component.sub, 'unsubscribe');
            component.ngOnChanges(null);
            expect(unsubSpy).toHaveBeenCalledTimes(1);
        });

        it('patches the localForm with the newest value and resubs', () => {
            component.form = new FormGroup({
                foo: new FormControl(true),
                bar: new FormControl(true),
            });

            component.ngOnChanges(null);

            expect(component.localForm.value).toEqual({
                foo: true,
                bar: true,
            });

            component.form.patchValue({
                foo: false,
                bar: false,
            });

            expect(component.localForm.value).toEqual({
                foo: false,
                bar: false,
            });
        });
    });

    describe('cancel', () => {
        it('overwrites the localForm value with the form value', () => {
            component.localForm.patchValue({
                foo: true,
                bar: true,
            });

            expect(component.localForm.value).toEqual({
                foo: true,
                bar: true,
            });

            component.cancel();

            expect(component.localForm.value).toEqual({
                foo: false,
                bar: false,
            });
        });
    });

    describe('save', () => {
        it('does not save if the form is invalid', () => {
            const fooCtrl = component.localForm.get('foo');
            fooCtrl.setValidators((ctrl) => ({ error: true }));
            fooCtrl.updateValueAndValidity();

            const invalidSpy = jest.spyOn(component.localForm, 'invalid', 'get');
            const emitSpy = jest.spyOn(component.formChange, 'emit');

            component.save();

            expect(invalidSpy).toHaveBeenCalledTimes(1);
            expect(invalidSpy).toHaveReturnedWith(true);
            expect(emitSpy).toHaveBeenCalledTimes(0);
        });

        it('emits the localForm value', () => {
            component.localForm.patchValue({
                foo: true,
                bar: true,
            });

            const invalidSpy = jest.spyOn(component.localForm, 'invalid', 'get');
            const emitSpy = jest.spyOn(component.formChange, 'emit');

            component.save();

            expect(invalidSpy).toHaveBeenCalledTimes(1);
            expect(invalidSpy).toHaveReturnedWith(false);
            expect(emitSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledWith({
                foo: true,
                bar: true,
            });
        });
    });
});
