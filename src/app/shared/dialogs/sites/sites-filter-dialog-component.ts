import {Component, Inject, Self} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {SitesFilterDataSource} from './sites-filter-data-source-table';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {KeyValue, Site} from '../../../common.types';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  providers: [SitesFilterDataSource]
})
export class SitesFilterDialogComponent extends DialogTableDataComponent<Site> {
  constructor(
    @Self() public dialogDataSource: SitesFilterDataSource,
    protected dialogRef: MatDialogRef<SitesFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef);
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
