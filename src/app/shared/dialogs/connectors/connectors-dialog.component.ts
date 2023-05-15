import { Component, Inject } from '@angular/core';
import { Connector } from 'types/ChargingStation';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utils } from 'utils/Utils';
import { KeyValue } from 'types/GlobalType';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { ChargingStationConnectorsDialogTableDataSource } from './connectors-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class ChargingStationConnectorsDialogComponent extends DialogTableDataComponent<Connector> {
  public constructor(
    private chargingStationConnectorsDataSource: ChargingStationConnectorsDialogTableDataSource,
    dialogRef: MatDialogRef<ChargingStationConnectorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    super(data, dialogRef, chargingStationConnectorsDataSource);
    if (Utils.isEmptyString(this.title)) {
      this.title = 'reservations.select_connector';
    }
    this.chargingStationConnectorsDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: Connector[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({
          key: row.connectorId.toString(),
          value: Utils.getConnectorLetterFromConnectorID(row.connectorId),
          objectRef: row,
        });
      });
    }
    return items;
  }
}
