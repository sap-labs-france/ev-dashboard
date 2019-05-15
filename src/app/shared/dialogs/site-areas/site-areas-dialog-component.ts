import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {KeyValue, SiteArea} from '../../../common.types';
import {SiteAreasDataSourceTable} from './site-areas-data-source-table';

@Component({
  templateUrl: '../dialog-table-data-component.html'
})
export class SiteAreasDialogComponent extends DialogTableDataComponent<SiteArea> {
  constructor(
      public dialogDataSource: SiteAreasDataSourceTable,
      protected dialogRef: MatDialogRef<SiteAreasDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef);
    // Default title
    if (this.title === '') {
      this.title = 'site_areas.select_site_areas';
    }
    // Set static filter
    this.dialogDataSource.setStaticFilters([
      {'ExcludeSiteAreasOfUserID': data.userID}
    ]);
  }

  getSelectedItems(selectedRows: SiteArea[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({key: row.id, value: row.name, objectRef: row});
      });
    }
    return items;
  }
}
