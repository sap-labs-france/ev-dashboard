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

export interface TableChargingStationsRebootActionDef extends TableActionDef {
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

export class TableChargingStationsRebootAction implements TableAction {
  private action: TableChargingStationsRebootActionDef = {
    id: ChargingStationButtonAction.REBOOT,
    type: 'button',
    icon: 'repeat',
    color: ButtonActionColor.WARN,
    name: 'chargers.reboot_action',
    tooltip: 'general.tooltips.reboot',
    action: this.reboot,
  };

  public getActionDef(): TableChargingStationsRebootActionDef {
    return this.action;
  }

  private reboot(
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
        translateService.instant('chargers.reboot_required_title'),
        translateService.instant('chargers.reboot_required_confirm', {
          chargeBoxID: chargingStation.id,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          // Reboot
          centralServerService.chargingStationReset(chargingStation.id, true).subscribe({
            next: (response: ActionResponse) => {
              spinnerService.hide();
              if (response.status === OCPPGeneralResponse.ACCEPTED) {
                messageService.showSuccessMessage(
                  translateService.instant('chargers.reboot_success', {
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
                  'chargers.reboot_error'
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
                'chargers.reboot_error'
              );
            },
          });
        }
      });
  }
}
