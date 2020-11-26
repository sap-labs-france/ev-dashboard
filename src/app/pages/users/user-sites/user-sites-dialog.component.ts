import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { User } from '../../../types/User';
import { Users } from '../../../utils/Users';
import { Utils } from '../../../utils/Utils';
import { UserSitesTableDataSource } from './user-sites-table-data-source';

@Component({
  selector: 'app-user-sites-dialog',
  templateUrl: 'user-sites-dialog.component.html',
  providers: [UserSitesTableDataSource],
})
export class UserSitesDialogComponent {
  public dialogTitle: string;

  constructor(
    public userSitesTableDataSource: UserSitesTableDataSource,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<UserSitesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: User) {
    if (data) {
      this.userSitesTableDataSource.setUser(data);
      this.dialogTitle = this.translateService.instant('users.assigned_sites_to_user', {userName: Users.buildUserFullName(data) });
    } else {
      this.dialogTitle = this.translateService.instant('users.sites');
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
