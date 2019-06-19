import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SiteUsersDataSource } from './site-users-data-source-table';


@Component({
  selector: 'app-site-users-dialog-cmp',
  templateUrl: 'site-users.dialog.component.html',
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
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
