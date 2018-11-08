import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SitesDataSource} from './sites-data-source-table';
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
export class SitesDialogComponent extends DialogTableDataComponent<Site> {
  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    protected dialogRef: MatDialogRef<SitesDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, 'sites.select_sites');
    // Create table data source
    this.dialogDataSource = new SitesDataSource(
      this.messageService,
      this.translateService,
      this.router,
      this.centralServerService);
    // Set static filter
    this.dialogDataSource.setStaticFilters([
      {'ExcludeSitesOfUserID': data.userID}
    ]);
  }

  getSelectedItems(selectedRows: Site[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({key: row.id, value: row.name});
      });
    }
    return items;
  }
}
