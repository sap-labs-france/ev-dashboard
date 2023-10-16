import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { TableAction } from 'shared/table/actions/table-action';
import { ChargingStation, ChargingStationButtonAction } from 'types/ChargingStation';
import { ButtonActionColor } from 'types/GlobalType';
import { TableActionDef } from 'types/Table';
import { Utils } from 'utils/Utils';

export interface TableChargingStationGenerateQrCodeConnectorActionDef extends TableActionDef {
  action: (
    chargingStation: ChargingStation,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) => void;
}

export class TableChargingStationGenerateQrCodeConnectorAction implements TableAction {
  private action: TableChargingStationGenerateQrCodeConnectorActionDef = {
    id: ChargingStationButtonAction.GENERATE_QR_CODE,
    type: 'button',
    icon: 'qr_code',
    color: ButtonActionColor.ACCENT,
    name: 'general.generate_qr',
    tooltip: 'general.tooltips.generate_qr',
    action: this.downloadQrCodePDF,
  };

  public getActionDef(): TableChargingStationGenerateQrCodeConnectorActionDef {
    return this.action;
  }

  private downloadQrCodePDF(
    chargingStation: ChargingStation,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) {
    spinnerService.show();
    centralServerService.downloadChargingStationQrCodes(chargingStation.id).subscribe({
      next: (result) => {
        spinnerService.hide();
        FileSaver.saveAs(result, `${chargingStation.id.toLowerCase()}-qr-codes.pdf`);
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
