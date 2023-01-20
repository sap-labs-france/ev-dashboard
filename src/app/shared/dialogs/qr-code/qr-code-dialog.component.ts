import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { AppConnectorIdPipe } from 'shared/formatters/app-connector-id.pipe';
import { Tenant } from 'types/Tenant';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
  templateUrl: 'qr-code-dialog.component.html',
  styleUrls: ['qr-code-dialog.component.scss']
})
export class QrCodeDialogComponent {
  public title: string;
  public chargingStationID: string;
  public connectorID: number;
  public tenant: Tenant;
  public qrCode: string;

  public constructor(
    protected dialogRef: MatDialogRef<QrCodeDialogComponent>,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.chargingStationID = data.chargingStationID;
      this.connectorID = data.connectorID;
      this.tenant = data.tenant;
      this.qrCode = data.qrCode;
      if (this.chargingStationID && this.connectorID) {
        this.title = `${this.chargingStationID} - ${this.translateService.instant('chargers.connector')} ${this.appConnectorIdPipe.transform(this.connectorID)}`;
      }
      if (this.tenant) {
        this.title = this.tenant.name;
      }
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

  public download() {
    this.spinnerService.show();
    if (this.chargingStationID) {
      this.centralServerService.downloadChargingStationQrCodes(this.chargingStationID, this.connectorID).subscribe({
        next: (result) => {
          this.spinnerService.hide();
          FileSaver.saveAs(result, `${this.chargingStationID.toLowerCase()}-${this.appConnectorIdPipe.transform(this.connectorID).toLowerCase()}-qr-codes.pdf`);
        },
        error: (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, this.translateService.instant('chargers.qr_code_generation_error'));
        }
      });
    }
    if (this.tenant) {
      this.centralServerService.downloadTenantQrCode(this.tenant.id).subscribe({
        next: (result) => {
          this.spinnerService.hide();
          FileSaver.saveAs(result, `${this.tenant.name.replace(' ', '-').toLocaleLowerCase()}-qr-code.pdf`);
        },
        error: (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, this.translateService.instant('chargers.qr_code_generation_error'));
        }
      });
    }
  }

  public cancel() {
    this.dialogRef.close();
  }
}
