import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Building } from 'app/types/Building';
import { KeyValue } from 'app/types/GlobalType';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { BuildingsDialogTableDataSource } from './buildings-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class BuildingsDialogComponent extends DialogTableDataComponent<Building> {
  constructor(
    private buildingsDataSource: BuildingsDialogTableDataSource,
    dialogRef: MatDialogRef<BuildingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, buildingsDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'buildings.select_buildings';
    }
    this.buildingsDataSource.destroyDatasource();
  }

  getSelectedItems(selectedRows: Building[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({key: row.id, value: row.id, objectRef: row});
      });
    }
    return items;
  }
}
