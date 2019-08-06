import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Company, KeyValue } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { CompaniesDialogTableDataSource } from './companies-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  providers: [CompaniesDialogTableDataSource]
})
export class CompaniesDialogComponent extends DialogTableDataComponent<Company> {
  constructor(
      @Self() public dialogDataSource: CompaniesDialogTableDataSource,
      protected dialogRef: MatDialogRef<CompaniesDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef, dialogDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'companies.select_companies';
    }
  }

  getSelectedItems(selectedRows: Company[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({key: row.id, value: row.name, objectRef: row});
      });
    }
    return items;
  }
}
