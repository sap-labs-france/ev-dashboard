import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChargingStationsAuthorizations, DialogParamsWithAuth } from 'types/Authorization';
import { Tag } from 'types/Tag';

import { ChargingStation, Connector } from 'types/ChargingStation';
import { Car } from 'types/Car';
import { CarsDialogComponent } from 'shared/dialogs/cars/cars-dialog.component';
import { TenantComponents } from 'types/Tenant';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TagsDialogComponent } from '../../../shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { ReserveNow, ReserveNowDialogData } from '../../../types/Reservation';
import { StartTransactionErrorCode } from '../../../types/Transaction';
import { User, UserSessionContext, UserToken } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: 'charging-stations-reserve-now-dialog-component.html',
})
export class ChargingStationsReserveNowDialogComponent implements OnInit {
  public title = '';

  public selectedChargingStation!: ChargingStation;
  public selectedConnector!: Connector;
  public selectedUser!: User;
  public selectedTag!: Tag;
  public selectedParentTag!: Tag;
  public selectedCar!: Car;
  public selectedExpiryDate!: Date;

  public formGroup!: UntypedFormGroup;

  public user!: AbstractControl;
  public userID!: AbstractControl;
  public tag!: AbstractControl;
  public visualTagID!: AbstractControl;
  public parentTag!: AbstractControl;
  public parentTagID!: AbstractControl;
  public expiryDate!: AbstractControl;
  public car!: AbstractControl;
  public carID!: AbstractControl;

  public loggedUser: UserToken;
  public canListUsers: boolean;

  public isCarComponentActive: boolean;
  public isReservationComponentActive: boolean;

  public errorMessage: string;

  public constructor(
    private dialog: MatDialog,
    private router: Router,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private dialogRef: MatDialogRef<ChargingStationsReserveNowDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    data: DialogParamsWithAuth<ReserveNowDialogData, ChargingStationsAuthorizations>
  ) {
    // Set
    this.title = translateService.instant('reservations.dialog.reserve_now.details', {
      chargingStationID: data.dialogData.chargingStation.id,
      connectorID: Utils.getConnectorLetterFromConnectorID(data.dialogData.connector.connectorId),
    });
    this.selectedChargingStation = data.dialogData.chargingStation;
    this.selectedConnector = data.dialogData.connector;
    this.loggedUser = this.centralServerService.getLoggedUser();
    this.canListUsers = this.selectedChargingStation.canListUsers;
    this.selectedExpiryDate = data.dialogData.expiryDate;

    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    this.isReservationComponentActive = this.componentService.isActive(
      TenantComponents.RESERVATION
    );

    Utils.registerValidateCloseKeyEvents(
      this.dialogRef,
      this.reserveNow.bind(this),
      this.cancel.bind(this)
    );
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({
      user: new UntypedFormControl('', Validators.compose([Validators.required])),
      userID: new UntypedFormControl('', Validators.compose([Validators.required])),
      tag: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, this.tagActiveValidator.bind(this)])
      ),
      visualTagID: new UntypedFormControl('', Validators.compose([Validators.required])),
      parentTagID: new UntypedFormControl(''),
      parentTag: new UntypedFormControl(''),
      car: new UntypedFormControl(''),
      carID: new UntypedFormControl(''),
      expiryDate: new UntypedFormControl(
        this.selectedExpiryDate,
        Validators.compose([Validators.required])
      ),
    });
    // Form
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.tag = this.formGroup.controls['tag'];
    this.visualTagID = this.formGroup.controls['visualTagID'];
    this.parentTagID = this.formGroup.controls['parentTagID'];
    this.parentTag = this.formGroup.controls['parentTag'];
    this.carID = this.formGroup.controls['carID'];
    this.car = this.formGroup.controls['car'];
    this.expiryDate = this.formGroup.controls['expiryDate'];
    this.user.setValue(Utils.buildUserFullName(this.loggedUser));
    this.userID.setValue(this.loggedUser.id);
    this.loadUserSessionContext();
  }

  public loadUserSessionContext() {
    if (this.userID.value) {
      this.spinnerService.show();
      this.centralServerService
        .getUserSessionContext(
          this.userID.value,
          this.selectedChargingStation.id,
          this.selectedConnector.connectorId
        )
        .subscribe({
          next: (userSessionContext: UserSessionContext) => {
            this.spinnerService.hide();
            // Set Tag
            this.selectedTag = userSessionContext.tag;
            this.tag.setValue(
              userSessionContext.tag ? Utils.buildTagName(userSessionContext.tag) : ''
            );
            this.visualTagID.setValue(userSessionContext.tag?.visualID);
            // Set Car
            this.selectedCar = userSessionContext.car;
            this.car.setValue(
              userSessionContext.car
                ? Utils.buildCarName(userSessionContext.car, this.translateService, false)
                : ''
            );
            this.carID.setValue(userSessionContext.car?.id);
            // Update form
            this.formGroup.updateValueAndValidity();
            if (Utils.isEmptyArray(userSessionContext.errorCodes)) {
              this.formGroup.markAsPristine();
              this.formGroup.markAllAsTouched();
            } else {
              // TODO: Add error codes for not supported user context in reservations
              // Setting errors automatically disable start transaction button
              this.formGroup.setErrors(userSessionContext.errorCodes);
              // Set mat-error message depending on errorCode provided
              if (
                userSessionContext.errorCodes[0] ===
                StartTransactionErrorCode.BILLING_NO_PAYMENT_METHOD
              ) {
                this.errorMessage = this.translateService.instant(
                  'transactions.error_start_no_payment_method'
                );
              } else {
                this.errorMessage = this.translateService.instant(
                  'transactions.error_start_general'
                );
              }
            }
          },
          error: (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
          },
        });
    }
  }

  public assignUser() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
      },
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      this.selectedUser = result[0].objectRef as User;
      this.user.setValue(Utils.buildUserFullName(this.selectedUser));
      this.userID.setValue(this.selectedUser.id);
      this.tag.reset();
      this.visualTagID.reset();
      this.loadUserSessionContext();
    });
  }

  public assignTag() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value,
        Issuer: true,
      },
    };
    // Show
    const dialogRef = this.dialog.open(TagsDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedTag = result[0].objectRef;
        this.tag.setValue(Utils.buildTagName(this.selectedTag));
        this.visualTagID.setValue(this.selectedTag.visualID);
      }
    });
  }

  public assignCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'reservations.select_car',
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value,
        Issuer: true,
      },
    };
    // Show
    this.dialog
      .open(CarsDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          this.selectedCar = result[0].objectRef as Car;
          this.car.setValue(Utils.buildCarName(this.selectedCar, this.translateService));
          this.carID.setValue(this.selectedCar.id);
        }
      });
  }

  public reserveNow() {
    if (this.formGroup.valid) {
      const reserveNowRequest: ReserveNow = {
        expiryDate: this.expiryDate.value,
        connectorId: this.selectedConnector.connectorId,
        visualTagID: this.visualTagID.value,
        parentIdTag: this.selectedParentTag === undefined ? '' : this.selectedParentTag.visualID,
      };
      this.dialogRef.close([
        reserveNowRequest,
        this.user.value as string,
        this.carID.value as string,
      ]);
    }
  }

  public cancel() {
    this.dialogRef.close();
  }

  private tagActiveValidator(tagControl: AbstractControl): ValidationErrors | null {
    // Check the object
    if (!this.selectedTag || this.selectedTag.active) {
      return null;
    }
    return { inactive: true };
  }
}
