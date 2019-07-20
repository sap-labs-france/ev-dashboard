
import { Component, ElementRef, Input, NgZone, OnInit } from '@angular/core';
import * as CanvasGauges from 'canvas-gauges';
import { BaseGauge } from './base-gauge';

/**
 * Implements Radial Gauge from the original library
 */
@Component({
    selector: 'app-radial-gauge',
    template: '<canvas #gauge></canvas>'
})
export class RadialGaugeComponent extends BaseGauge<CanvasGauges.RadialGauge, CanvasGauges.RadialGaugeOptions> implements OnInit {

    constructor(el: ElementRef, zone: NgZone) {
        super(el, zone);
    }

    ngOnInit() {
        this.gauge = new CanvasGauges.RadialGauge(this.getOptions()).draw();
    }
}
