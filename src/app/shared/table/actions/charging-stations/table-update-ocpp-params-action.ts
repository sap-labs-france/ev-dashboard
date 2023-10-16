import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ButtonAction, ButtonActionColor } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import {
  ChargingStation,
  ChargingStationButtonAction,
  OCPPGeneralResponse,
} from '../../../../types/ChargingStation';
import { ActionResponse } from '../../../../types/DataResult';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableUpdateOCPPParamsActionDef extends TableActionDef {
  action: (
    chargingStation: ChargingStation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableUpdateOCPPParamsAction implements TableAction {
  private action: TableUpdateOCPPParamsActionDef = {
    id: ChargingStationButtonAction.UPDATE_OCPP_PARAMS,
    type: 'button',
    icon: 'system_update_alt',
    color: ButtonActionColor.PRIMARY,
    name: 'chargers.button_force_ocpp_params_update_from_template',
    tooltip: 'chargers.button_force_ocpp_params_update_from_template',
    action: this.updateOCPPParameters,
  };

  public getActionDef(): TableUpdateOCPPParamsActionDef {
    return this.action;
  }

  private updateOCPPParameters(
    chargingStation: ChargingStation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('chargers.ocpp_params_update_from_template_title'),
        translateService.instant('chargers.ocpp_params_update_from_template_confirm', {
          chargeBoxID: chargingStation.id,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          centralServerService
            .updateChargingStationOCPPParamWithTemplate(chargingStation.id)
            .subscribe({
              next: (response: ActionResponse) => {
                spinnerService.hide();
                if (response.status === OCPPGeneralResponse.ACCEPTED) {
                  messageService.showSuccessMessage(
                    translateService.instant('chargers.ocpp_params_update_from_template_success', {
                      chargeBoxID: chargingStation.id,
                    })
                  );
                  if (refresh) {
                    refresh().subscribe();
                  }
                } else {
                  Utils.handleError(
                    JSON.stringify(response),
                    messageService,
                    'chargers.ocpp_params_update_from_template_error'
                  );
                }
              },
              error: (error: any) => {
                spinnerService.hide();
                Utils.handleHttpError(
                  error,
                  router,
                  messageService,
                  centralServerService,
                  'chargers.ocpp_params_update_from_template_error'
                );
              },
            });
        }
      });
  }
}
