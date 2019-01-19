import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SiteUsersDataSource} from './site-users-data-source-table';


@Component({
  selector: 'app-site-users-dialog-cmp',
  styleUrls: ['../../../../../shared/dialogs/dialogs.component.scss'],
  templateUrl: 'site-users.dialog.component.html'
})
export class SiteUsersDialogComponent {

  constructor(
    public siteUsersDataSource: SiteUsersDataSource,
    private dialogRef: MatDialogRef<SiteUsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteUsersDataSource.setSite(data);
    }
  }
}
