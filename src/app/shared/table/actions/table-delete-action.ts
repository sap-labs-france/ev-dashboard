import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, Data, TableActionDef } from 'app/types/Table';

import { ActionResponse } from 'app/types/DataResult';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from './table-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

export class TableDeleteAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DELETE,
    type: 'button',
    icon: 'delete',
    color: ButtonColor.WARN,
    name: 'general.delete',
    tooltip: 'general.tooltips.delete',
    action: this.delete,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected delete(data: Data, messageTitle: string, messageConfirm: string, messageSuccess: string, messageError: string,
    deleteData: (id: string|number) => Observable<ActionResponse>,
    dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
  dialogService.createAndShowYesNoDialog(
    translateService.instant(messageTitle),
    translateService.instant(messageConfirm),
  ).subscribe((result) => {
    if (result === ButtonType.YES) {
      spinnerService.show();
      deleteData(data.id).subscribe((response) => {
        spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          messageService.showSuccessMessage(messageSuccess);
          if (refresh) {
            refresh().subscribe();
          }
        } else {
          Utils.handleError(JSON.stringify(response),
            messageService, messageError);
        }
      }, (error) => {
        spinnerService.hide();
        Utils.handleHttpError(error, router, messageService, centralServerService, messageError);
      });
    }
  });
}
}
