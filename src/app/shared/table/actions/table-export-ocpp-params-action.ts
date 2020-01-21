import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TableAction } from './table-action';
import { SpinnerService } from '../../../services/spinner.service';
// @ts-ignore
import saveAs from 'file-saver';

export class TableExportOCPPParamsAction implements TableAction {
  private action: TableActionDef = {
    id: 'export-ocpp-params',
    type: 'button',
    icon: 'cloud_download',
    name: 'chargers.export_all_ocpp_params',
    color: ButtonColor.PRIMARY,
    tooltip: 'general.tooltips.export',
    action: this.exportOCPPParameters
  };

  private exportOCPPParameters(dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router, spinnerService: SpinnerService ) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('site_areas.export_all_params_title'),
      translateService.instant('site_areas.export_all_params_confirm'),
    ).subscribe((response) => {
      if (response === Constants.BUTTON_TYPE_YES) {
        spinnerService.show();
        centralServerService.exportAllChargingStationsOCCPParams(this.currentSiteAreaID)
          .subscribe((result) => {
            spinnerService.hide();
            saveAs(result, 'exported-occp-params.csv');
          }, (error) => {
            spinnerService.hide();
            Utils.handleHttpError(error, router, messageService, centralServerService, 'general.error_backend');
          });
      }
    });
  }
  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
