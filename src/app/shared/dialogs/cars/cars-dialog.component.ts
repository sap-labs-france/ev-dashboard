import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Car } from 'types/Car';
import { KeyValue } from 'types/GlobalType';
import { Utils } from 'utils/Utils';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarsDialogTableDataSource } from './cars-dialog-table-data-source';

@Component({
    templateUrl: '../dialog-table-data.component.html',
})
export class CarsDialogComponent extends DialogTableDataComponent<Car> {
    constructor(
        protected dialogRef: MatDialogRef<CarsDialogComponent>,
        private carsDialogTableDataSource: CarsDialogTableDataSource,
        public translateService: TranslateService,
        @Inject(MAT_DIALOG_DATA) data: any) {
        super(data, dialogRef, carsDialogTableDataSource);
        // Default title
        if (this.title === '') {
            this.title = 'cars.select_car';
        }
        this.carsDialogTableDataSource.destroyDatasource();
    }

    public getSelectedItems(selectedRows: Car[]): KeyValue[] {
      const items: KeyValue[] = [];
      if (selectedRows && selectedRows.length > 0) {
          selectedRows.forEach((row) => {
              items.push({ key: row.id, value: Utils.buildCarName(row, this.translateService), objectRef: row });
          });
      }
      return items;
    }
}
