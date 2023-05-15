import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { Site } from '../../../types/Site';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { SitesDialogTableDataSource } from './sites-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  providers: [SitesDialogTableDataSource],
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class SitesDialogComponent extends DialogTableDataComponent<Site> {
  public constructor(
    public sitesDataSource: SitesDialogTableDataSource,
    protected dialogRef: MatDialogRef<SitesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    // Super class
    super(data, dialogRef, sitesDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'sites.select_sites';
    }
    this.sitesDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: Site[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: row.name, objectRef: row });
      });
    }
    return items;
  }
}
