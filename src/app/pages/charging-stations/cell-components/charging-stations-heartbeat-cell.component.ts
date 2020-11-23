import { Component, Input } from '@angular/core';

import { LocaleService } from '../../../services/locale.service';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation } from '../../../types/ChargingStation';

@Component({
  template: `
    <span class="charger-heartbeat" appTooltip data-offset="0px, 8px" [title]="this.row.lastSeen | amLocale:this.locale | amTimeAgo">
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
export class ChargingStationsHeartbeatCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingStation;
  public locale!: string;

  constructor(
    private localeService: LocaleService) {
    super();
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
  }
}
