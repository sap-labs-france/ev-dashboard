import {Inject} from '@angular/core';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import 'rxjs/add/operator/mergeMap';
import {LocaleService} from '../../../services/locale.service';
import {CentralServerService} from '../../../services/central-server.service';
import {SpinnerService} from '../../../services/spinner.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {MessageService} from '../../../services/message.service';
import {DialogService} from '../../../services/dialog.service';
import {UserComponent} from './user.component';

export class UserDialogComponent extends UserComponent {

  constructor(
    protected authorizationService: AuthorizationService,
    protected centralServerService: CentralServerService,
    protected messageService: MessageService,
    protected spinnerService: SpinnerService,
    protected translateService: TranslateService,
    protected localeService: LocaleService,
    protected dialog: MatDialog,
    protected dialogService: DialogService,
    protected router: Router,
    protected dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    super(authorizationService, centralServerService, messageService, spinnerService,
      translateService, localeService, null, dialog, dialogService, router);

    if (data) {
      this.currentUserID = data.id;
      this.loadUser();
    }
  }
}
