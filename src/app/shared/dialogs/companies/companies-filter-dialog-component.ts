import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CompaniesFilterDataSource} from './companies-filter-data-source-table';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {KeyValue, Company} from '../../../common.types';
import { SpinnerService } from 'app/services/spinner.service';

@Component({
  templateUrl: '../dialog-table-data-component.html'
})
export class CompaniesFilterDialogComponent extends DialogTableDataComponent<Company> {
  constructor(
      public dialogDataSource: CompaniesFilterDataSource,
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
