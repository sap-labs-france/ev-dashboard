import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SiteUsersDataSource} from './site-users-data-source-table';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-site-users-dialog-cmp',
  templateUrl: 'site-users.dialog.component.html',
  providers: [
    SiteUsersDataSource
  ]
})
export class SiteUsersDialogComponent {
  public dialogTitle: String;

  constructor(
    public siteUsersDataSource: SiteUsersDataSource,
    private dialogRef: MatDialogRef<SiteUsersDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {
    // default title
    this.dialogTitle = this.translateService.instant('sites.users');

    if (data) {
      this.siteUsersDataSource.setSite(data);
      this.dialogTitle = this.translateService.instant('sites.assigned_users_to_site', { 'siteName': data.name });
    }
  }
}
