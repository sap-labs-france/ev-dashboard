import {Component, Inject, Self} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {CompaniesFilterDataSource} from './companies-filter-data-source-table';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {KeyValue, Company} from '../../../common.types';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  providers: [CompaniesFilterDataSource]
})
export class CompaniesFilterDialogComponent extends DialogTableDataComponent<Company> {
  constructor(
      @Self() public dialogDataSource: CompaniesFilterDataSource,
      protected dialogRef: MatDialogRef<CompaniesFilterDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef);
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
