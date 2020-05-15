import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Company } from 'app/types/Company';
import { KeyValue } from 'app/types/GlobalType';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CompaniesDialogTableDataSource } from './companies-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  providers: [CompaniesDialogTableDataSource]
})
export class CompaniesDialogComponent extends DialogTableDataComponent<Company> {
  constructor(
      public companiesDataSource: CompaniesDialogTableDataSource,
      protected dialogRef: MatDialogRef<CompaniesDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, companiesDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'companies.select_companies';
    }
    this.companiesDataSource.destroyDatasource();
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }

  public getSelectedItems(selectedRows: Company[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({key: row.id, value: row.name, objectRef: row});
      });
    }
    return items;
  }
}
