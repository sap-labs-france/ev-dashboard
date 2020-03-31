import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue } from 'app/types/GlobalType';
import { Site } from 'app/types/Site';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarConstructorsTableDataSource } from './car-constructors-dialog-table-data-source';
import { CarConstructorsTable } from 'app/types/Car';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class CarConstructorsDialogComponent extends DialogTableDataComponent<CarConstructorsTable> {
  constructor(
    public dialogDataSource: CarConstructorsTableDataSource,
    protected dialogRef: MatDialogRef<CarConstructorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, dialogDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'cars.select_car_constructor';
    }
    this.dialogDataSource.destroyDatasource();
  }

  getSelectedItems(selectedRows: CarConstructorsTable[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({key: row.vehicleMake, value: row.vehicleMake, objectRef: row});
      });
    }
    return items;
  }
}
