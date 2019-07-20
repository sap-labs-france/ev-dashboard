import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue, Site } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SitesDataSource } from './sites-data-source-table';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  providers: [SitesDataSource]
})
export class SitesDialogComponent extends DialogTableDataComponent<Site> {
  constructor(
    @Self() public dialogDataSource: SitesDataSource,
    protected dialogRef: MatDialogRef<SitesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef);
    // Default title
    if (this.title === '') {
      this.title = 'sites.select_sites';
    }
    // Set static filter
    this.dialogDataSource.setStaticFilters([
      {'ExcludeSitesOfUserID': data.userID}
    ]);
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
