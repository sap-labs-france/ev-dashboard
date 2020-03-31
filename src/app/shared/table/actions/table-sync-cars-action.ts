import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { CarButtonAction } from 'app/types/Car';
import { ButtonColor, TableActionDef, ButtonType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { TableAction } from './table-action';
import { DialogService } from 'app/services/dialog.service';

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

  private synchronizeCars(dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('settings.car.synchronize_cars_dialog_title'),
      translateService.instant('settings.car.synchronize_cars_dialog_confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        centralServerService.synchronizeCars().subscribe((synchronizeResponse) => {
          spinnerService.hide();
          if (synchronizeResponse.inError) {
            messageService.showErrorMessage(
              translateService.instant('cars.synchronize_cars_partial',
                {
                  synchronized: synchronizeResponse.inSuccess,
                  inError: synchronizeResponse.inError,
                },
              ));
          } else if (synchronizeResponse.inSuccess === 0) {
            messageService.showSuccessMessage(
              translateService.instant('cars.synchronize_cars_up_to_date'));
          } else {
            messageService.showSuccessMessage(
              translateService.instant('cars.synchronize_cars_success',
                { synchronized: synchronizeResponse.inSuccess },
              ));
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService, 'cars.synchronize_cars_error');
        });
      }
    });
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
