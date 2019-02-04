import {Component, NgZone, ElementRef, OnInit} from '@angular/core';
import {BaseGauge} from './base-gauge';
import * as CanvasGauges from 'canvas-gauges';

/**
 * Implements Linear Gauge from the original library
 */
@Component({
    selector: 'app-linear-gauge',
    template: '<canvas #gauge></canvas>'
})
export class LinearGaugeComponent extends BaseGauge<CanvasGauges.LinearGauge, CanvasGauges.LinearGaugeOptions> implements OnInit {
    constructor(el: ElementRef, zone: NgZone) {
        super(el, zone);
    }

    ngOnInit() {
        this.gauge = new CanvasGauges.LinearGauge(this.getOptions()).draw();
    }
}
