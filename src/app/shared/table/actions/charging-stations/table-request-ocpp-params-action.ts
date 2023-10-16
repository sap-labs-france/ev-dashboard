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

export interface TableRequestOCPPParamsActionDef extends TableActionDef {
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

export class TableRequestOCPPParamsAction implements TableAction {
  private action: TableRequestOCPPParamsActionDef = {
    id: ChargingStationButtonAction.REQUEST_OCPP_PARAMS,
    type: 'button',
    icon: 'vertical_align_bottom',
    color: ButtonActionColor.PRIMARY,
    name: 'chargers.button_retrieve_configuration',
    tooltip: 'chargers.button_retrieve_configuration',
    action: this.requestOCPPParameters,
  };
  public getActionDef(): TableRequestOCPPParamsActionDef {
    return this.action;
  }

  private requestOCPPParameters(
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
        translateService.instant('chargers.retrieve_configuration_title'),
        translateService.instant('chargers.retrieve_configuration_confirm', {
          chargeBoxID: chargingStation.id,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.requestChargingStationOcppParameters(chargingStation.id).subscribe({
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
