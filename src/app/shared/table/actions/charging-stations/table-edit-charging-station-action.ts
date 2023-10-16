import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import {
  ChargingStationsAuthorizations,
  DialogParamsWithAuth,
} from '../../../../types/Authorization';
import { ChargingStation, ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditChargingStationActionDef extends TableActionDef {
  action: (
    chargingStationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<ChargingStation, ChargingStationsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditChargingStationAction extends TableEditAction {
  public getActionDef(): TableEditChargingStationActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EDIT_CHARGING_STATION,
      action: this.editChargingStation,
    };
  }

  private editChargingStation(
    chargingStationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<ChargingStation, ChargingStationsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(chargingStationDialogComponent, dialog, dialogParams, refresh);
  }
}
