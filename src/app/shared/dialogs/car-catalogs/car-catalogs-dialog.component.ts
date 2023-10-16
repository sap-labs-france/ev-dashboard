import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CarCatalog } from '../../../types/Car';
import { KeyValue } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarCatalogsDialogTableDataSource } from './car-catalogs-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class CarCatalogsDialogComponent extends DialogTableDataComponent<CarCatalog> {
  public constructor(
    protected dialogRef: MatDialogRef<CarCatalogsDialogComponent>,
    private carCatalogsDialogTableDataSource: CarCatalogsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    super(data, dialogRef, carCatalogsDialogTableDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'cars.assign_car_catalog';
    }
    this.carCatalogsDialogTableDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: CarCatalog[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({
          key: row.id.toString(),
          value: `${row.vehicleMake} ${row.vehicleModel ? row.vehicleModel : ''}`,
          objectRef: row,
        });
      });
    }
    return items;
  }
}
