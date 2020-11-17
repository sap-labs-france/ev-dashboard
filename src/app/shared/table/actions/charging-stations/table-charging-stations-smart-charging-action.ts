import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { DialogService } from '../../../../services/dialog.service';
import { ChargingStation, ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableChargingStationsSmartChargingActionDef extends TableActionDef {
  action: (chargingStationDialogComponent: ComponentType<unknown>, chargingStation: ChargingStation, dialogService: DialogService,
    translateService: TranslateService, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableChargingStationsSmartChargingAction extends TableViewAction {
  public getActionDef(): TableChargingStationsSmartChargingActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.SMART_CHARGING,
      icon: 'battery_charging_full',
      name: 'chargers.smart_charging_action',
      tooltip: 'general.tooltips.smart_charging',
      action: this.viewSmartCharging,
    };
  }

  private viewSmartCharging(chargingStationDialogComponent: ComponentType<unknown>, chargingStation: ChargingStation,
    dialogService: DialogService, translateService: TranslateService,
    dialog: MatDialog, refresh?: () => Observable<void>) {
    if (parseFloat(chargingStation.ocppVersion) < 1.6) {
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.smart_charging_title'),
        translateService.instant('chargers.action_error.smart_charging_charger_version'));
    } else {
      super.view(chargingStationDialogComponent, chargingStation.id, dialog, refresh);
    }
  }
}
