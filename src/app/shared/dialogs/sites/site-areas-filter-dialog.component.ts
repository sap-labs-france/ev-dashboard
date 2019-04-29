import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {KeyValue,  SiteArea} from '../../../common.types';
import {SiteAreasFilterDataSourceTable} from './site-areas-filter-data-source-table';

@Component({
  templateUrl: '../dialog-table-data-component.html'
})
export class SiteAreasFilterDialogComponent extends DialogTableDataComponent<SiteArea> {
  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    protected dialogRef: MatDialogRef<SiteAreasFilterDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data);
    // Default title
    if (this.title === '') {
      this.title = 'site_areas.select_site_areas';
    }
    // Create table data source
    this.dialogDataSource = new SiteAreasFilterDataSourceTable(
      this.messageService,
      this.router,
      this.centralServerService
    );
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
