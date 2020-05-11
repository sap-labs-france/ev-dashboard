import { ChargingStation, ChargingStationButtonAction } from 'app/types/ChargingStation';

import { ChargingStationDialogComponent } from 'app/pages/charging-stations/charging-station/charging-station-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableEditAction } from './table-edit-action';

export class TableEditChargingStationAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EDIT_CHARGING_STATION,
      action: this.editChargingStation,
    };
  }

  private editChargingStation(chargingStation: ChargingStation, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(ChargingStationDialogComponent, chargingStation, dialog, refresh);
  }
}
