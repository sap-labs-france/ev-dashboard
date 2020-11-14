import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Utils } from '../../../../utils/Utils';
import { SiteUsersTableDataSource } from './site-users-table-data-source';

@Component({
  templateUrl: 'site-users-dialog.component.html',
  providers: [SiteUsersTableDataSource],
})

export class SiteUsersDialogComponent {
  public dialogTitle: string;

  constructor(
    public siteUsersTableDataSource: SiteUsersTableDataSource,
    private dialogRef: MatDialogRef<SiteUsersDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteUsersTableDataSource.setSite(data);
      this.dialogTitle = this.translateService.instant('sites.assigned_users_to_site', {siteName: data.name});
    } else {
      this.dialogTitle = this.translateService.instant('sites.users');
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
