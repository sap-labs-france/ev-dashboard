import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { SiteAreasDialogComponent } from '../../../../shared/dialogs/site-areas/site-areas-dialog.component';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { RegistrationToken } from '../../../../types/RegistrationToken';
import { SiteArea } from '../../../../types/SiteArea';
import TenantComponents from '../../../../types/TenantComponents';
import { Utils } from '../../../../utils/Utils';
import { ChargingStationsRegistrationTokenDialogComponent } from './charging-stations-registration-token.dialog.component';

@Component({
  selector: 'app-charging-stations-registration-token',
  templateUrl: 'charging-stations-registration-token.component.html',
})
export class ChargingStationsRegistrationTokenComponent implements OnInit {
  @Input() public currentTokenID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<ChargingStationsRegistrationTokenDialogComponent>;
  public readonly isOrganizationComponentActive: boolean;
  public formGroup!: FormGroup;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public expirationDate!: AbstractControl;
  public description!: AbstractControl;
  public id!: AbstractControl;
  public currentToken: RegistrationToken;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private componentService: ComponentService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router) {
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      id: new FormControl(),
      siteArea: new FormControl(),
      siteAreaID: new FormControl(),
      description: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(100),
      ])),
      expirationDate: new FormControl(moment().add(1, 'month'),
        Validators.compose([
          Validators.required,
        ])),
    });
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.description = this.formGroup.controls['description'];
    this.expirationDate = this.formGroup.controls['expirationDate'];
    this.id = this.formGroup.controls['id'];
    this.loadToken();
  }

  public loadToken() {
    if (this.currentTokenID) {
      this.spinnerService.show();
      this.centralServerService.getRegistrationToken(this.currentTokenID).subscribe((registrationToken) => {
        this.formGroup.markAsPristine();
        this.spinnerService.hide();
        this.currentToken = registrationToken;
        // Init form
        this.siteArea.setValue(this.currentToken.siteArea ? this.currentToken.siteArea.name : null);
        this.siteAreaID.setValue(this.currentToken.siteAreaID || null);
        this.description.setValue(this.currentToken.description);
        this.expirationDate.setValue(this.currentToken.expirationDate);
        this.id.setValue(this.currentToken.id);
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('chargers.connections.registration_token_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'chargers.connections.registration_token_error');
        }
      });
    }
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.saveToken.bind(this), this.closeDialog.bind(this));
  }

  public saveToken(token: RegistrationToken) {
    if (this.currentTokenID) {
      this.updateToken(token);
    } else {
      this.createToken(token);
    }
  }

  public createToken(token: RegistrationToken) {
    this.spinnerService.show();
    this.centralServerService.createRegistrationToken(token).subscribe((response) => {
      this.spinnerService.hide();
      if (token) {
        this.messageService.showSuccessMessage('chargers.connections.registration_token_creation_success');
        this.closeDialog(true);
      } else {
        Utils.handleError(null,
          this.messageService, 'chargers.connections.registration_token_creation_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargers.connections.registration_token_creation_error');
    });
  }

  public updateToken(token: RegistrationToken) {
    this.spinnerService.show();
    // Update
    this.centralServerService.updateRegistrationToken(token).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('chargers.connections.registration_token_update_success');
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'chargers.connections.registration_token_update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('chargers.connections.registration_token_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'chargers.connections.registration_token_update_error');
      }
    });
  }

  public assignSiteArea() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'chargers.assign_site_area',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true
      },
    };
    // Open
    this.dialog.open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const siteArea = (result[0].objectRef) as SiteArea;
          this.siteArea.setValue(siteArea.name);
          this.siteAreaID.setValue(siteArea.id);
          this.formGroup.markAsDirty();
        }
      });
  }
}
