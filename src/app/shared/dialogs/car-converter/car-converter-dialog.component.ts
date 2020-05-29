import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChargeStandardTable } from 'app/types/Car';
import { KeyValue } from 'app/types/GlobalType';
import { Utils } from 'app/utils/Utils';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarConverterDialogTableDataSource } from './car-converter-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class CarConverterDialogComponent extends DialogTableDataComponent<ChargeStandardTable> {
  constructor(
    protected dialogRef: MatDialogRef<CarConverterDialogComponent>,
    private carConverterDialogTableDataSource: CarConverterDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, carConverterDialogTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'cars.assign_converter';
    }
    this.carConverterDialogTableDataSource.setCar(data.carCatalog);
    this.carConverterDialogTableDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: ChargeStandardTable[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        row.id = row.type;
        items.push({
          key: row.type,
          value: Utils.buildConverterName(row),
          objectRef: row
        });
      });
    }
    return items;
  }
}
