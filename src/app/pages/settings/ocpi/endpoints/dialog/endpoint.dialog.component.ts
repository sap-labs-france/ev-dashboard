import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CentralServerService } from '../../../../../services/central-server.service';
import { MessageService } from '../../../../../services/message.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SpinnerService } from '../../../../../services/spinner.service';
import { Utils } from '../../../../../utils/Utils';
import { Constants } from '../../../../../utils/Constants';

@Component({
  templateUrl: './endpoint.dialog.component.html',
  styleUrls: ['./endpoint.dialog.component.scss', '../../../../../shared/dialogs/dialogs.component.scss']
})
export class EndpointDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public baseUrl: AbstractControl;
  public countryCode: AbstractControl;
  public partyId: AbstractControl;
  public localToken: AbstractControl;
  public token: AbstractControl;
  public isBackgroundPatchJobActive: AbstractControl;

  private urlPattern = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  public currentEndpoint: any;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    protected dialogRef: MatDialogRef<EndpointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Check if data is passed to the dialog
    if (data) {
      this.currentEndpoint = data;
    } else {
      this.currentEndpoint = {
        'id': '',
        'name': '',
        'baseUrl': '',
        'countryCode': '',
        'partyId': '',
        'localToken': '',
        'token': '',
        'backgroundPatchJob': false
      }
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      'id': new FormControl(this.currentEndpoint.id),
      'name': new FormControl(this.currentEndpoint.name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])),
      'baseUrl': new FormControl(this.currentEndpoint.baseUrl,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.urlPattern)
        ])),
      'countryCode': new FormControl(this.currentEndpoint.countryCode,
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2)
        ])),
      'partyId': new FormControl(this.currentEndpoint.partyId,
        Validators.compose([
          Validators.required,
          Validators.maxLength(3),
          Validators.minLength(3)
        ])),
      'localToken': new FormControl(this.currentEndpoint.localToken,
        Validators.compose([
          Validators.maxLength(64)
        ])),
      'token': new FormControl(this.currentEndpoint.token,
        Validators.compose([
          Validators.maxLength(64)
        ])),
      'backgroundPatchJob': new FormControl(this.currentEndpoint.backgroundPatchJob)
    });

    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.baseUrl = this.formGroup.controls['baseUrl'];
    this.countryCode = this.formGroup.controls['countryCode'];
    this.partyId = this.formGroup.controls['partyId'];
    this.localToken = this.formGroup.controls['localToken'];
    this.token = this.formGroup.controls['token'];
    this.isBackgroundPatchJobActive = this.formGroup.controls['backgroundPatchJob'];
  }

  cancel() {
    this.dialogRef.close();
  }

  save(endpoint) {
    // Show
    this.spinnerService.show();

    if (this.currentEndpoint.id) {
      // update existing Ocpi Endpoint
      this._updateOcpiendpoint(endpoint);
    } else {
      // create new Ocpi Endpoint
      this._createOcpiendpoint(endpoint);
    }
  }

  generateLocalToken(ocpiendpoint) {
    // Show
    this.spinnerService.show();
    // Generate new local token
    this.centralServerService.generateLocalTokenOcpiendpoint(ocpiendpoint).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
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

  testConnection(ocpiendpoint) {
    // Show
    this.spinnerService.show();
    // Ping
    this.centralServerService.pingOcpiendpoint(ocpiendpoint).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('ocpiendpoints.success_ping', { 'name': ocpiendpoint.name });
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
            messageId = 'ocpiendpoints.error_ping'
        }
        Utils.handleError(JSON.stringify(response),
          this.messageService, messageId);
      }
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'ocpiendpoints.error_ping');
    });
  }

  private _createOcpiendpoint(ocpiendpoint) {
    this.centralServerService.createOcpiendpoint(ocpiendpoint).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('ocpiendpoints.create_success', { 'name': ocpiendpoint.name });
        this.dialogRef.close();
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

  private _updateOcpiendpoint(ocpiendpoint) {
    this.centralServerService.updateOcpiendpoint(ocpiendpoint).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('ocpiendpoints.update_success', { 'name': ocpiendpoint.name });
        this.dialogRef.close();
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
