import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AppConnectorIdPipe } from 'app/shared/formatters/app-connector-id.pipe';
import { ChargingStationQRCode } from 'app/types/ChargingStation';
import { Utils } from 'app/utils/Utils';
import jsPDF from 'jspdf';

@Component({
  templateUrl: './qr-code-dialog.component.html',
})
export class QrCodeDialogComponent {
  public chargingStationQRCode: ChargingStationQRCode = {};
  public dialogTitle: string;
  constructor(
    protected dialogRef: MatDialogRef<QrCodeDialogComponent>,
    private translateService: TranslateService,
    private appConnectorIdPipe: AppConnectorIdPipe,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      if (data.tenantSubDomain) {
        this.chargingStationQRCode.tenantSubDomain = data.tenantSubDomain;
      }
      if (data.tenantName) {
        this.chargingStationQRCode.tenantName = data.tenantName;
      }
      if (data.chargingStationID) {
        this.chargingStationQRCode.chargingStationID = data.chargingStationID;
      }
      if (data.connectorID) {
        this.chargingStationQRCode.connectorID = data.connectorID;
      }
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

  public download() {
    const canvas = document.getElementsByTagName('canvas')[0] as HTMLCanvasElement;
    const imgData = canvas.toDataURL('image/jpeg", 1.0');
    const pdf = new jsPDF();

    pdf.addImage(imgData, 'JPEG', 50, 50, 100, 100);
    pdf.text(this.chargingStationQRCode.chargingStationID + ' ' + this.translateService.instant('chargers.connector') + ' ' +
      this.appConnectorIdPipe.transform(this.chargingStationQRCode.connectorID), 50, 200);
    pdf.save('download.pdf');
  }

  public cancel() {
    this.dialogRef.close();
  }
}
