/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Types } from '@app/framework/internal';

export const SQX_STARS_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarsComponent), multi: true
};

@Component({
    selector: 'sqx-stars',
    styleUrls: ['./stars.component.scss'],
    templateUrl: './stars.component.html',
    providers: [SQX_STARS_CONTROL_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarsComponent implements ControlValueAccessor {
    private callChange = (v: any) => { /* NOOP */ };
    private callTouched = () => { /* NOOP */ };
    private maximumStarsValue = 5;

    @Input()
    public set maximumStars(value: number) {
        const maxStars: number = Types.isNumber(value) ? value : 5;

        if (this.maximumStarsValue !== maxStars) {
            this.maximumStarsValue = value;

            this.starsArray = [];

            for (let i = 1; i <= value; i++) {
                this.starsArray.push(i);
            }
        }
    }

    public get maximumStars() {
        return this.maximumStarsValue;
    }

    public isDisabled = false;

    public stars: number;
    public starsArray: number[] = [1, 2, 3, 4, 5];

    public value: number | null = 1;

    constructor(
        private readonly changeDetector: ChangeDetectorRef
    ) {
    }

    public writeValue(obj: any) {
        this.value = this.stars = Types.isNumber(obj) ? obj : 0;

        this.changeDetector.markForCheck();
    }

    public setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;

        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn: any) {
        this.callChange = fn;
    }

    public registerOnTouched(fn: any) {
        this.callTouched = fn;
    }

    public setPreview(value: number) {
        if (this.isDisabled) {
            return;
        }

        this.stars = value;
    }

    public stopPreview() {
        if (this.isDisabled) {
            return;
        }

        this.stars = this.value || 0;
    }

    public reset() {
        if (this.isDisabled) {
            return false;
        }

        if (this.value) {
            this.value = null;
            this.stars = 0;

            this.callChange(this.value);
            this.callTouched();
        }

        return false;
    }

    public setValue(value: number) {
        if (this.isDisabled) {
            return false;
        }

        if (this.value !== value) {
            this.value = this.stars = value;

            this.callChange(this.value);
            this.callTouched();
        }

        return false;
    }
}