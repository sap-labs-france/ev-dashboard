import { TableActionDef, ButtonColor } from 'app/types/Table';
import { TableAction } from './table-action';
import { CarButtonAction } from 'app/types/Car';
import { DialogService } from 'app/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'app/services/message.service';
import { CentralServerService } from 'app/services/central-server.service';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { ActionCarSynchronizeResponse } from 'app/types/DataResult';
import { Utils } from 'app/utils/Utils';

export class TableSyncCarsAction implements TableAction {
  private action: TableActionDef = {
    id: CarButtonAction.SYNCHRONIZE,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.car.synchronize_cars',
    tooltip: 'general.synchronize',
    action: this.synchronizeCars,
  };

  private synchronizeCars(translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router) {
    spinnerService.show();
    centralServerService.synchronizeCars().subscribe((response: ActionCarSynchronizeResponse) => {
      if (response.inError) {
        messageService.showErrorMessage(
          translateService.instant('cars.synchronize_cars_partial',
            {
              synchronized: response.synchronized,
              inError: response.inError,
            },
          ));
      } else if (response.synchronized === 0) {
        messageService.showSuccessMessage(translateService.instant('cars.synchronize_cars_up_to_date'));
      } else {
        messageService.showSuccessMessage(
          translateService.instant('cars.synchronize_cars_success',
            { synchronized: response.synchronized },
          ));
      }
      spinnerService.hide();
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, router, messageService, centralServerService, 'cars.synchronize_cars_error');
    });
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
