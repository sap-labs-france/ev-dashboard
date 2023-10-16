import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { SiteArea } from '../../../types/SiteArea';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SiteAreasDialogTableDataSource } from './site-areas-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  providers: [SiteAreasDialogTableDataSource],
  styleUrls: ['../dialog-table-data-xl.component.scss'],
})
export class SiteAreasDialogComponent extends DialogTableDataComponent<SiteArea> {
  public constructor(
    public siteAreasDataSource: SiteAreasDialogTableDataSource,
    protected dialogRef: MatDialogRef<SiteAreasDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    // Super class
    super(data, dialogRef, siteAreasDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'site_areas.select_site_areas';
    }
    this.siteAreasDataSource.destroyDataSource();
    siteAreasDataSource.setSitesAdminOnly(data && data.sitesAdminOnly);
  }

  public getSelectedItems(selectedRows: SiteArea[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: row.name, objectRef: row });
      });
    }
    return items;
  }
}
