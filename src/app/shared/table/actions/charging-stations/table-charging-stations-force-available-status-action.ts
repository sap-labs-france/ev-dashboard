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

export interface TableChargingStationsForceAvailableStatusActionDef extends TableActionDef {
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

export class TableChargingStationsForceAvailableStatusAction implements TableAction {
  private action: TableChargingStationsForceAvailableStatusActionDef = {
    id: ChargingStationButtonAction.FORCE_AVAILABLE_STATUS,
    type: 'button',
    icon: 'play_arrow',
    color: ButtonActionColor.PRIMARY,
    name: 'chargers.force_available_status_action',
    tooltip: 'general.tooltip.force_available_status',
    action: this.forceAvailable,
  };

  public getActionDef(): TableChargingStationsForceAvailableStatusActionDef {
    return this.action;
  }

  private forceAvailable(
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
        translateService.instant('chargers.force_available_status_title'),
        translateService.instant('chargers.force_available_status_confirm', {
          chargeBoxID: chargingStation.id,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          // Change Availability
          centralServerService
            .chargingStationChangeAvailability(chargingStation.id, true)
            .subscribe({
              next: (response: ActionResponse) => {
                spinnerService.hide();
                if (
                  response.status === OCPPAvailabilityStatus.ACCEPTED ||
                  response.status === OCPPAvailabilityStatus.SCHEDULED
                ) {
                  messageService.showSuccessMessage(
                    translateService.instant('chargers.force_available_status_success', {
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
                    'chargers.force_available_status_error'
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
                  'chargers.force_available_status_error'
                );
              },
            });
        }
      });
  }
}
