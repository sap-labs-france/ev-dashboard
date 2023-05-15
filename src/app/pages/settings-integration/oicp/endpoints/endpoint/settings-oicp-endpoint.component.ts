import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { HubjectBaseurls } from 'types/oicp/OICPGeneral';

import { CentralServerService } from '../../../../../services/central-server.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { RestResponse } from '../../../../../types/GlobalType';
import { OicpEndpoint } from '../../../../../types/oicp/OICPEndpoint';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-oicp-endpoint',
  templateUrl: 'settings-oicp-endpoint.component.html',
  styleUrls: ['settings-oicp-endpoint.component.scss'],
})
export class SettingsOicpEndpointComponent implements OnInit {
  @Input() public currentEndpoint!: OicpEndpoint;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
  public formGroup!: UntypedFormGroup;
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
  public oicpBaseurls = [
    {
      key: HubjectBaseurls.PRODUCTIVE,
      description: 'Productive',
    },
    {
      key: HubjectBaseurls.QA,
      description: 'QA',
    },
  ];

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.formGroup = new UntypedFormGroup({
      id: new UntypedFormControl(''),
      name: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)])
      ),
      role: new UntypedFormControl('', Validators.compose([Validators.required])),
      baseUrl: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
      countryCode: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(2), Validators.minLength(2)])
      ),
      partyId: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(3), Validators.minLength(3)])
      ),
      localToken: new UntypedFormControl('', Validators.compose([Validators.maxLength(64)])),
      token: new UntypedFormControl('', Validators.compose([Validators.maxLength(64)])),
      backgroundPatchJob: new UntypedFormControl(false),
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
    if (this.inDialog) {
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

  public save(endpoint: OicpEndpoint) {
    if (this.currentEndpoint && this.currentEndpoint.id) {
      // update existing Oicp Endpoint
      this.updateOicpEndpoint(endpoint);
    } else {
      // create new Oicp Endpoint
      this.createOicpEndpoint(endpoint);
    }
  }

  public testConnection(oicpendpoint: OicpEndpoint) {
    this.spinnerService.show();
    this.centralServerService.pingOicpEndpoint(oicpendpoint).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('oicpendpoints.success_ping', {
            name: oicpendpoint.name,
          });
        } else {
          // switch message according status code recieved
          let messageId = 'oicpendpoints.error_ping';
          switch (response.statusCode) {
            case StatusCodes.UNAUTHORIZED:
              messageId = 'oicpendpoints.error_ping_401';
              break;
            case StatusCodes.NOT_FOUND:
              messageId = 'oicpendpoints.error_ping_404';
              break;
            case StatusCodes.PRECONDITION_FAILED:
              messageId = 'oicpendpoints.error_ping_412';
              break;
            default:
              messageId = 'oicpendpoints.error_ping';
          }
          Utils.handleError(JSON.stringify(response), this.messageService, messageId);
        }
      },
      error: (error) => {
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'oicpendpoints.error_ping'
        );
      },
    });
  }

  private createOicpEndpoint(oicpEndpoint: OicpEndpoint) {
    this.spinnerService.show();
    this.centralServerService.createOicpEndpoint(oicpEndpoint).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('oicpendpoints.create_success', {
            name: oicpEndpoint.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'oicpendpoints.create_error'
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
          'oicpendpoints.create_error'
        );
      },
    });
  }

  private updateOicpEndpoint(oicpEndpoint: OicpEndpoint) {
    this.spinnerService.show();
    this.centralServerService.updateOicpEndpoint(oicpEndpoint).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('oicpendpoints.update_success', {
            name: oicpEndpoint.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'oicpendpoints.update_error'
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
          'oicpendpoints.update_error'
        );
      },
    });
  }
}
