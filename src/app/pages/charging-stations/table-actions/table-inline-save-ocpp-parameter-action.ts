import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableChargingStationsRebootAction } from 'app/pages/charging-stations/table-actions/table-charging-stations-reboot-action';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableInlineSaveAction } from 'app/shared/table/actions/table-inline-save-action';
import { ChargingStation, ChargingStationButtonAction, OCPPConfigurationStatus, OcppParameter } from 'app/types/ChargingStation';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export class TableInlineSaveOCPPParameterAction extends TableInlineSaveAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.INLINE_SAVE_OCPP_PARAMETER,
      name: 'general.save',
      action: this.saveOcppParameter,
    };
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
              Utils.handleHttpError(error, router, messageService, centralServerService, 'chargers.change_params_error');
            });
        }
      });
    } else {
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.ocpp_parameters_change_title'),
        translateService.instant('chargers.action_error.ocpp_parameters_should_not_be_empty'));
    }
  }

}
