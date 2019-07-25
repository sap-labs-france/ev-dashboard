import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserSitesDataSource } from './user-sites-data-source-table';
import { TranslateService } from '@ngx-translate/core';
import { Users } from 'app/utils/Users';


@Component({
  selector: 'app-user-sites-dialog-cmp',
  templateUrl: 'user-sites.dialog.component.html',
  providers: [UserSitesDataSource]
})
export class UserSitesDialogComponent {
  public dialogTitle: String;

  constructor(
    public userSitesDataSource: UserSitesDataSource,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<UserSitesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.userSitesDataSource.setUser(data);
      this.dialogTitle = this.translateService.instant('users.assigned_sites_to_user', {'userName': Users.buildUserFullName(data) });
    } else {
      this.dialogTitle = this.translateService.instant('users.sites');
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
