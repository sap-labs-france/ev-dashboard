import { Component, OnInit, ElementRef, NgZone, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RadialGaugeComponent } from 'app/shared/component/gauge/radial-gauge';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-consumption-gauge',
    template: '<canvas #gauge></canvas>'
})
export class ConsumptionGaugeComponent extends RadialGaugeComponent implements OnInit, AfterViewInit, OnChanges {

    @Input() consumption = 0;

  constructor(el: ElementRef,
                zone: NgZone,
                private translateService: TranslateService) {
    super(el, zone);
  }

  ngOnInit(): void {
    this.options = this.getOptions();
    this.options.title = this.translateService.instant('dashboard.consumption_gauge_title');
    this.options.units = 'kW';
    this.options.minValue = 0;
    this.options.maxValue = 500;

    this.options.width = 250;
    this.options.height = 250;
    this.options.value = this.consumption;

    // Ticks
    this.options.majorTicks = [0, 100, 200, 300, 400, 500];
    this.options.majorTicksDec = 0;
    this.options.minorTicks = 0;
    this.options.strokeTicks = false;
    this.options.highlights = [
        { 'from': 0, 'to': 300, 'color': 'rgba(0,255,0,.35)' },
        { 'from': 300, 'to': 400, 'color': 'rgba(255,255,0,.45)' },
        { 'from': 400, 'to': 500, 'color': 'rgba(255,30,0,.55)' }
    ];
    this.options.highlightsWidth = 3;

    // borders
    this.options.borders = true;
    this.options.borderOuterWidth = 0;
    this.options.borderInnerWidth = 0;
    this.options.borderMiddleWidth = 0;
    this.options.borderShadowWidth = 0;

    // progress bar
    this.options.barProgress = true;
    this.options.barWidth = 8;

    // needle
    this.options.needle = true;
    this.options.needleEnd = 85;
    this.options.needleWidth = 2;
    this.options.needleCircleSize = 1;

    // animation
    this.options.animation = true;
    this.options.animationDuration = 250;
    this.options.animationRule = 'linear';
    this.options.animatedValue = true;
    this.options.animateOnInit = false;

    // color
    this.options.colorTitle = '#3C4858';
    this.options.colorBorderOuter = 'transparent';
    this.options.colorBorderMiddle = 'transparent';
    this.options.colorBorderInner = 'transparent';
    this.options.colorValueBoxRect = 'transparent';
    this.options.colorValueBoxBackground = 'transparent';
    this.options.colorValueBoxShadow = 'transparent';
    this.options.colorBarProgress = '#00bcd4';

    // value box
    this.options.valueBox = true;
    this.options.valueBoxStroke = 0;
    this.options.valueTextShadow = false;
    this.options.valueDec = 0;

    // Fonts
    this.options.fontTitleSize = 30;
    this.options.fontValueSize = 50;

    super.ngOnInit();
  }

  ngAfterViewInit(): void {
    this.gauge.draw();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (this.options) {
        this.options.value = this.consumption;
        this.gauge.value = this.consumption;
        this.gauge.draw();
      }
  }

}
