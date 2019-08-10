import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SiteUsersTableDataSource } from './site-users-table-data-source';


@Component({
  templateUrl: 'site-users-dialog.component.html',
  providers: [SiteUsersTableDataSource]
})

export class SiteUsersDialogComponent {
  public dialogTitle: String;

  constructor(
    public siteUsersTableDataSource: SiteUsersTableDataSource,
    private dialogRef: MatDialogRef<SiteUsersDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteUsersTableDataSource.setSite(data);
      this.dialogTitle = this.translateService.instant('sites.assigned_users_to_site', {'siteName': data.name});
    } else {
      this.dialogTitle = this.translateService.instant('sites.users');
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
