import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingProfile } from 'app/types/ChargingProfile';
import { Utils } from 'app/utils/Utils';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <span>
      <ng-container>
        <span class="ml-1">
          {{siteAreaLimit}}
        </span>
      </ng-container>
    </span>
  `,
})
export class ChargingPlansSiteAreaLimitCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingProfile;

  public siteAreaLimit: string;

  constructor(
    private unitPipe: AppUnitPipe,
    public translateService: TranslateService,
  ) {super();
  }

  public ngOnInit() {

    this.siteAreaLimit = this.translateService.instant('chargers.smart_charging.limit_in_watts', { limitInWatts: this.row.chargingStation.siteArea.maximumPower} ); + ' '
    this.translateService.instant('chargers.smart_charging.limit_in_amps', { limitInWatts: this.unitPipe.transform(Utils.convertWattToAmp(this.row.chargingStation, this.row.chargingStation.chargePoints[this.row.chargePointID] ? this.row.chargingStation.chargePoints[this.row.chargePointID] : null, this.row.connectorID, this.row.siteArea.maximumPower))} );

  }
}
