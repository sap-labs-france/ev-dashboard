import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ButtonAction } from 'types/GlobalType';
import { HTTPError } from 'types/HTTPError';
import { Constants } from 'utils/Constants';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { CarButtonAction } from '../../../../types/Car';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableSynchronizeAction } from '../table-synchronize-action';

export interface TableSyncCarCatalogsActionDef extends TableActionDef {
  action: (
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableSyncCarCatalogsAction extends TableSynchronizeAction {
  public getActionDef(): TableSyncCarCatalogsActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.SYNCHRONIZE,
      name: 'settings.car.synchronize_car_catalogs',
      action: this.synchronizeCarCatalogs,
    };
  }

  private synchronizeCarCatalogs(
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
        translateService.instant('settings.car.synchronize_car_catalogs_dialog_title'),
        translateService.instant('settings.car.synchronize_car_catalogs_dialog_confirm')
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.synchronizeCarsCatalog().subscribe({
            next: (synchronizeResponse) => {
              spinnerService.hide();
              if (synchronizeResponse.status === Constants.REST_RESPONSE_SUCCESS) {
                messageService.showInfoMessage('cars.synchronize_car_catalogs_success');
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  messageService,
                  'cars.synchronize_car_catalogs_error'
                );
              }
              if (refresh) {
                refresh().subscribe();
              }
            },
            error: (error) => {
              spinnerService.hide();
              // Check status
              switch (error.status) {
                // Email already exists
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  messageService.showWarningMessage('cars.synchronize_car_catalogs_ongoing');
                  break;
                // Unexpected error`
                default:
                  Utils.handleHttpError(
                    error,
                    router,
                    messageService,
                    centralServerService,
                    'cars.synchronize_car_catalogs_error'
                  );
              }
            },
          });
        }
      });
  }
}
