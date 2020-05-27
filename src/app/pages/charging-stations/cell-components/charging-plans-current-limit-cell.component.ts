import { Component, Input } from '@angular/core';
import { ChargingProfile } from 'app/types/ChargingProfile';
import { Connector } from 'app/types/ChargingStation';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <span>
      <ng-container>
        <span class="ml-1">
          {{currentLimit}}
        </span>
      </ng-container>
    </span>
  `,
})
export class ChargingPlansCurrentLimitCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingProfile;

  public currentLimit: number;
  public currentTime = new Date();

  public ngOnInit() {
    const currentDuration = Math.round(( new Date().getTime() - new Date(this.row.profile.chargingSchedule.startSchedule).getTime()) / 1000 / 60);
    if (currentDuration < this.row.profile.chargingSchedule.duration && currentDuration > 0) {
      const currentPeriod = this.row.profile.chargingSchedule.chargingSchedulePeriod.findIndex(p => p.startPeriod > currentDuration);
      if (this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1]) {
        this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1].limit;
      }
      else {
        this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[this.row.profile.chargingSchedule.chargingSchedulePeriod.length - 1].limit;
      }
    } else {
      this.currentLimit = this.row.chargingStation.connectors[this.row.connectorID].amperageLimit;
    }

  }
}
