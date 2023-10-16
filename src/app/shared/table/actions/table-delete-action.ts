import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ActionResponse } from '../../../types/DataResult';
import { ButtonAction, ButtonActionColor, RestResponse } from '../../../types/GlobalType';
import { TableActionDef, TableData } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { TableAction } from './table-action';

export class TableDeleteAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DELETE,
    type: 'button',
    icon: 'delete',
    color: ButtonActionColor.WARN,
    name: 'general.delete',
    tooltip: 'general.tooltips.delete',
    action: this.delete,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected delete(
    data: TableData,
    messageTitle: string,
    messageConfirm: string,
    messageSuccess: string,
    messageError: string,
    deleteData: (id: string | number) => Observable<ActionResponse>,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant(messageTitle),
        translateService.instant(messageConfirm)
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          deleteData(data.id).subscribe({
            next: (response) => {
              spinnerService.hide();
              if (response.status === RestResponse.SUCCESS) {
                messageService.showSuccessMessage(messageSuccess);
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(JSON.stringify(response), messageService, messageError);
              }
            },
            error: (error) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                messageError
              );
            },
          });
        }
      });
  }
}
