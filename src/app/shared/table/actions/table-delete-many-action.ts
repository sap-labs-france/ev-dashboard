import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ActionsResponse } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, ButtonType, Data, TableActionDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { TableAction } from './table-action';

export class TableDeleteManyAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DELETE_MANY,
    type: 'button',
    icon: 'delete',
    color: ButtonColor.WARN,
    name: 'general.delete',
    tooltip: 'general.tooltips.delete',
    action: this.deleteMany,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected deleteMany(datas: Data[], messageTitle: string, messageConfirm: string, messageSuccess: string, messagePartialError: string,
      messageError: string, deleteManyData: (ids: (string|number)[]) => Observable<ActionsResponse>,
      dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
      clearSelectedRows: () => void, refresh?: () => Observable<void>) {
    // Confirm
    dialogService.createAndShowYesNoDialog(
      translateService.instant(messageTitle),
      translateService.instant(messageConfirm, { quantity: datas.length }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        deleteManyData(datas.map((data) => data.id)).subscribe((response: ActionsResponse) => {
          if (response.inError) {
            messageService.showErrorMessage(
              translateService.instant(messagePartialError,
                { inSuccess: response.inSuccess, inError: response.inError }));
          } else {
            messageService.showSuccessMessage(
              translateService.instant(messageSuccess, { inSuccess: response.inSuccess }));
          }
          spinnerService.hide();
          clearSelectedRows();
          if (refresh) {
            refresh().subscribe();
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService, messageError);
        });
      }
    });
  }
}
