import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { TableAction } from 'shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'types/ChargingStation';
import { ButtonColor, TableActionDef } from 'types/Table';
import { Utils } from 'utils/Utils';

export interface TableSiteGenerateQrCodeConnectorsActionDef extends TableActionDef {
  action: (siteID: string, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) => void;
}

export class TableSiteGenerateQrCodeConnectorAction implements TableAction {
  private action: TableSiteGenerateQrCodeConnectorsActionDef = {
    id: ChargingStationButtonAction.GENERATE_QR_CODE,
    type: 'button',
    icon: 'qr_code',
    color: ButtonColor.ACCENT,
    name: 'general.generate_qr',
    tooltip: 'general.tooltips.generate_qr',
    action: this.downloadQrCodePDF,
  };

  public getActionDef(): TableSiteGenerateQrCodeConnectorsActionDef {
    return this.action;
  }

  private downloadQrCodePDF(siteID: string, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) {

    centralServerService.downloadQrCodePDF(siteID).subscribe(async (result) => {
      FileSaver.saveAs(result, 'SiteQrCodes.pdf');
    }, (error) => {
      spinnerService.hide();
      Utils.handleHttpError(error, router, messageService,
        centralServerService, translateService.instant('chargers.qr_code_generation_error'));
    });
  }
}
