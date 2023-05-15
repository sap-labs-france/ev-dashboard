import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ChargingStation } from '../../../types/ChargingStation';
import { KeyValue } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { ChargingStationsDialogTableDataSource } from './charging-stations-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class ChargingStationsDialogComponent extends DialogTableDataComponent<ChargingStation> {
  public constructor(
    private chargingStationsDataSource: ChargingStationsDialogTableDataSource,
    dialogRef: MatDialogRef<ChargingStationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    // Super class
    super(data, dialogRef, chargingStationsDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'chargers.select_chargers';
    }
    this.chargingStationsDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: ChargingStation[]): KeyValue[] {
    const items = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: row.id, objectRef: row });
      });
    }
    return items;
  }
}
