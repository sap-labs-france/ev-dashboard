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
import { Car } from 'types/Car';
import { Tag } from 'types/Tag';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CarsDialogComponent } from '../../../shared/dialogs/cars/cars-dialog.component';
import { TagsDialogComponent } from '../../../shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { TenantComponents } from '../../../types/Tenant';
import {
  StartTransaction,
  StartTransactionDialogData,
  StartTransactionErrorCode,
} from '../../../types/Transaction';
import { User, UserSessionContext, UserToken } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: 'charging-stations-start-transaction-dialog-component.html',
})
export class ChargingStationsStartTransactionDialogComponent implements OnInit {
  public title = '';
  public chargingStationID = '';
  public connectorID = null;
  public isCarComponentActive: boolean;
  public selectedUser!: User;
  public selectedTag!: Tag;
  public selectedCar!: Car;

  public formGroup!: UntypedFormGroup;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public car!: AbstractControl;
  public carID!: AbstractControl;
  public tag!: AbstractControl;
  public visualTagID!: AbstractControl;

  public errorMessage: string;

  public loggedUser: UserToken;
  public canListUsers = false;

  public constructor(
    private dialog: MatDialog,
    private router: Router,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private dialogRef: MatDialogRef<ChargingStationsStartTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    data: DialogParamsWithAuth<StartTransactionDialogData, ChargingStationsAuthorizations>
  ) {
    // Set
    this.title = translateService.instant('chargers.start_transaction_details_title', {
      chargeBoxID: data.dialogData.chargingStation.id,
    });
    this.chargingStationID = data.dialogData.chargingStation.id;
    this.connectorID = data.dialogData.connector.connectorId;
    this.loggedUser = this.centralServerService.getLoggedUser();
    this.canListUsers = data.dialogData.chargingStation.canListUsers;
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    Utils.registerValidateCloseKeyEvents(
      this.dialogRef,
      this.startTransaction.bind(this),
      this.cancel.bind(this)
    );
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({
      user: new UntypedFormControl('', Validators.compose([Validators.required])),
      userID: new UntypedFormControl('', Validators.compose([Validators.required])),
      car: new UntypedFormControl('', Validators.compose([])),
      carID: new UntypedFormControl('', Validators.compose([])),
      tag: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, this.tagActiveValidator.bind(this)])
      ),
      visualTagID: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    // Form
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.car = this.formGroup.controls['car'];
    this.carID = this.formGroup.controls['carID'];
    this.tag = this.formGroup.controls['tag'];
    this.visualTagID = this.formGroup.controls['visualTagID'];
    this.user.setValue(Utils.buildUserFullName(this.loggedUser));
    this.userID.setValue(this.loggedUser.id);
    this.loadUserSessionContext();
  }

  public resetCar() {
    this.car.reset();
    this.carID.reset();
  }

  public loadUserSessionContext() {
    if (this.userID.value) {
      this.spinnerService.show();
      this.centralServerService
        .getUserSessionContext(this.userID.value, this.chargingStationID, this.connectorID)
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
      this.selectedUser = result[0].objectRef;
      this.user.setValue(Utils.buildUserFullName(result[0].objectRef));
      this.userID.setValue(result[0].key);
      this.tag.setValue('');
      this.visualTagID.setValue('');
      this.car.setValue('');
      this.carID.setValue('');
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
        this.tag.setValue(Utils.buildTagName(result[0].objectRef));
        this.visualTagID.setValue(result[0].key);
      }
    });
  }

  public assignCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value,
      },
    };
    // Show
    const dialogRef = this.dialog.open(CarsDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedCar = result[0].objectRef;
        this.car.setValue(Utils.buildCarName(result[0].objectRef, this.translateService, false));
        this.carID.setValue(result[0].key);
      }
    });
  }

  public startTransaction() {
    if (this.formGroup.valid) {
      const startTransaction: StartTransaction = {
        userID: this.userID.value,
        userFullName: this.user.value,
        carID: this.carID.value,
        visualTagID: this.visualTagID.value,
      };
      this.dialogRef.close(startTransaction);
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
