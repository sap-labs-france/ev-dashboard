import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue, Site } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SitesDialogTableDataSource } from './sites-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  providers: [SitesDialogTableDataSource]
})
export class SitesDialogComponent extends DialogTableDataComponent<Site> {
  constructor(
    @Self() public dialogDataSource: SitesDialogTableDataSource,
    protected dialogRef: MatDialogRef<SitesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef, dialogDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'sites.select_sites';
    }
  }

  getSelectedItems(selectedRows: Site[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({key: row.id, value: row.name, objectRef: row});
      });
    }
    return items;
  }
}
