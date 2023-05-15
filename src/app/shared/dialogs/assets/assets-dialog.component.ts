import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from 'types/Authorization';

import { Asset } from '../../../types/Asset';
import { KeyValue } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { AssetsDialogTableDataSource } from './assets-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class AssetsDialogComponent extends DialogTableDataComponent<Asset> {
  public constructor(
    private assetsDataSource: AssetsDialogTableDataSource,
    dialogRef: MatDialogRef<AssetsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: DialogData
  ) {
    // Super class
    super(data, dialogRef, assetsDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'assets.select_assets';
    }
    this.assetsDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: Asset[]): KeyValue[] {
    const items = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: row.id, objectRef: row });
      });
    }
    return items;
  }
}
