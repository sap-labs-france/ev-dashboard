import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingProfile, RecurrencyKindType } from 'app/types/ChargingProfile';
import { Utils } from 'app/utils/Utils';
import * as moment from 'moment';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <span>
      <ng-container>
        <span class="ml-1">
          {{formattedLimit}}
        </span>
      </ng-container>
    </span>
  `,
})
export class ChargingPlansCurrentLimitCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingProfile;

  public currentLimit: number;
  public currentTime = new Date();
  public formattedLimit: string;

  constructor(
    private unitPipe: AppUnitPipe,
    public translateService: TranslateService,
  ) {
    super();
  }

  public ngOnInit() {

    if (this.row.profile.recurrencyKind === RecurrencyKindType.DAILY) {
      const mmtStart = moment(this.row.profile.chargingSchedule.startSchedule);
      const currentTimeOnStart = moment(mmtStart);
      currentTimeOnStart.set('hour', new Date().getHours());
      currentTimeOnStart.set('minute', new Date().getMinutes());
      currentTimeOnStart.set('second', new Date().getSeconds());
      // Difference in seconds
      let currentDuration = currentTimeOnStart.diff(mmtStart, 'seconds');
      console.log(mmtStart);
      console.log(currentTimeOnStart);
      console.log(currentDuration);
      if (currentDuration > 0) {
        const currentPeriod = this.row.profile.chargingSchedule.chargingSchedulePeriod.findIndex(p => p.startPeriod > currentDuration);
        if (this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1]) {
          this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1].limit;
        } else {
          this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[this.row.profile.chargingSchedule.chargingSchedulePeriod.length - 1].limit;
        }
      } else if (this.row.profile.chargingSchedule.chargingSchedulePeriod.length > 1) {
        currentDuration = 86400 + currentDuration;
        console.log(currentDuration);
        const currentPeriod = this.row.profile.chargingSchedule.chargingSchedulePeriod.findIndex(p => p.startPeriod > currentDuration);
        if (this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1]) {
          this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1].limit;
        } else {
          this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[this.row.profile.chargingSchedule.chargingSchedulePeriod.length - 1].limit;
        }
      } else {
        if (this.row.connectorID === 0) {
          this.currentLimit = Math.round(this.row.chargingStation.maximumPower / 230);
        } else {
          this.currentLimit = this.row.chargingStation.connectors[this.row.connectorID - 1].amperageLimit;
        }
      }
    } else {
      const currentDuration = Math.round((new Date().getTime() - new Date(this.row.profile.chargingSchedule.startSchedule).getTime()) / 1000 / 60);
      if (currentDuration < this.row.profile.chargingSchedule.duration && currentDuration > 0) {
        const currentPeriod = this.row.profile.chargingSchedule.chargingSchedulePeriod.findIndex(p => p.startPeriod > currentDuration);
        if (this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1]) {
          this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[currentPeriod - 1].limit;
        } else {
          this.currentLimit = this.row.profile.chargingSchedule.chargingSchedulePeriod[this.row.profile.chargingSchedule.chargingSchedulePeriod.length - 1].limit;
        }
      } else if (this.row.connectorID === 0) {
        this.currentLimit = Math.round(this.row.chargingStation.maximumPower / 230);
      } else {
        this.currentLimit = this.row.chargingStation.connectors[this.row.connectorID - 1].amperageLimit;
      }
    }
    this.formattedLimit = Utils.convertAmpToWattString(this.row.chargingStation, this.row.chargingStation.chargePoints ? this.row.chargingStation.chargePoints[this.row.chargePointID] : null,
      this.row.connectorID, this.unitPipe, this.currentLimit, 'kW', true) + ' ' +
      this.translateService.instant('chargers.smart_charging.limit_in_amps', { limitInAmps: this.currentLimit });
  }
}
