import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { TableExportAction } from 'app/shared/table/actions/table-export-action';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { User, UserButtonAction } from 'app/types/User';
import { Constants } from 'app/utils/Constants';

export class TableExportUsersAction extends TableExportAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EXPORT_USERS,
      name: 'general.export',
      action: this.exportUsersAsCSV,
    };
  }

  public exportUsersAsCSV(users: User[], dialogService: DialogService, translateService: TranslateService) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('users.export_users_title'),
      translateService.instant('users.export_users_confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        let csv = `Name${Constants.CSV_SEPARATOR}First Name${Constants.CSV_SEPARATOR}Role${Constants.CSV_SEPARATOR}Status${Constants.CSV_SEPARATOR}Email${Constants.CSV_SEPARATOR}Badges${Constants.CSV_SEPARATOR}EULA Accepted On${Constants.CSV_SEPARATOR}Created On${Constants.CSV_SEPARATOR}Changed On${Constants.CSV_SEPARATOR}Changed By\r\n`;
        for (const user of users) {
          const tags = [];
          for (const tag of user.tags) {
            tags.push(tag.id);
          }
          const tagsString = tags.toString();
          csv += `${user.name}${Constants.CSV_SEPARATOR}${user.name}${Constants.CSV_SEPARATOR}${user.role}${Constants.CSV_SEPARATOR}${user.status}${Constants.CSV_SEPARATOR}${user.email}${Constants.CSV_SEPARATOR}${tagsString}${Constants.CSV_SEPARATOR}${user.eulaAcceptedOn}${Constants.CSV_SEPARATOR}${user.createdOn}${Constants.CSV_SEPARATOR}${user.lastChangedOn}${Constants.CSV_SEPARATOR}${user.lastChangedBy}\r\n`;
        }
        const blob = new Blob([csv]);
        saveAs(blob, `exported-users.csv`);
      }
    });
  }
}

// "${Utils.replaceSpecialCharsInCSVValueParam(parameter.value)}"
