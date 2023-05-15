import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../../../services/central-server.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { DialogMode, OcpiEndpointsAuthorizations } from '../../../../../types/Authorization';
import { RestResponse } from '../../../../../types/GlobalType';
import { OCPIEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-ocpi-endpoint',
  templateUrl: 'settings-ocpi-endpoint.component.html',
  styleUrls: ['settings-ocpi-endpoint.component.scss'],
})
export class SettingsOcpiEndpointComponent implements OnInit {
  @Input() public currentEndpoint!: OCPIEndpoint;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public dialogMode!: DialogMode;
  @Input() public authorizations!: OcpiEndpointsAuthorizations;

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
  public readOnly = true;
  public canGenerateLocalToken: boolean;
  public canPing: boolean;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)])
      ),
      role: new FormControl('', Validators.compose([Validators.required])),
      baseUrl: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
      countryCode: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(2), Validators.minLength(2)])
      ),
      partyId: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(3), Validators.minLength(3)])
      ),
      localToken: new FormControl('', Validators.compose([Validators.maxLength(64)])),
      token: new FormControl('', Validators.compose([Validators.maxLength(64)])),
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
    this.canGenerateLocalToken = Utils.convertToBoolean(this.authorizations.canGenerateLocalToken);
    this.canPing = Utils.convertToBoolean(this.authorizations.canPing);
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    this.loadEndpoint();
  }

  public loadEndpoint(): void {
    if (!this.currentEndpoint) {
      return;
    }
    if (this.currentEndpoint.id) {
      this.id.setValue(this.currentEndpoint.id);
    }
    if (this.currentEndpoint.name) {
      this.name.setValue(this.currentEndpoint.name);
    }
    if (this.currentEndpoint.role) {
      this.role.setValue(this.currentEndpoint.role);
    }
    if (this.currentEndpoint.baseUrl) {
      this.baseUrl.setValue(this.currentEndpoint.baseUrl);
    }
    if (this.currentEndpoint.countryCode) {
      this.countryCode.setValue(this.currentEndpoint.countryCode);
    }
    if (this.currentEndpoint.partyId) {
      this.partyId.setValue(this.currentEndpoint.partyId);
    }
    if (this.currentEndpoint.localToken) {
      this.localToken.setValue(this.currentEndpoint.localToken);
    }
    if (this.currentEndpoint.token) {
      this.token.setValue(this.currentEndpoint.token);
    }
    if (Utils.objectHasProperty(this.currentEndpoint, 'isBackgroundPatchJobActive')) {
      this.isBackgroundPatchJobActive.setValue(this.currentEndpoint.backgroundPatchJob);
    }
    this.formGroup.updateValueAndValidity();
    this.formGroup.markAsPristine();
    this.formGroup.markAllAsTouched();
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.save.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public save(endpoint: OCPIEndpoint) {
    if (this.currentEndpoint && this.currentEndpoint.id) {
      // update existing Ocpi Endpoint
      this.updateOCPIEndpoint(endpoint);
    } else {
      // create new Ocpi Endpoint
      this.createOCPIEndpoint(endpoint);
    }
  }

  public generateLocalToken(ocpiendpoint: OCPIEndpoint) {
    // Show
    this.spinnerService.show();
    // Generate new local token
    this.centralServerService.generateLocalTokenOcpiEndpoint(ocpiendpoint).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.localToken.setValue(response.localToken);
          this.localToken.markAsDirty();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'ocpiendpoints.error_generate_local_token'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'ocpiendpoints.error_generate_local_token'
        );
      },
    });
  }

  public testConnection(ocpiEndpoint: OCPIEndpoint) {
    this.spinnerService.show();
    this.centralServerService.pingOcpiEndpoint(ocpiEndpoint).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('ocpiendpoints.success_ping', {
            name: ocpiEndpoint.name,
          });
        } else {
          // switch message according status code recieved
          let messageID = 'ocpiendpoints.error_ping';
          switch (response.statusCode) {
            case StatusCodes.UNAUTHORIZED:
              messageID = 'ocpiendpoints.error_ping_401';
              break;
            case StatusCodes.NOT_FOUND:
              messageID = 'ocpiendpoints.error_ping_404';
              break;
            case StatusCodes.PRECONDITION_FAILED:
              messageID = 'ocpiendpoints.error_ping_412';
              break;
            default:
              messageID = 'ocpiendpoints.error_ping';
          }
          Utils.handleError(JSON.stringify(response), this.messageService, messageID);
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'ocpiendpoints.error_ping'
        );
      },
    });
  }

  private createOCPIEndpoint(ocpiEndpoint: OCPIEndpoint) {
    this.spinnerService.show();
    this.centralServerService.createOcpiEndpoint(ocpiEndpoint).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('ocpiendpoints.create_success', {
            name: ocpiEndpoint.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'ocpiendpoints.create_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'ocpiendpoints.create_error'
        );
      },
    });
  }

  private updateOCPIEndpoint(ocpiEndpoint: OCPIEndpoint) {
    this.spinnerService.show();
    this.centralServerService.updateOcpiEndpoint(ocpiEndpoint).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('ocpiendpoints.update_success', {
            name: ocpiEndpoint.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'ocpiendpoints.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'ocpiendpoints.update_error'
        );
      },
    });
  }
}
