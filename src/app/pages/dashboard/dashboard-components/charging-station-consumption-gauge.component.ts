import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RadialGaugeComponent } from 'app/shared/component/gauge/radial-gauge';

@Component({
  selector: 'app-charging-station-consumption-gauge',
  template: '<canvas #gauge></canvas>',
})
export class ChargingStationConsumptionGaugeComponent extends RadialGaugeComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() public consumption = 0;
  @Input() public maxConsumption = 0;

  constructor(el: ElementRef,
    zone: NgZone,
    private translateService: TranslateService) {
    super(el, zone);
  }

  public ngOnInit(): void {
    this.options = this.getOptions();
    this.options.title = this.translateService.instant('dashboard.consumption_gauge_title');
    this.options.units = 'kW';
    this.options.minValue = 0;
    this.options.maxValue = Math.round(this.maxConsumption / 1000);

    this.options.width = 225;
    this.options.height = 225;
    this.options.value = Math.round(this.consumption / 1000);

    // Ticks
    this.buildTicks();
    this.options.majorTicksDec = 0;
    this.options.minorTicks = 0;
    this.options.strokeTicks = false;
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
    this.options.colorBarProgress = '#009cd4';

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

  public ngAfterViewInit(): void {
    this.gauge.draw();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.options) {
      if (this.maxConsumption !== this.options.majorTicks[this.options.majorTicks.length - 1]) {
        this.options.maxValue = Math.round(this.maxConsumption / 1000);
        this.buildTicks();
        this.gauge.update(this.options);
      }
      this.options.value = Math.round(this.consumption / 1000);
      this.gauge.value = Math.round(this.consumption / 1000);
      this.gauge.draw();
    }
  }

  public buildTicks() {
    this.options.majorTicks = [];
    this.options.highlights = [];
    const tickRange = (Math.floor(Math.round(this.maxConsumption / 1000) / 5) > 0 ?
      Math.floor(Math.round(this.maxConsumption / 1000) / 5) : 1);
    let currentTick = 0;
    for (let index = 0; index < 5; index++) {
      this.options.majorTicks = ([...this.options.majorTicks, currentTick] as number[]);
      switch (index) {
        case 3:
          this.options.highlights.push({ from: 0, to: currentTick, color: 'rgba(0,255,0,.35)' });
          break;
        case 4:
          this.options.highlights.push({ from: this.options.highlights[0].to, to: currentTick, color: 'rgba(255,255,0,.45)' });
          break;
        default:
          break;
      }
      currentTick += tickRange;
    }
    this.options.highlights.push({
      from: this.options.highlights[1].to,
      to: Math.round(this.maxConsumption / 1000),
      color: 'rgba(255,30,0,.55)',
    });
    this.options.majorTicks = ([...this.options.majorTicks, Math.round(this.maxConsumption / 1000)] as number[]);
  }

}
