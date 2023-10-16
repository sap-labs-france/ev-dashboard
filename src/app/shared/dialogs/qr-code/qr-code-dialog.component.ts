import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
  templateUrl: 'qr-code-dialog.component.html',
})
export class QrCodeDialogComponent {
  public qrCode: string;
  public chargingStationID: string;
  public connectorID: number;
  public dialogTitle: string;

  public constructor(
    protected dialogRef: MatDialogRef<QrCodeDialogComponent>,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    if (data) {
      if (data.chargingStationID) {
        this.chargingStationID = data.chargingStationID;
      }
      if (data.connectorID) {
        this.connectorID = data.connectorID;
      }
      if (data.qrCode) {
        this.qrCode = data.qrCode;
      }
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

  public download() {
    this.spinnerService.show();
    this.centralServerService
      .downloadChargingStationQrCodes(this.chargingStationID, this.connectorID)
      .subscribe({
        next: (result) => {
          this.spinnerService.hide();
          FileSaver.saveAs(
            result,
            `${this.chargingStationID.toLowerCase()}-${Utils.getConnectorLetterFromConnectorID(
              this.connectorID
            ).toLowerCase()}-qr-codes.pdf`
          );
        },
        error: (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            this.translateService.instant('chargers.qr_code_generation_error')
          );
        },
      });
  }

  public cancel() {
    this.dialogRef.close();
  }
}
