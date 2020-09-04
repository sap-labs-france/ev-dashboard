import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { ChargingProfile } from 'app/types/ChargingProfile';
import { ChargingStation, ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { ChargingStationLimitationDialogComponent } from '../charging-station-limitation/charging-station-limitation.dialog.component';

export interface TableChargingStationsSmartChargingActionDef extends TableActionDef {
  action: (chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService,
    dialog: MatDialog, refresh?: () => Observable<void>) => void;
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

  private viewSmartCharging(chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService,
      dialog: MatDialog, refresh?: () => Observable<void>) {
    if (parseFloat(chargingStation.ocppVersion) < 1.6) {
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.smart_charging_title'),
        translateService.instant('chargers.action_error.smart_charging_charger_version'));
    } else {
      super.view(ChargingStationLimitationDialogComponent,chargingStation.id, dialog, refresh);
    }
  }
}
