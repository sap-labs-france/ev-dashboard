import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { TableAction } from 'shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'types/ChargingStation';
import { ButtonActionColor } from 'types/GlobalType';
import { TableActionDef } from 'types/Table';
import { Utils } from 'utils/Utils';

import { SiteArea } from '../../../../types/SiteArea';

export interface TableSiteAreaGenerateQrCodeConnectorsActionDef extends TableActionDef {
  action: (
    siteArea: SiteArea,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) => void;
}

export class TableSiteAreaGenerateQrCodeConnectorAction implements TableAction {
  private action: TableSiteAreaGenerateQrCodeConnectorsActionDef = {
    id: ChargingStationButtonAction.GENERATE_QR_CODE,
    type: 'button',
    icon: 'qr_code',
    color: ButtonActionColor.ACCENT,
    name: 'general.generate_qr',
    tooltip: 'general.tooltips.generate_qr',
    action: this.downloadQrCodePDF,
  };

  public getActionDef(): TableSiteAreaGenerateQrCodeConnectorsActionDef {
    return this.action;
  }

  private downloadQrCodePDF(
    siteArea: SiteArea,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) {
    spinnerService.show();
    centralServerService.downloadSiteAreaQrCodes(siteArea.id).subscribe({
      next: (result) => {
        spinnerService.hide();
        FileSaver.saveAs(result, `site-area-${siteArea.name.toLowerCase()}-qr-codes.pdf`);
      },
      error: (error) => {
        spinnerService.hide();
        Utils.handleHttpError(
          error,
          router,
          messageService,
          centralServerService,
          translateService.instant('chargers.qr_code_generation_error')
        );
      },
    });
  }
}
