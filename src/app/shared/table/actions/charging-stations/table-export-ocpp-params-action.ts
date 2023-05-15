import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { Site } from '../../../../types/Site';
import { SiteArea } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableExportAction } from '../table-export-action';

export interface TableExportOCPPParamsActionDef extends TableActionDef {
  action: (
    filters: { siteArea?: SiteArea; site?: Site },
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) => void;
}

export class TableExportOCPPParamsAction extends TableExportAction {
  public getActionDef(): TableExportOCPPParamsActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EXPORT_OCPP_PARAMS,
      name: 'site_areas.export_all_ocpp_params',
      action: this.exportOCPPParameters,
    };
  }

  private exportOCPPParameters(
    filters: { siteArea?: SiteArea; site: Site },
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) {
    super.export(
      filters.siteArea ? { SiteAreaID: filters.siteArea.id } : { SiteID: filters.site.id },
      'exported-ocpp-params.csv',
      filters.siteArea ? 'site_areas.export_all_params_title' : 'sites.export_all_params_title',
      filters.siteArea
        ? translateService.instant('site_areas.export_all_params_confirm', {
          siteAreaName: filters.siteArea.name,
        })
        : translateService.instant('sites.export_all_params_confirm', {
          siteName: filters.site.name,
        }),
      filters.siteArea ? 'site_areas.export_all_params_error' : 'sites.export_all_params_error',
      centralServerService.exportAllChargingStationsOCPPParams.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router
    );
  }
}
