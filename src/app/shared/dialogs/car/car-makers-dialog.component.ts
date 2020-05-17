import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CarMakersTable } from 'app/types/Car';
import { KeyValue } from 'app/types/GlobalType';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarMakersTableDataSource } from './car-makers-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class CarMakersDialogComponent extends DialogTableDataComponent<CarMakersTable> {
  constructor(
    public carMakersDataSource: CarMakersTableDataSource,
    protected dialogRef: MatDialogRef<CarMakersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, carMakersDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'cars.select_car_maker';
    }
    this.carMakersDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: CarMakersTable[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({ key: row.carMaker, value: row.carMaker, objectRef: row });
      });
    }
    return items;
  }
}
