/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Types } from '@app/framework/internal';

export const SQX_SLIDER_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SliderComponent), multi: true
};

@Component({
    selector: 'sqx-slider',
    styleUrls: ['./slider.component.scss'],
    templateUrl: './slider.component.html',
    providers: [SQX_SLIDER_CONTROL_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements ControlValueAccessor {
    private callChange = (v: any) => { /* NOOP */ };
    private callTouched = () => { /* NOOP */ };
    private windowMouseMoveListener: Function | null = null;
    private windowMouseUpListener: Function | null = null;
    private centerStartOffset = 0;
    private lastValue: number;
    private value: number;
    private isDragging = false;

    @ViewChild('bar')
    public bar: ElementRef<Element>;

    @ViewChild('thumb')
    public thumb: ElementRef<Element>;

    @Input()
    public min = 0;

    @Input()
    public max = 100;

    @Input()
    public step = 1;

    public isDisabled = false;

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly renderer: Renderer2
    ) {
    }

    public writeValue(obj: any) {
        this.lastValue = this.value = Types.isNumber(obj) ? obj : 0;

        this.updateThumbPosition();

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

    public onBarMouseClick(event: MouseEvent): boolean {
        if (this.windowMouseMoveListener) {
            return true;
        }

        const relativeValue = this.getRelativeX(event);

        this.value = Math.round((relativeValue * (this.max - this.min) + this.min) / this.step) * this.step;

        this.updateThumbPosition();
        this.updateTouched();
        this.updateValue();

        return false;
    }

    public onThumbMouseDown(event: MouseEvent): boolean {
        this.centerStartOffset = event.offsetX - this.thumb.nativeElement.clientWidth * 0.5;

        this.windowMouseMoveListener =
            this.renderer.listen('window', 'mousemove', (e: MouseEvent) => {
                this.onMouseMove(e);
            });

        this.windowMouseUpListener =
            this.renderer.listen('window', 'mouseup', () => {
                this.onMouseUp();
            });

        this.renderer.addClass(this.thumb.nativeElement, 'focused');

        this.isDragging = true;

        return false;
    }

    private onMouseMove(event: MouseEvent): boolean {
        if (!this.isDragging) {
            return true;
        }

        const relativeValue = this.getRelativeX(event);

        this.value = Math.round((relativeValue * (this.max - this.min) + this.min) / this.step) * this.step;

        this.updateThumbPosition();
        this.updateTouched();

        return false;
    }

    private onMouseUp(): boolean {
        this.updateValue();

        setTimeout(() => {
            this.releaseMouseHandlers();
            this.renderer.removeClass(this.thumb.nativeElement, 'focused');
        }, 10);

        this.centerStartOffset = 0;

        this.isDragging = false;

        return false;
    }

    private getRelativeX(event: MouseEvent): number {
        const parentOffsetX = this.getParentX(event, this.bar.nativeElement) - this.centerStartOffset;
        const parentWidth = this.bar.nativeElement.clientWidth;

        const relativeValue = Math.min(1, Math.max(0, (parentOffsetX - this.centerStartOffset) / parentWidth));

        return relativeValue;
    }

    private getParentX(e: any, container: any): number {
        const rect = container.getBoundingClientRect();

        const x =
            !!e.touches ?
                e.touches[0].pageX :
                e.pageX;

        return x - rect.left;
    }

    private updateTouched() {
        this.callTouched();
    }

    private updateValue() {
        if (this.lastValue !== this.value) {
            this.lastValue = this.value;

            this.callChange(this.value);
        }
    }

    private updateThumbPosition() {
        const relativeValue = Math.min(1, Math.max(0, (this.value - this.min) / (this.max - this.min)));

        this.renderer.setStyle(this.thumb.nativeElement, 'left', relativeValue * 100 + '%');
    }

    private releaseMouseHandlers() {
        if (this.windowMouseMoveListener) {
            this.windowMouseMoveListener();
            this.windowMouseMoveListener = null;
        }

        if (this.windowMouseUpListener) {
            this.windowMouseUpListener();
            this.windowMouseUpListener = null;
        }

        this.isDragging = false;
    }
}