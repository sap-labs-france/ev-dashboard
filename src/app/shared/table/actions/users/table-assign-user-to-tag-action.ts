import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { UsersDialogComponent } from '../../../../shared/dialogs/users/users-dialog.component';
import { TableAssignAction } from '../../../../shared/table/actions/table-assign-action';
import { ActionResponse } from '../../../../types/DataResult';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { ButtonType, TableActionDef } from '../../../../types/Table';
import { Tag } from '../../../../types/Tag';
import { User, UserButtonAction } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';

export interface TableAssignUserToTagActionDef extends TableActionDef {
  action: (tag: Tag, dialog: MatDialog, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableAssignUserToTagAction extends TableAssignAction {
  public getActionDef(): TableAssignUserToTagActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.ASSIGN_USER_TO_TAG,
      icon: 'people',
      name: 'general.edit',
      tooltip: 'general.tooltips.assign_user_to_tag',
      action: this.selectUser.bind(this),
    };
  }

  private selectUser(tag: Tag, dialog: MatDialog, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService,
    spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = '';
    // Show select user dialog
    dialogConfig.data = {
      title: 'users.select_users',
      validateButtonTitle: 'tags.assign_user_button',
      rowMultipleSelection: false,
    };
    dialogConfig.panelClass = 'transparent-dialog-container';
    const dialogRef2 = dialog.open(UsersDialogComponent, dialogConfig);
    // assign user
    dialogRef2.afterClosed().subscribe((data) => {
      if (data && data.length > 0) {
        return this.assignUserToTag(tag, data[0].objectRef as User,
          dialogService, translateService, messageService, centralServerService, router, spinnerService, refresh);
      }
    });
  }

  private assignUserToTag(tag: Tag, user: User,
    dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, router: Router, spinnerService: SpinnerService, refresh?: () => Observable<void>): void {
    dialogService.createAndShowYesNoDialog(
      translateService.instant(tag.user ? 'tags.change_user_tag_title' : 'tags.assign_user_to_tag_title'),
      translateService.instant(tag.user ? 'tags.change_user_tag_confirm' : 'tags.assign_user_to_tag_confirm', tag.user ? {
        tagID: tag.id,
        newUserName: Utils.buildUserFullName(user),
        oldUserName: Utils.buildUserFullName(tag.user),
      } : {
          tagID: tag.id,
          newUserName: Utils.buildUserFullName(user),
        }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        tag.userID = user.id;
        centralServerService.updateTag(tag).subscribe((response: ActionResponse) => {
          spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('tags.assign_user_to_tag_success', { userName: Utils.buildUserFullName(user) });
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response), messageService, 'tags.assign_user_to_tag_error');
          }
        }, (error) => {
          spinnerService.hide();
          switch (error.status) {
            case HTTPError.TAG_HAS_TRANSACTIONS:
              messageService.showErrorMessage('tags.tag_has_transaction_error');
              break;
            default:
              Utils.handleHttpError(error, router, messageService,
                centralServerService, 'general.unexpected_error_backend');
          }
        });
      }
    });
  }
}
