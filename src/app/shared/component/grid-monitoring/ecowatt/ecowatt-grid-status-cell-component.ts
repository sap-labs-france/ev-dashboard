import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from 'services/window.service';
import { AppUnitPipe } from 'shared/formatters/app-unit.pipe';
import { EcowattGridMonitoringData, EcowattGridMonitoringLevel, SiteArea } from 'types/SiteArea';

@Component({
  template: `
    <div appTooltip title="{{tooltip}}">
      <div class="{{currentLevel}}-point" (click)="openEcowattWindow()"></div>
    <div>
  `,
  selector: 'app-ecowatt-grid-status',
})

export class EcowattGridStatusCellComponent implements OnInit {
  @Input() public siteArea: SiteArea;
  @Input() public ecowattData: EcowattGridMonitoringData;

  public tooltip = '';
  public currentLevel: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private translateService: TranslateService,
    private appUnitPipe: AppUnitPipe,
    private windowService: WindowService
  ) {}

  public ngOnInit(): void {
    this.currentLevel = this.ecowattData.currentLevel ?? EcowattGridMonitoringLevel.UNKNOWN;
    if (this.currentLevel !== EcowattGridMonitoringLevel.UNKNOWN) {
      if (this.ecowattData.levelOverridden) {
        let siteAreaNewMaximumPower: number;
        let ecowattLevelPercent: number;
        switch (this.ecowattData.currentLevel) {
          case EcowattGridMonitoringLevel.LEVEL_GREEN:
            if (this.ecowattData.levelGreenPercent) {
              siteAreaNewMaximumPower = this.siteArea.maximumPower * (this.ecowattData.levelGreenPercent / 100);
              ecowattLevelPercent = this.ecowattData.levelGreenPercent;
            }
            break;
          case EcowattGridMonitoringLevel.LEVEL_ORANGE:
            if (this.ecowattData.levelOrangePercent) {
              siteAreaNewMaximumPower = this.siteArea.maximumPower * (this.ecowattData.levelOrangePercent / 100);
              ecowattLevelPercent = this.ecowattData.levelOrangePercent;
            }
            break;
          case EcowattGridMonitoringLevel.LEVEL_RED:
            if (this.ecowattData.levelRedPercent) {
              siteAreaNewMaximumPower = this.siteArea.maximumPower * (this.ecowattData.levelRedPercent / 100);
              ecowattLevelPercent = this.ecowattData.levelRedPercent;
            }
            break;
        }
        // Build the tooltip
        this.tooltip = `${this.translateService.instant('site_areas.site_area_power')} `;
        this.tooltip += `${this.appUnitPipe.transform(siteAreaNewMaximumPower, 'W', 'kW', true, 1, 0, 0)} `;
        this.tooltip += `(${this.appUnitPipe.transform(this.siteArea.maximumPower, 'W', 'kW', true, 1, 0, 0)} * ${ecowattLevelPercent} %)`;
      }
    } else {
      this.tooltip = this.translateService.instant('general.unknown');
    }
  }

  public openEcowattWindow() {
    this.windowService.openUrl('https://www.monecowatt.fr/');
  }
}
