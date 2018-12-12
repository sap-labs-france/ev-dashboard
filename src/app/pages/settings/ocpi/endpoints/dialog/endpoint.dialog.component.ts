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
  styleUrls: ['../../../../../shared/dialogs/dialogs.component.scss'],
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

  private urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

  private readonly currentEndpoint: any;

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
        'token': ''
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
    });

    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.baseUrl = this.formGroup.controls['baseUrl'];
    this.countryCode = this.formGroup.controls['countryCode'];
    this.partyId = this.formGroup.controls['partyId'];
    this.localToken = this.formGroup.controls['localToken'];
    this.token = this.formGroup.controls['token'];
  }

  cancel() {
    this.dialogRef.close();
  }

  save(endpoint) {
    // Show
    // this.spinnerService.show(); 

    // if (this.currentTenant.id) {
    //   // update existing tenant
    //   this._updateTenant(tenant);
    // } else {
    //   // create new tenant
    //   this._createTenant(tenant);
    // }
  }

  private _createEndpoint(tenant) {
    // this.centralServerService.createTenant(tenant).subscribe(response => {
    //   this.spinnerService.hide();
    //   if (response.status === Constants.REST_RESPONSE_SUCCESS) {
    //     this.messageService.showSuccessMessage('tenants.create_success', {'name': tenant.name});
    //     this.dialogRef.close();
    //   } else {
    //     Utils.handleError(JSON.stringify(response),
    //       this.messageService, 'tenants.create_error');
    //   }
    // }, (error) => {
    //   this.spinnerService.hide();
    //   Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
    //     'tenants.create_error');
    // });
  }

  private _updateEndpoint(endpoint) {
    // this.centralServerService.updateTenant(tenant).subscribe(response => {
    //   this.spinnerService.hide();
    //   if (response.status === Constants.REST_RESPONSE_SUCCESS) {
    //     this.messageService.showSuccessMessage('tenants.update_success', {'name': tenant.name});
    //     this.dialogRef.close();
    //   } else {
    //     Utils.handleError(JSON.stringify(response),
    //       this.messageService, 'tenants.update_error');
    //   }
    // }, (error) => {
    //   this.spinnerService.hide();
    //   Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
    //     'tenants.update_error');
    // });
  }
}
