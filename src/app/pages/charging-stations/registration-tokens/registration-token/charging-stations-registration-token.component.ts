import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import * as moment from 'moment';
import { AuthorizationDefinitionFieldMetadata } from 'types/Authorization';

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
import { TenantComponents } from '../../../../types/Tenant';
import { Utils } from '../../../../utils/Utils';
import { ChargingStationsRegistrationTokenDialogComponent } from './charging-stations-registration-token.dialog.component';

@Component({
  selector: 'app-charging-stations-registration-token',
  templateUrl: 'charging-stations-registration-token.component.html',
  styleUrls: ['charging-stations-registration-token.component.scss'],
})
export class ChargingStationsRegistrationTokenComponent implements OnInit {
  @Input() public currentTokenID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<ChargingStationsRegistrationTokenDialogComponent>;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;

  public readonly isOrganizationComponentActive: boolean;
  public formGroup!: UntypedFormGroup;
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
    private router: Router
  ) {
    this.isOrganizationComponentActive = this.componentService.isActive(
      TenantComponents.ORGANIZATION
    );
  }

  public ngOnInit(): void {
    this.formGroup = new UntypedFormGroup({
      id: new UntypedFormControl(),
      siteArea: new UntypedFormControl(),
      siteAreaID: new UntypedFormControl('', Validators.compose([])),
      description: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)])
      ),
      expirationDate: new UntypedFormControl(
        moment().add(1, 'month'),
        Validators.compose([Validators.required])
      ),
    });
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.description = this.formGroup.controls['description'];
    this.expirationDate = this.formGroup.controls['expirationDate'];
    this.id = this.formGroup.controls['id'];
    if (this.metadata?.siteAreaID?.mandatory) {
      this.siteArea.setValidators(Validators.required);
      this.siteAreaID.setValidators(Validators.required);
    }
    this.loadRegistrationToken();
  }

  public loadRegistrationToken() {
    if (this.currentTokenID) {
      this.spinnerService.show();
      this.centralServerService.getRegistrationToken(this.currentTokenID).subscribe({
        next: (registrationToken) => {
          this.formGroup.markAsPristine();
          this.spinnerService.hide();
          this.currentToken = registrationToken;
          // Init form
          this.siteArea.setValue(
            this.currentToken.siteArea ? this.currentToken.siteArea.name : null
          );
          this.siteAreaID.setValue(this.currentToken.siteAreaID || null);
          this.description.setValue(this.currentToken.description);
          this.expirationDate.setValue(this.currentToken.expirationDate);
          this.id.setValue(this.currentToken.id);
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage(
                'chargers.connections.registration_token_not_found'
              );
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'chargers.connections.registration_token_error'
              );
          }
        },
      });
    }
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
      this.saveToken.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public resetSiteArea() {
    this.siteAreaID.reset();
    this.siteArea.reset();
    this.formGroup.markAsDirty();
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
    this.centralServerService.createRegistrationToken(token).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (token) {
          this.messageService.showSuccessMessage(
            'chargers.connections.registration_token_creation_success'
          );
          this.closeDialog(true);
        } else {
          Utils.handleError(
            null,
            this.messageService,
            'chargers.connections.registration_token_creation_error'
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
          'chargers.connections.registration_token_creation_error'
        );
      },
    });
  }

  public updateToken(token: RegistrationToken) {
    this.spinnerService.show();
    // Update
    this.centralServerService.updateRegistrationToken(token).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            'chargers.connections.registration_token_update_success'
          );
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'chargers.connections.registration_token_update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage(
              'chargers.connections.registration_token_not_found'
            );
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'chargers.connections.registration_token_update_error'
            );
        }
      },
    });
  }

  public assignSiteArea() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'chargers.assign_site_area',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
      },
    };
    // Open
    this.dialog
      .open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const siteArea = result[0].objectRef as SiteArea;
          this.siteArea.setValue(siteArea.name);
          this.siteAreaID.setValue(siteArea.id);
          this.formGroup.markAsDirty();
        }
      });
  }
}
