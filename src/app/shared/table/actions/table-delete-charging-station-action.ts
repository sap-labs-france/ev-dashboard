import { ButtonType, TableActionDef } from 'app/types/Table';
import { ChargingStation, ChargingStationButtonAction } from 'app/types/ChargingStation';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { RestResponse } from 'app/types/GlobalType';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

export class TableDeleteChargingStationAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.DELETE_CHARGING_STATION,
      action: this.deleteChargingStation,
    };
  }

  private deleteChargingStation(chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    if (chargingStation.connectors.findIndex((connector) => connector.activeTransactionID > 0) >= 0) {
      // Do not delete when active transaction on going
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.delete_title'),
        translateService.instant('chargers.action_error.delete_active_transaction'));
    } else {
      dialogService.createAndShowYesNoDialog(
        translateService.instant('chargers.delete_title'),
        translateService.instant('chargers.delete_confirm', {chargeBoxID: chargingStation.id}),
      ).subscribe((result) => {
        if (result === ButtonType.YES) {
          centralServerService.deleteChargingStation(chargingStation.id).subscribe((response) => {
            if (response.status === RestResponse.SUCCESS) {
              refresh().subscribe();
              messageService.showSuccessMessage('chargers.delete_success', {chargeBoxID: chargingStation.id});
            } else {
              Utils.handleError(JSON.stringify(response),
                messageService, 'chargers.delete_error');
            }
          }, (error) => {
            Utils.handleHttpError(error, router, messageService, centralServerService,
              'chargers.delete_error');
          });
        }
      });
    }
  }
}
