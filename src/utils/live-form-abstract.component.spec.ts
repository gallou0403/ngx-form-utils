import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { QueryList } from '@angular/core';
import { GlobalSelectorService } from '@ersa/common/facades';
import { LiveFormAbstractComponent, SAVE_DEBOUNCE_TIME } from './live-form-abstract.component';

const chatbotSettingsSpy = new Subject();
const selectedCampaignIdSpy = new Subject();

const mockService = {
    chatbotSettings$: chatbotSettingsSpy,
};

const mockSelectorService = {
    selectedCampaignId$: selectedCampaignIdSpy,
};

class MockComponent extends LiveFormAbstractComponent<any> {
    form = new FormGroup({
        foo: new FormControl(false),
        bar: new FormControl(false),
    });

    data$ = mockService.chatbotSettings$;

    constructor() {
        super((mockSelectorService as unknown) as GlobalSelectorService);
    }

    save() {}
}

describe('LiveFormAbstractComponent', () => {
    let component: MockComponent;

    beforeEach(() => {
        component = new MockComponent();
        component.ngOnInit();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('creates the component', () => {
        expect(component).toBeDefined();
    });

    describe('dataUpdates$', () => {
        it('resets the form if a falsy value is emitted from service', () => {
            const resetSpy = jest.spyOn(component.form, 'reset');
            const patchSpy = jest.spyOn(component.form, 'patchValue');
            chatbotSettingsSpy.next(null);

            expect(resetSpy).toHaveBeenCalledTimes(1);
            expect(patchSpy).toHaveBeenCalledTimes(0);
        });

        it('patches the form value with a clone', () => {
            const expected = {};
            const patchSpy = jest.spyOn(component.form, 'patchValue');
            chatbotSettingsSpy.next(expected);
            expect(patchSpy).toHaveBeenCalledWith(expected);
            expect(patchSpy.mock.calls[0][0] === expected).toBe(false);
        });

        it('does not patch matInputs that are currently focused', () => {
            const patchSpy = jest.spyOn(component.form, 'patchValue');

            component.inputs = ([
                { focused: true, ngControl: { name: 'foo' } },
                { focused: false, ngControl: { name: 'bar' } },
            ] as unknown) as QueryList<any>;

            chatbotSettingsSpy.next({
                foo: true,
                bar: true,
            });

            expect(patchSpy).toHaveBeenCalledWith({ bar: true });
        });
    });

    describe('formValueChanges$', () => {
        it('does not emit if form is clean', (done) => {
            const dirtySpy = jest.spyOn(component.form, 'dirty', 'get');

            component.form.patchValue({
                foo: true,
            });

            setTimeout(() => {
                expect(dirtySpy).toHaveBeenCalledTimes(1);
                expect(dirtySpy).toHaveReturnedWith(false);
                done();
            }, SAVE_DEBOUNCE_TIME + 10);
        });
    });

    describe('campaignSelectionChanges$', () => {
        it('resets the form', () => {
            const resetSpy = jest.spyOn(component.form, 'reset');
            selectedCampaignIdSpy.next(1);
            expect(resetSpy).toHaveBeenCalled();
        });
    });
});
