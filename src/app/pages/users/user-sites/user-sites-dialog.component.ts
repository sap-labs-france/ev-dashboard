import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { DialogParams } from '../../../types/Authorization';
import { User } from '../../../types/User';
import { Users } from '../../../utils/Users';
import { Utils } from '../../../utils/Utils';
import { UserSitesTableDataSource } from './user-sites-table-data-source';

@Component({
  templateUrl: 'user-sites-dialog.component.html',
  styleUrls: ['user-sites-dialog.component.scss'],
  providers: [UserSitesTableDataSource],
})
export class UserSitesDialogComponent {
  public dialogTitle: string;

  public constructor(
    public userSitesTableDataSource: UserSitesTableDataSource,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<UserSitesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<User>
  ) {
    if (dialogParams) {
      if (dialogParams.dialogData) {
        this.userSitesTableDataSource.setUser(dialogParams.dialogData);
        this.dialogTitle = this.translateService.instant('users.assigned_sites_to_user', {
          userName: Users.buildUserFullName(dialogParams.dialogData),
        });
      } else {
        this.dialogTitle = this.translateService.instant('users.sites');
      }
      this.userSitesTableDataSource.setMode(
        Utils.getTableDataSourceModeFromDialogMode(dialogParams.dialogMode)
      );
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
