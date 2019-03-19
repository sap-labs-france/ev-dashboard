import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SitesFilterDataSource} from './sites-filter-data-source-table';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {KeyValue, Site} from '../../../common.types';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  styleUrls: ['../dialogs.component.scss'],
})
export class SitesFilterDialogComponent extends DialogTableDataComponent<Site> {
  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    protected dialogRef: MatDialogRef<SitesFilterDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data);
    // Default title
    if (this.title === '') {
      this.title = 'sites.select_sites';
    }
    // Default Set Filter Button Title
    if (this.buttonTitle === 'general.select') {
      this.buttonTitle = 'general.set_filter';
    }
    // Create table data source
    this.dialogDataSource = new SitesFilterDataSource(
      this.messageService,
      this.translateService,
      this.router,
      this.centralServerService);
  }

  getSelectedItems(selectedRows: Site[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({key: row.id, value: row.name, objectRef: row});
      });
    }
    return items;
  }
}
