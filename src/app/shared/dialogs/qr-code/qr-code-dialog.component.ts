import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import { AppConnectorIdPipe } from 'shared/formatters/app-connector-id.pipe';
import { Utils } from 'utils/Utils';

@Component({
  templateUrl: './qr-code-dialog.component.html',
})
export class QrCodeDialogComponent {
  public qrCode: string;
  public chargingStationID: string;
  public connectorID: number;
  public dialogTitle: string;
  constructor(
    protected dialogRef: MatDialogRef<QrCodeDialogComponent>,
    private translateService: TranslateService,
    private appConnectorIdPipe: AppConnectorIdPipe,
    @Inject(MAT_DIALOG_DATA) data) {
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
    const pdf = new jsPDF();
    pdf.addImage(this.qrCode, 'JPEG', 30, 50, 150, 150);
    pdf.text(this.chargingStationID + ' ' + this.translateService.instant('chargers.connector') + ' ' +
      this.appConnectorIdPipe.transform(this.connectorID), 50, 285);
    pdf.save('ConnectorQRCode.pdf');
  }

  public cancel() {
    this.dialogRef.close();
  }
}
