import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue,  SiteArea } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SiteAreasDialogTableDataSource } from './site-areas-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html'
})
export class SiteAreasDialogComponent extends DialogTableDataComponent<SiteArea> {
  constructor(
    public dialogDataSource: SiteAreasDialogTableDataSource,
    protected dialogRef: MatDialogRef<SiteAreasDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef, dialogDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'site_areas.select_site_areas';
    }
    dialogDataSource.setSitesAdminOnly(data && data.sitesAdminOnly);
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
