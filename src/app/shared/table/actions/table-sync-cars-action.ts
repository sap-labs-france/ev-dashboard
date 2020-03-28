import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { CarButtonAction } from 'app/types/Car';
import { SynchronizeResponse } from 'app/types/DataResult';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { TableAction } from './table-action';

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

  private synchronizeCars(translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router) {
    spinnerService.show();
    centralServerService.synchronizeCars().subscribe((response: SynchronizeResponse) => {
      spinnerService.hide();
      if (response.error) {
        messageService.showErrorMessage(
          translateService.instant('cars.synchronize_cars_partial',
            {
              synchronized: response.synchronized,
              inError: response.error,
            },
          ));
      } else if (response.synchronized === 0) {
        messageService.showSuccessMessage(
          translateService.instant('cars.synchronize_cars_up_to_date'));
      } else {
        messageService.showSuccessMessage(
          translateService.instant('cars.synchronize_cars_success',
            { synchronized: response.synchronized },
          ));
      }
    }, (error) => {
      spinnerService.hide();
      Utils.handleHttpError(error, router, messageService, centralServerService, 'cars.synchronize_cars_error');
    });
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
