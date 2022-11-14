import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { TableAction } from 'shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'types/ChargingStation';
import { ButtonActionColor } from 'types/GlobalType';
import { ActionType, TableActionDef } from 'types/Table';
import { Utils } from 'utils/Utils';

import { Site } from '../../../../types/Site';

export interface TableSiteDownloadQrCodeActionDef extends TableActionDef {
  action: (site: Site, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) => void;
}

export class TableSiteDownloadQrCodeAction implements TableAction {
  private action: TableSiteDownloadQrCodeActionDef = {
    id: ChargingStationButtonAction.DOWNLOAD_QR_CODE,
    type: ActionType.BUTTON,
    icon: 'qr_code',
    color: ButtonActionColor.ACCENT,
    name: 'general.download_qr',
    tooltip: 'general.download_qr',
    action: this.downloadQrCodePDF,
  };

  public getActionDef(): TableSiteDownloadQrCodeActionDef {
    return this.action;
  }

  private downloadQrCodePDF(site: Site, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) {
    spinnerService.show();
    centralServerService.downloadSiteQrCodes(site.id).subscribe({
      next: (result) => {
        spinnerService.hide();
        FileSaver.saveAs(result, `site-${site.name.toLowerCase()}-qr-codes.pdf`);
      },
      error:(error) => {
        spinnerService.hide();
        Utils.handleHttpError(error, router, messageService,
          centralServerService, translateService.instant('chargers.qr_code_generation_error'));
      }
    });
  }
}