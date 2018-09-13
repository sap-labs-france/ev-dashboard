import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SitesDataSource } from './sites-data-source-table';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './sites-dialog-component.html',
  styleUrls: ['../dialogs.component.scss'],
})
export class SitesDialogComponent {
  public sitesDataSource: SitesDataSource;

  constructor(
      private centralServerService: CentralServerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogRef: MatDialogRef<SitesDialogComponent>,
      private router: Router,
    @Inject(MAT_DIALOG_DATA) data) {

    // Create table data source
    this.sitesDataSource = new SitesDataSource(
      this.messageService,
      this.translateService,
      this.router,
      this.centralServerService);
    // Set static filter
    this.sitesDataSource.setStaticFilters([
      { 'ExcludeSitesOfUserID': data.userID }
    ]);
  }

  add() {
    // Close and return the Site IDs
    this.dialogRef.close(
      this.sitesDataSource.getSelectedRows().map((site) => site.id));
  }

  cancel() {
    this.dialogRef.close();
  }
}
