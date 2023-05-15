import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ButtonAction, ButtonActionColor } from 'types/GlobalType';
import { OCPPAvailabilityStatus } from 'types/ocpp/OCPP';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStation, ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { ActionResponse } from '../../../../types/DataResult';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableChargingStationsForceUnavailableStatusActionDef extends TableActionDef {
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

export class TableChargingStationsForceUnavailableStatusAction implements TableAction {
  private action: TableChargingStationsForceUnavailableStatusActionDef = {
    id: ChargingStationButtonAction.FORCE_UNAVAILABLE_STATUS,
    type: 'button',
    icon: 'stop',
    color: ButtonActionColor.WARN,
    name: 'chargers.force_unavailable_status_action',
    tooltip: 'general.tooltip.force_unavailable_status',
    action: this.forceUnavailable,
  };

  public getActionDef(): TableChargingStationsForceUnavailableStatusActionDef {
    return this.action;
  }

  private forceUnavailable(
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
        translateService.instant('chargers.force_unavailable_status_title'),
        translateService.instant('chargers.force_unavailable_status_confirm', {
          chargeBoxID: chargingStation.id,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          // Change Availability
          centralServerService
            .chargingStationChangeAvailability(chargingStation.id, false)
            .subscribe({
              next: (response: ActionResponse) => {
                spinnerService.hide();
                if (
                  response.status === OCPPAvailabilityStatus.ACCEPTED ||
                  response.status === OCPPAvailabilityStatus.SCHEDULED
                ) {
                  messageService.showSuccessMessage(
                    translateService.instant('chargers.force_unavailable_status_success', {
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
                    'chargers.force_unavailable_status_error'
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
                  'chargers.force_unavailable_status_error'
                );
              },
            });
        }
      });
  }
}
