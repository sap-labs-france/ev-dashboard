import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingStation } from 'app/types/ChargingStation';
import { KeyValue } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { ButtonType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-firmware-update',
  templateUrl: './charging-station-firmware-update.component.html',
})
export class ChargingStationFirmwareUpdateComponent implements OnInit {
  @Input() public charger!: ChargingStation;
  public userLocales: KeyValue[];
  public isAdmin: boolean;
  public url: FormControl;
  private messages: any;

  constructor(
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private router: Router,
    private dialogService: DialogService,
    private spinnerService: SpinnerService,
    private messageService: MessageService) {

    // Check auth
    if (!authorizationService.canUpdateChargingStation()) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  public ngOnInit() {
    // Init FormControl
    this.url = new FormControl( '', Validators.compose([
      Validators.required,
    ]));
  }

  public updateFirmware() {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.update_firmware_title'),
      this.translateService.instant('chargers.update_firmware_confirm', { chargeBoxID: this.url.value}),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.spinnerService.show();
        const fileName = 'r7_update_3.3.0.10_d4.epk';
        this.centralServerService.chargingStationUpdateFirmware(this.charger, this.url.value).subscribe(() => {
          this.spinnerService.hide();
          this.messageService.showSuccessMessage(
            this.translateService.instant('chargers.update_firmware_success', { chargeBoxID: this.charger.id }));
        }, (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case 401:
              this.messageService.showErrorMessage('chargers.update_firmware_error');
              break;
            case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
              this.messageService.showErrorMessage(this.messages['update_firmware_error']);
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService,
                this.centralServerService, this.messages['update_firmware_error']);
          }
        });
      }
    });
  }

}
