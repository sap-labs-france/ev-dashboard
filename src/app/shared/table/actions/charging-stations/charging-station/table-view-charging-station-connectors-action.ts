import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData, DialogParams } from 'types/Authorization';
import { TableActionDef } from 'types/Table';
import { ChargingStationButtonAction } from 'types/ChargingStation';
import { TableViewAction } from '../../table-view-action';

export interface ChargingStationConnectorsDialogData extends DialogData {
  chargingStationID?: string;
  connectorID?: number;
}
export interface TableViewChargingStationConnectorsActionDef extends TableActionDef {
  action: (
    connectorsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<ChargingStationConnectorsDialogData>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewChargingStationConnectorsAction extends TableViewAction {
  public getActionDef(): TableViewChargingStationConnectorsActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.VIEW_CHARGING_STATION_CONNECTORS,
      action: this.viewChargingStationConnectors,
    };
  }

  private viewChargingStationConnectors(
    chargingStationConnectorsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<ChargingStationConnectorsDialogData>,
    refresh?: () => Observable<void>
  ) {
    super.view(chargingStationConnectorsDialogComponent, dialog, dialogParams, refresh);
  }
}
