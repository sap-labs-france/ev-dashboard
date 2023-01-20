import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from 'services/window.service';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { EcowattGridMonitoringData, EcowattGridMonitoringLevel, SiteArea } from 'types/SiteArea';

@Component({
  template: `
    <div appTooltip title="{{tooltip}}">
      <div class="{{forecastLevel}}-point" (click)="openEcowattWindow()"></div>
    <div>
  `,
  selector: 'app-ecowatt-grid-forecast',
})

export class EcowattGridForecastCellComponent implements OnInit {
  @Input() public siteArea: SiteArea;
  @Input() public ecowattData: EcowattGridMonitoringData;

  public tooltip = '';
  public forecastLevel: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private translateService: TranslateService,
    private appDatePipe: AppDatePipe,
    private windowService: WindowService
  ) {}

  public ngOnInit(): void {
    this.forecastLevel = this.ecowattData.forecastLevel ?? EcowattGridMonitoringLevel.UNKNOWN;
    if (this.forecastLevel !== EcowattGridMonitoringLevel.UNKNOWN) {
      if (this.ecowattData.forecastDate) {
        this.tooltip = this.appDatePipe.transform(this.ecowattData.forecastDate, 'short');
      }
    } else {
      this.tooltip = this.translateService.instant('general.unknown');
    }
  }

  public openEcowattWindow() {
    this.windowService.openUrl('https://www.monecowatt.fr/');
  }
}
