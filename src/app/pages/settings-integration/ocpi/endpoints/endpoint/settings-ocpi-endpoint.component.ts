import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../../../services/central-server.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { RestResponse } from '../../../../../types/GlobalType';
import { OcpiEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-ocpi-endpoint',
  templateUrl: './settings-ocpi-endpoint.component.html',
})
export class SettingsOcpiEnpointComponent implements OnInit {
  @Input() public currentEndpoint!: OcpiEndpoint;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
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

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router) {
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ])),
      role: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      baseUrl: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ])),
      countryCode: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2),
        ])),
      partyId: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(3),
          Validators.minLength(3),
        ])),
      localToken: new FormControl('',
        Validators.compose([
          Validators.maxLength(64),
        ])),
      token: new FormControl('',
        Validators.compose([
          Validators.maxLength(64),
        ])),
      backgroundPatchJob: new FormControl(false),
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
    this.loadEndpoint();
  }

  public loadEndpoint(): void {
    if (!this.currentEndpoint) {
      return;
    }
    if (this.currentEndpoint.id) {
      this.formGroup.controls.id.setValue(this.currentEndpoint.id);
    }
    if (this.currentEndpoint.name) {
      this.formGroup.controls.name.setValue(this.currentEndpoint.name);
    }
    if (this.currentEndpoint.role) {
      this.formGroup.controls.role.setValue(this.currentEndpoint.role);
    }
    if (this.currentEndpoint.baseUrl) {
      this.formGroup.controls.baseUrl.setValue(this.currentEndpoint.baseUrl);
    }
    if (this.currentEndpoint.countryCode) {
      this.formGroup.controls.countryCode.setValue(this.currentEndpoint.countryCode);
    }
    if (this.currentEndpoint.partyId) {
      this.formGroup.controls.partyId.setValue(this.currentEndpoint.partyId);
    }
    if (this.currentEndpoint.localToken) {
      this.formGroup.controls.localToken.setValue(this.currentEndpoint.localToken);
    }
    if (this.currentEndpoint.token) {
      this.formGroup.controls.token.setValue(this.currentEndpoint.token);
    }
    if (Utils.objectHasProperty(this.currentEndpoint, 'isBackgroundPatchJobActive')) {
      this.formGroup.controls.isBackgroundPatchJobActive.setValue(this.currentEndpoint.backgroundPatchJob);
    }
    this.formGroup.updateValueAndValidity();
    this.formGroup.markAsPristine();
    this.formGroup.markAllAsTouched();
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.save.bind(this), this.closeDialog.bind(this));
  }

  public save(endpoint: OcpiEndpoint) {
    if (this.currentEndpoint && this.currentEndpoint.id) {
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
    this.spinnerService.show();
    this.centralServerService.pingOcpiEndpoint(ocpiendpoint).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('ocpiendpoints.success_ping', { name: ocpiendpoint.name });
      } else {
        // switch message according status code recieved
        let messageId = 'ocpiendpoints.error_ping';
        switch (response.statusCode) {
          case StatusCodes.UNAUTHORIZED:
            messageId = 'ocpiendpoints.error_ping_401';
            break;
          case StatusCodes.NOT_FOUND:
            messageId = 'ocpiendpoints.error_ping_404';
            break;
          case StatusCodes.PRECONDITION_FAILED:
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

  private createOcpiEndpoint(ocpiEndpoint: OcpiEndpoint) {
    this.spinnerService.show();
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
    this.spinnerService.show();
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
