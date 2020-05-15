import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingStation, OCPPConfigurationStatus, OcppParameter } from 'app/types/ChargingStation';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

import { TableAction } from './table-action';
import { TableChargingStationsRebootAction } from './table-charging-stations-reboot-action';

export class TableInlineSaveAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.INLINE_SAVE,
    type: 'button',
    icon: 'save',
    color: ButtonColor.PRIMARY,
    name: 'general.save',
    tooltip: 'general.tooltips.save',
    action: this.saveOcppParameter,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  private saveOcppParameter(charger: ChargingStation, param: OcppParameter, dialogService: DialogService,
    translateService: TranslateService, messageService: MessageService, centralServerService: CentralServerService,
    spinnerService: SpinnerService, router: Router,  refresh?: () => Observable<void>) {
    // Show yes/no dialog only if fields are not empty
    if (param.key !== null && param.key !== '' && param.value !== null && param.value !== '') {
      dialogService.createAndShowYesNoDialog(
        translateService.instant('chargers.set_configuration_title'),
        translateService.instant('chargers.set_configuration_confirm', { chargeBoxID: charger.id, key: param.key }),
      ).subscribe((result) => {
        if (result === ButtonType.YES) {
          spinnerService.show();
          centralServerService.updateChargingStationOCPPConfiguration(
            charger.id, { key: param.key, value: param.value, readonly: param.readonly }).subscribe((response) => {
              spinnerService.hide();
              // Ok?
              if (response.status === OCPPConfigurationStatus.ACCEPTED ||
                  response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
                messageService.showSuccessMessage(
                  translateService.instant('chargers.change_params_success', { paramKey: param.key, chargeBoxID: charger.id }));
                // Reboot Required?
                if (response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
                  const chargingStationsRebootAction = new TableChargingStationsRebootAction().getActionDef();
                  if (chargingStationsRebootAction.action) {
                    chargingStationsRebootAction.action(charger, dialogService, translateService,
                      messageService, centralServerService, spinnerService, router);
                  }
                }
              } else {
                Utils.handleError(JSON.stringify(response), messageService, 'chargers.change_params_error');
              }
              if (refresh) {
                refresh().subscribe();
              }
            }, (error) => {
              spinnerService.hide();
              if (refresh) {
                refresh().subscribe();
              }
              Utils.handleHttpError(error, router, messageService, centralServerService, 'chargers.change_params_error');
            });
        }
      });
    }
  }

}
