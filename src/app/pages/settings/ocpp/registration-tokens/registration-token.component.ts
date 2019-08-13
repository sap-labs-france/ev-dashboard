import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { SiteArea } from '../../../../common.types';
import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Utils } from '../../../../utils/Utils';

@Component({
  templateUrl: 'registration-token.component.html'
})
export class RegistrationTokenComponent implements OnInit {
  public formGroup: FormGroup;
  public siteAreaID: AbstractControl;
  public siteAreas: SiteArea[];
  public expirationDate: AbstractControl;
  public restrictToSiteArea: AbstractControl;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    protected dialogRef: MatDialogRef<RegistrationTokenComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      'siteAreaID': new FormControl(),
      'expirationDate': new FormControl(moment().add(1, 'd'),
        Validators.compose([
          Validators.required
        ]))
    });
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.expirationDate = this.formGroup.controls['expirationDate'];

    this.loadSiteAreas();
  }

  cancel() {
    this.dialogRef.close();
  }

  save(token) {
    this.spinnerService.show();
    this.centralServerService.createRegistrationToken(token).subscribe(response => {
      this.spinnerService.hide();
      if (token) {
        this.messageService.showSuccessMessage('settings.ocpp.registration_token_creation_success');
        this.dialogRef.close(true);
      } else {
        Utils.handleError(null,
          this.messageService, 'settings.ocpp.registration_token_creation_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tenants.create_error');
    });
  }

  updateSiteAreaRestriction(event: MatCheckboxChange) {
    if (event && event.checked) {
      this.siteAreaID.enable();
      this.siteAreaID.setValidators(Validators.required);
      this.siteAreaID.updateValueAndValidity();
    } else {
      this.siteAreaID.setValue(null);
      this.siteAreaID.disable();
      this.siteAreaID.clearValidators();
      this.siteAreaID.updateValueAndValidity();
    }
  }

  private loadSiteAreas() {
    this.spinnerService.show();
    this.centralServerService.getSiteAreas().subscribe((result) => {
      this.spinnerService.hide();
      this.siteAreas = result.result;
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      this.dialogRef.close();
    });
  }
}
