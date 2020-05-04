import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KeyValue } from 'app/types/GlobalType';
import { SiteArea } from 'app/types/SiteArea';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SiteAreasDialogTableDataSource } from './site-areas-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  providers: [SiteAreasDialogTableDataSource]
})
export class SiteAreasDialogComponent extends DialogTableDataComponent<SiteArea> {
  constructor(
    public dialogDataSource: SiteAreasDialogTableDataSource,
    protected dialogRef: MatDialogRef<SiteAreasDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, dialogDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'site_areas.select_site_areas';
    }
    dialogDataSource.setSitesAdminOnly(data && data.sitesAdminOnly);
  }

  public getSelectedItems(selectedRows: SiteArea[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({key: row.id, value: row.name, objectRef: row});
      });
    }
    return items;
  }
}
