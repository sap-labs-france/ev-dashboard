import { Component, Input } from '@angular/core';
import { Charger } from '../../../common.types';
import { LocaleService } from '../../../services/locale.service';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <span class="charger-heartbeat" appTooltip
        data-placement="bottom" data-offset="0px, 8px" data-toggle="tooltip"
        [attr.data-original-title]="this.row.lastHeartBeat | amLocale:this.locale | amTimeAgo">
      <i class="fa fa-heartbeat charger-heartbeat-icon charger-heartbeat-ok" [class.charger-heartbeat-error]="row.inactive"></i>
      <ng-container *ngIf="row.inactive">
        <span class="ml-1 charger-heartbeat-date charger-heartbeat-date-error">
          {{'chargers.charger_disconnected' | translate}}
        </span>
      </ng-container>
      <ng-container *ngIf="!row.inactive">
        <span class="ml-1 charger-heartbeat-date charger-heartbeat-ok">
          {{'chargers.charger_connected' | translate}}
        </span>
      </ng-container>
    </span>
  `,
})
export class ChargingStationsHeartbeatCellComponent extends CellContentTemplateComponent {
  @Input() row: Charger;
  public locale: string;

  constructor(
      private localeService: LocaleService) {
    super();
    this.locale = this.localeService.getCurrentLocaleJS();
  }
}
