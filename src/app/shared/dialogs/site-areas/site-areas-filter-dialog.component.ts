import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue,  SiteArea } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SiteAreasFilterDataSourceTable } from './site-areas-filter-data-source-table';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  providers: [SiteAreasFilterDataSourceTable]
})
export class SiteAreasFilterDialogComponent extends DialogTableDataComponent<SiteArea> {
  constructor(
    @Self() public dialogDataSource: SiteAreasFilterDataSourceTable,
    protected dialogRef: MatDialogRef<SiteAreasFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef);
    // Default title
    if (this.title === '') {
      this.title = 'site_areas.select_site_areas';
    }
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
