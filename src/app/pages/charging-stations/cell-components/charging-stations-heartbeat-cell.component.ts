import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';

import { LocaleService } from '../../../services/locale.service';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation } from '../../../types/ChargingStation';

@Component({
  template: `
    <span class="charger-heartbeat" appTooltip data-offset="0px, 8px" [title]="row.lastSeen | appDate">
      <ng-container *ngIf="row.issuer; else externalChargingStation">
        <i class="fa fa-heartbeat charger-heartbeat-icon charger-heartbeat-ok" [class.charger-heartbeat-error]="row.inactive"></i>
        <ng-container *ngIf="row.inactive; else activeChargingStation">
          <span class="ms-1 charger-heartbeat-date charger-heartbeat-date-error">
            {{'chargers.charger_disconnected' | translate}}
          </span>
        </ng-container>
        <ng-template #activeChargingStation>
          <span class="ms-1 charger-heartbeat-date charger-heartbeat-ok">
            {{'chargers.charger_connected' | translate}}
          </span>
        </ng-template>
      </ng-container>
      <ng-template #externalChargingStation>
        <i class="fa fa-heartbeat charger-heartbeat-icon charger-heartbeat-not-applicable"></i>
        <span class="ms-1 charger-heartbeat-date charger-heartbeat-not-applicable">
          {{'chargers.status_unknown' | translate}}
        </span>
    </ng-template>
    </span>
  `,
  styleUrls: ['charging-stations-heartbeat-cell.component.scss'],
})
export class ChargingStationsHeartbeatCellComponent  extends CellContentTemplateDirective {
  @Input() public row!: ChargingStation;
  public locale!: string;
}
