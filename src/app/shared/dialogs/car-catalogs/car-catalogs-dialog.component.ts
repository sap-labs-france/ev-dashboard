import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CarCatalog } from '../../../types/Car';
import { KeyValue } from '../../../types/GlobalType';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarCatalogsDialogTableDataSource } from './car-catalogs-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class CarCatalogsDialogComponent extends DialogTableDataComponent<CarCatalog> {
  constructor(
    protected dialogRef: MatDialogRef<CarCatalogsDialogComponent>,
    private carCatalogsDialogTableDataSource: CarCatalogsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, carCatalogsDialogTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'cars.assign_car_catalog';
    }
    this.carCatalogsDialogTableDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: CarCatalog[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({
          key: row.id.toString(),
          value: `${row.vehicleMake} ${row.vehicleModel ? row.vehicleModel : ''}`, objectRef: row
        });
      });
    }
    return items;
  }
}
