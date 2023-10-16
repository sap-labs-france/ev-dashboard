import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Company } from '../../../types/Company';
import { KeyValue } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CompaniesDialogTableDataSource } from './companies-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  providers: [CompaniesDialogTableDataSource],
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class CompaniesDialogComponent extends DialogTableDataComponent<Company> {
  public constructor(
    public companiesDataSource: CompaniesDialogTableDataSource,
    protected dialogRef: MatDialogRef<CompaniesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    // Super class
    super(data, dialogRef, companiesDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'companies.select_companies';
    }
    this.companiesDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: Company[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: row.name, objectRef: row });
      });
    }
    return items;
  }
}
