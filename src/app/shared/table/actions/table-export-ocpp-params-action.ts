import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { Site } from 'app/types/Site';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonColor, TableActionDef } from 'app/types/Table';
// @ts-ignore
import saveAs from 'file-saver';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TableAction } from './table-action';

export class TableExportOCPPParamsAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.EXPORT_OCPP_PARAMS,
    type: 'button',
    icon: 'cloud_download',
    name: 'site_areas.export_all_ocpp_params',
    color: ButtonColor.PRIMARY,
    tooltip: 'general.tooltips.export',
    action: this.exportOCPPParameters,
  };

  private exportOCPPParameters(dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router,
    spinnerService: SpinnerService, currentSiteArea: SiteArea, currentSite: Site) {
      dialogService.createAndShowYesNoDialog(
      translateService.instant(currentSiteArea ?
        translateService.instant('site_areas.export_all_params_title') :
        translateService.instant('sites.export_all_params_title')),
      translateService.instant(currentSiteArea ?
        translateService.instant('site_areas.export_all_params_confirm', { siteAreaName : currentSiteArea.name }) :
        translateService.instant('sites.export_all_params_confirm', { siteName : currentSite.name })),
    ).subscribe((response) => {
      if (response === Constants.BUTTON_TYPE_YES) {
        spinnerService.show();
        centralServerService.exportAllChargingStationsOCCPParams(
            currentSiteArea ? currentSiteArea.id : undefined,
            currentSite ? currentSite.id : undefined)
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
