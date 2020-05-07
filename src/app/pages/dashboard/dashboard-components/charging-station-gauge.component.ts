import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RadialGaugeComponent } from 'app/shared/component/gauge/radial-gauge';

@Component({
  selector: 'app-charging-station-gauge',
  template: '<canvas #gauge></canvas>',
})
export class ChargingStationGaugeComponent extends RadialGaugeComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() public activeChargers = 0;
  @Input() public maxChargers = 0;

  constructor(el: ElementRef,
    zone: NgZone,
    private translateService: TranslateService) {
    super(el, zone);
  }

  public ngOnInit(): void {
    this.options = this.getOptions();
    this.options.title = this.translateService.instant('dashboard.active_stations_gauge_title');
    this.options.units = this.translateService.instant('dashboard.active_stations_gauge_unit');
    this.options.minValue = 0;
    this.options.maxValue = this.maxChargers;

    this.options.width = 225;
    this.options.height = 225;
    this.options.value = this.activeChargers;

    // Ticks
    this.buildTicks();
    this.options.majorTicksDec = 0;
    this.options.minorTicks = 0;
    this.options.strokeTicks = false;
    this.options.highlightsWidth = 0;

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
    this.options.colorBarProgress = '#009cd4';

    // value box
    this.options.valueBox = true;
    this.options.valueBoxStroke = 0;
    this.options.valueTextShadow = false;
    this.options.valueDec = 0;
    this.options.valueInt = 0;

    // Fonts
    this.options.fontTitleSize = 30;
    this.options.fontValueSize = 50;

    super.ngOnInit();
  }

  public ngAfterViewInit(): void {
    this.gauge.draw();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.options && changes.maxChargers && changes.maxChargers.currentValue !== changes.maxChargers.previousValue) {
      this.options.maxValue = this.maxChargers;
      this.buildTicks();
      this.gauge.update(this.options);
      this.gauge.draw();
    }
    if (this.options && changes.activeChargers && changes.activeChargers.currentValue !== this.gauge.value) {
      this.options.value = this.activeChargers;
      this.gauge.value = this.activeChargers;
      this.gauge.draw();
    }
  }

  public buildTicks() {
    this.options.majorTicks = [];
    const tickRange = (Math.floor(this.maxChargers / 5) > 0 ? Math.floor(this.maxChargers / 5) : 1);
    for (let currentTick = 0; currentTick < this.maxChargers; currentTick += tickRange) {
      this.options.majorTicks = ([...this.options.majorTicks, currentTick] as number[]);
    }
    this.options.majorTicks = ([...this.options.majorTicks, this.maxChargers] as number[]);
  }

}
