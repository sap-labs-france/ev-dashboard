import { ButtonType, TableActionDef } from 'app/types/Table';

import { CentralServerService } from '../../../services/central-server.service';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { Router } from '@angular/router';
import { Site } from 'app/types/Site';
import { SiteArea } from 'app/types/SiteArea';
import { SpinnerService } from '../../../services/spinner.service';
import { TableExportAction } from './table-export-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from '../../../utils/Utils';
import saveAs from 'file-saver';

export class TableExportOCPPParamsAction extends TableExportAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EXPORT_OCPP_PARAMS,
      name: 'site_areas.export_all_ocpp_params',
      action: this.exportOCPPParameters,
    };
  }

  private exportOCPPParameters(dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router,
    spinnerService: SpinnerService, siteArea: SiteArea, site: Site) {
      dialogService.createAndShowYesNoDialog(
      translateService.instant(siteArea ?
        translateService.instant('site_areas.export_all_params_title') :
        translateService.instant('sites.export_all_params_title')),
      translateService.instant(siteArea ?
        translateService.instant('site_areas.export_all_params_confirm', { siteAreaName : siteArea.name }) :
        translateService.instant('sites.export_all_params_confirm', { siteName : site.name })),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        centralServerService.exportAllChargingStationsOCCPParams(
            siteArea ? siteArea.id : undefined,
            site ? site.id : undefined)
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
}
