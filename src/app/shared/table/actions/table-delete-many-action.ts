import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ActionsResponse } from '../../../types/DataResult';
import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { TableActionDef, TableData } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { TableAction } from './table-action';

export class TableDeleteManyAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DELETE_MANY,
    type: 'button',
    icon: 'delete',
    color: ButtonActionColor.WARN,
    name: 'general.delete',
    tooltip: 'general.tooltips.delete',
    action: this.deleteMany,
    linkedToListSelection: true,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected deleteMany(
    datas: TableData[],
    messageTitle: string,
    messageConfirm: string,
    messageSuccess: string,
    messageSuccessAndError: string,
    messageError: string,
    messageNoSuccessNoError: string,
    messageUnexpectedError: string,
    deleteManyData: (ids: (string | number)[]) => Observable<ActionsResponse>,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    clearSelectedRows: () => void,
    refresh?: () => Observable<void>
  ) {
    // Confirm
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant(messageTitle),
        translateService.instant(messageConfirm, { quantity: datas.length })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          deleteManyData(datas.map((data) => data.id)).subscribe({
            next: (responseAction: ActionsResponse) => {
              spinnerService.hide();
              messageService.showActionsMessage(
                responseAction,
                messageSuccess,
                messageError,
                messageSuccessAndError,
                messageNoSuccessNoError
              );
              clearSelectedRows();
              if (refresh) {
                refresh().subscribe();
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                messageUnexpectedError
              );
              spinnerService.hide();
            },
          });
        }
      });
  }
}
