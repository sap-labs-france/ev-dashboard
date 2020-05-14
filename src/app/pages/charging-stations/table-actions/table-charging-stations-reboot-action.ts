import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { ChargingStation, ChargingStationButtonAction, OCPPGeneralResponse } from 'app/types/ChargingStation';
import { ActionResponse } from 'app/types/DataResult';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export class TableChargingStationsRebootAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.REBOOT,
    type: 'button',
    icon: 'repeat',
    color: ButtonColor.WARN,
    name: 'general.edit',
    tooltip: 'general.tooltips.reboot',
    action: this.reboot,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private reboot(chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
      refresh?: () => Observable<void>) {
    // Show yes/no dialog
    dialogService.createAndShowYesNoDialog(
      translateService.instant('chargers.reboot_required_title'),
      translateService.instant('chargers.reboot_required_confirm', { chargeBoxID: chargingStation.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        spinnerService.show();
        // Reboot
        centralServerService.chargingStationReset(chargingStation.id).subscribe((response: ActionResponse) => {
            spinnerService.hide();
            if (response.status === OCPPGeneralResponse.ACCEPTED) {
              messageService.showSuccessMessage(
                translateService.instant('chargers.reboot_success', { chargeBoxID: chargingStation.id }));
              if (refresh) {
                refresh().subscribe();
              }
            } else {
              Utils.handleError(JSON.stringify(response),
                messageService, 'chargers.reboot_error');
            }
          }, (error: any) => {
            spinnerService.hide();
            Utils.handleHttpError(error, router, messageService,
              centralServerService, 'chargers.reboot_error');
          });
        }
    });
  }
}
