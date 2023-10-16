import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { ChargingStationsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { LocaleService } from '../../../../services/locale.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStation } from '../../../../types/ChargingStation';
import { ButtonAction, KeyValue } from '../../../../types/GlobalType';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-firmware-update',
  templateUrl: 'charging-station-firmware-update.component.html',
})
export class ChargingStationFirmwareUpdateComponent implements OnInit {
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargingStationsAuthorizations: ChargingStationsAuthorizations;

  public formGroup: UntypedFormGroup;

  public userLocales: KeyValue[];
  public url!: AbstractControl;

  private messages: any;

  public constructor(
    private centralServerService: CentralServerService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private router: Router,
    private dialogService: DialogService,
    private spinnerService: SpinnerService,
    private messageService: MessageService
  ) {
    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get Locales
    this.userLocales = this.localeService.getLocales();
  }

  public ngOnInit() {
    // Init FormControl
    this.formGroup = new UntypedFormGroup({
      url: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    this.url = this.formGroup.controls['url'];
    // Disable url if not authorized
    if (!this.chargingStation.canUpdateFirmware) {
      this.url.disable();
    }
  }

  public updateFirmware() {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('chargers.update_firmware_title'),
        this.translateService.instant('chargers.update_firmware_confirm', {
          chargeBoxID: this.chargingStation.id,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.spinnerService.show();
          this.centralServerService
            .chargingStationUpdateFirmware(this.chargingStation, this.url.value)
            .subscribe({
              next: () => {
                this.spinnerService.hide();
                this.messageService.showSuccessMessage(
                  this.translateService.instant('chargers.update_firmware_success', {
                    chargeBoxID: this.chargingStation.id,
                  })
                );
              },
              error: (error) => {
                this.spinnerService.hide();
                switch (error.status) {
                  case StatusCodes.NOT_FOUND:
                    this.messageService.showErrorMessage(this.messages['update_firmware_error']);
                    break;
                  default:
                    Utils.handleHttpError(
                      error,
                      this.router,
                      this.messageService,
                      this.centralServerService,
                      this.messages['update_firmware_error']
                    );
                }
              },
            });
        }
      });
  }
}
