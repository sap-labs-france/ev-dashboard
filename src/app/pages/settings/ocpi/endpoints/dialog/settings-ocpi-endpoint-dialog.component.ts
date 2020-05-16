import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { RestResponse } from 'app/types/GlobalType';
import { OcpiEndpoint } from 'app/types/OCPIEndpoint';
import { ButtonType } from 'app/types/Table';

import { CentralServerService } from '../../../../../services/central-server.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  templateUrl: './settings-ocpi-endpoint-dialog.component.html',
})
export class SettingsOcpiEnpointDialogComponent implements OnInit {
  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public role!: AbstractControl;
  public type!: AbstractControl;
  public baseUrl!: AbstractControl;
  public countryCode!: AbstractControl;
  public partyId!: AbstractControl;
  public localToken!: AbstractControl;
  public token!: AbstractControl;
  public isBackgroundPatchJobActive!: AbstractControl;

  public currentEndpoint: Partial<OcpiEndpoint>;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<SettingsOcpiEnpointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Check if data is passed to the dialog
    if (data) {
      this.currentEndpoint = data;
    } else {
      this.currentEndpoint = {
        id: '',
        name: '',
        role: '',
        baseUrl: '',
        countryCode: '',
        partyId: '',
        localToken: '',
        token: '',
        backgroundPatchJob: false,
      };
    }
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      id: new FormControl(this.currentEndpoint.id),
      name: new FormControl(this.currentEndpoint.name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ])),
      role: new FormControl(this.currentEndpoint.role,
        Validators.compose([
          Validators.required,
        ])),
      baseUrl: new FormControl(this.currentEndpoint.baseUrl,
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ])),
      countryCode: new FormControl(this.currentEndpoint.countryCode,
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2),
        ])),
      partyId: new FormControl(this.currentEndpoint.partyId,
        Validators.compose([
          Validators.required,
          Validators.maxLength(3),
          Validators.minLength(3),
        ])),
      localToken: new FormControl(this.currentEndpoint.localToken,
        Validators.compose([
          Validators.maxLength(64),
        ])),
      token: new FormControl(this.currentEndpoint.token,
        Validators.compose([
          Validators.maxLength(64),
        ])),
      backgroundPatchJob: new FormControl(this.currentEndpoint.backgroundPatchJob),
    });

    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.role = this.formGroup.controls['role'];
    this.baseUrl = this.formGroup.controls['baseUrl'];
    this.countryCode = this.formGroup.controls['countryCode'];
    this.partyId = this.formGroup.controls['partyId'];
    this.localToken = this.formGroup.controls['localToken'];
    this.token = this.formGroup.controls['token'];
    this.isBackgroundPatchJobActive = this.formGroup.controls['backgroundPatchJob'];

    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });
  }

  public cancel() {
    this.dialogRef.close();
  }

  public save(endpoint: OcpiEndpoint) {
    // Show
    this.spinnerService.show();

    if (this.currentEndpoint.id) {
      // update existing Ocpi Endpoint
      this.updateOcpiEndpoint(endpoint);
    } else {
      // create new Ocpi Endpoint
      this.createOcpiEndpoint(endpoint);
    }
  }

  public generateLocalToken(ocpiendpoint: OcpiEndpoint) {
    // Show
    this.spinnerService.show();
    // Generate new local token
    this.centralServerService.generateLocalTokenOcpiEndpoint(ocpiendpoint).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.localToken.setValue(response.localToken);
        this.localToken.markAsDirty();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'ocpiendpoints.error_generate_local_token');
      }
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'ocpiendpoints.error_generate_local_token');
    });
  }

  public testConnection(ocpiendpoint: OcpiEndpoint) {
    // Show
    this.spinnerService.show();
    // Ping
    this.centralServerService.pingOcpiEndpoint(ocpiendpoint).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('ocpiendpoints.success_ping', { name: ocpiendpoint.name });
      } else {
        // switch message according status code recieved
        let messageId = 'ocpiendpoints.error_ping';
        switch (response.statusCode) {
          case 401:
            messageId = 'ocpiendpoints.error_ping_401';
            break;
          case 404:
            messageId = 'ocpiendpoints.error_ping_404';
            break;
          case 412:
            messageId = 'ocpiendpoints.error_ping_412';
            break;
          default:
            messageId = 'ocpiendpoints.error_ping';
        }
        Utils.handleError(JSON.stringify(response),
          this.messageService, messageId);
      }
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'ocpiendpoints.error_ping');
    });
  }

  public closeDialog(saved: boolean = false) {
    this.dialogRef.close(saved);
  }

  public onClose() {
    if (this.formGroup.invalid && this.formGroup.dirty) {
      this.dialogService.createAndShowInvalidChangeCloseDialog(
        this.translateService.instant('general.change_invalid_pending_title'),
        this.translateService.instant('general.change_invalid_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else if (this.formGroup.dirty) {
      this.dialogService.createAndShowDirtyChangeCloseDialog(
        this.translateService.instant('general.change_pending_title'),
        this.translateService.instant('general.change_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.SAVE_AND_CLOSE) {
          this.save(this.formGroup.value);
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }

  private createOcpiEndpoint(ocpiEndpoint: OcpiEndpoint) {
    this.centralServerService.createOcpiEndpoint(ocpiEndpoint).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('ocpiendpoints.create_success', { name: ocpiEndpoint.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'ocpiendpoints.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'ocpiendpoints.create_error');
    });
  }

  private updateOcpiEndpoint(ocpiEndpoint: OcpiEndpoint) {
    this.centralServerService.updateOcpiEndpoint(ocpiEndpoint).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('ocpiendpoints.update_success', { name: ocpiEndpoint.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'ocpiendpoints.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'ocpiendpoints.update_error');
    });
  }
}
