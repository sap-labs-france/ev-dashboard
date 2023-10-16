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

export interface TableChargingStationsResetActionDef extends TableActionDef {
  action: (
    chargingStation: ChargingStation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableChargingStationsResetAction implements TableAction {
  private action: TableChargingStationsResetActionDef = {
    id: ChargingStationButtonAction.SOFT_RESET,
    type: 'button',
    icon: 'refresh',
    color: ButtonActionColor.PRIMARY,
    name: 'chargers.soft_reset_action',
    tooltip: 'general.tooltips.soft_reset',
    action: this.reset,
  };

  public getActionDef(): TableChargingStationsResetActionDef {
    return this.action;
  }

  private reset(
    chargingStation: ChargingStation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    // Show yes/no dialog
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('chargers.soft_reset_title'),
        translateService.instant('chargers.soft_reset_confirm', { chargeBoxID: chargingStation.id })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          // Reboot
          centralServerService.chargingStationReset(chargingStation.id, false).subscribe({
            next: (response: ActionResponse) => {
              spinnerService.hide();
              if (response.status === OCPPGeneralResponse.ACCEPTED) {
                messageService.showSuccessMessage(
                  translateService.instant('chargers.soft_reset_success', {
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
                  'chargers.soft_reset_error'
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
                'chargers.soft_reset_error'
              );
            },
          });
        }
      });
  }
}
