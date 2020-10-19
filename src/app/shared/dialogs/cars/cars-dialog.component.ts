import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Car } from 'app/types/Car';
import { KeyValue } from 'app/types/GlobalType';
import { Utils } from 'app/utils/Utils';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarsDialogTableDataSource } from './cars-dialog-table-data-source';

@Component({
    templateUrl: '../dialog-table-data.component.html',
})
export class CarsDialogComponent extends DialogTableDataComponent<Car> {
    constructor(
        protected dialogRef: MatDialogRef<CarsDialogComponent>,
        private carsDialogTableDataSource: CarsDialogTableDataSource,
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
                items.push({ key: row.id, value: Utils.buildCarName(row), objectRef: row });
            });
        }
        return items;
    }
}
