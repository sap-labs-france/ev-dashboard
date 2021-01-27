import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ImportDialogComponent } from 'shared/dialogs/import/import-dialog.component';
import { ServerAction } from 'types/Server';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableExportAction } from '../../../../shared/table/actions/table-export-action';
import { FilterParams } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { UserButtonAction } from '../../../../types/User';
import { TableImportAction } from '../table-import-action';

export interface TableImportUsersActionDef extends TableActionDef {
  action: (userDialogComponent: ComponentType<unknown>, dialog: MatDialog) => void;
}

export class TableImportUsersAction extends TableImportAction {
  public getActionDef(): TableImportUsersActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.IMPORT_USERS,
      action: this.importUsers,
    };
  }

  private importUsers(userDialogComponent: ComponentType<unknown>, dialog: MatDialog) {
    super.import(userDialogComponent, dialog, ServerAction.USERS_IMPORT);

}}
