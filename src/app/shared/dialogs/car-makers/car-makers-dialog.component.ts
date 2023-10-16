import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CarMaker } from '../../../types/Car';
import { KeyValue } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarMakersTableDataSource } from './car-makers-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class CarMakersDialogComponent extends DialogTableDataComponent<CarMaker> {
  public constructor(
    public carMakersDataSource: CarMakersTableDataSource,
    protected dialogRef: MatDialogRef<CarMakersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    // Super class
    super(data, dialogRef, carMakersDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'cars.select_car_maker';
    }
    this.carMakersDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: CarMaker[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.carMaker, value: row.carMaker, objectRef: row });
      });
    }
    return items;
  }
}
