import { Component, ElementRef, Input, NgZone, OnInit } from '@angular/core';
import * as CanvasGauges from 'canvas-gauges';

import { BaseGaugeDirective } from './base-gauge.directive';

/**
 * Implements Radial Gauge from the original library
 */
@Component({
    selector: 'app-radial-gauge',
    template: '<canvas #gauge></canvas>',
})
export class RadialGaugeComponent extends BaseGaugeDirective<CanvasGauges.RadialGauge, CanvasGauges.RadialGaugeOptions> implements OnInit {

    constructor(el: ElementRef, zone: NgZone) {
        super(el, zone);
    }

    public ngOnInit() {
        this.gauge = new CanvasGauges.RadialGauge(this.getOptions()).draw();
    }
}
