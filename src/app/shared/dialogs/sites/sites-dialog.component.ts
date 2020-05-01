import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue } from 'app/types/GlobalType';
import { Site } from 'app/types/Site';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SitesDialogTableDataSource } from './sites-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class SitesDialogComponent extends DialogTableDataComponent<Site> {
  constructor(
    public dialogDataSource: SitesDialogTableDataSource,
    protected dialogRef: MatDialogRef<SitesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, dialogDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'sites.select_sites';
    }
    this.dialogDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: Site[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({key: row.id, value: row.name, objectRef: row});
      });
    }
    return items;
  }
}
