import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogTableDataComponent } from 'shared/dialogs/dialog-table-data.component';
import { ChargingStation } from 'types/ChargingStation';
import { Utils } from 'utils/Utils';
import { KeyValue } from '../../../../types/GlobalType';
import { ReservableChargingStationsDialogTableDataSource } from './reservable-charging-stations-dialog-table-data-source';

@Component({
  templateUrl: '../../dialog-table-data.component.html',
  styleUrls: ['../../dialog-table-data.component.scss'],
})
export class ReservableChargingStationsDialogComponent extends DialogTableDataComponent<ChargingStation> {
  public constructor(
    private reservableChargingStationsDataSource: ReservableChargingStationsDialogTableDataSource,
    dialogRef: MatDialogRef<ReservableChargingStationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    // Super class
    super(data, dialogRef, reservableChargingStationsDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'chargers.select_chargers';
    }
    this.reservableChargingStationsDataSource.destroyDataSource();
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
