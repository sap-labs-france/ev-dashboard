import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CarConverter } from 'app/types/Car';
import { KeyValue } from 'app/types/GlobalType';
import { Utils } from 'app/utils/Utils';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CarConvertersDialogTableDataSource } from './car-converters-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class CarConvertersDialogComponent extends DialogTableDataComponent<CarConverter> {
  constructor(
    protected dialogRef: MatDialogRef<CarConvertersDialogComponent>,
    private translateService: TranslateService,
    private carConvertersDialogTableDataSource: CarConvertersDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, carConvertersDialogTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'cars.assign_converter';
    }
    this.carConvertersDialogTableDataSource.setCarCatalog(data.carCatalog);
    this.carConvertersDialogTableDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: CarConverter[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        row.id = row.type;
        items.push({
          key: row.type,
          value: Utils.buildConverterName(row, this.translateService),
          objectRef: row
        });
      });
    }
    return items;
  }
}
