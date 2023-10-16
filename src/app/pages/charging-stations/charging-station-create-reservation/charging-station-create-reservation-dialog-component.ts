import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { CarsDialogComponent } from 'shared/dialogs/cars/cars-dialog.component';
import { TagsDialogComponent } from 'shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from 'shared/dialogs/users/users-dialog.component';
import { RESERVATION_TYPES } from 'shared/model/reservations.model';
import { DialogParamsWithAuth, ReservationsAuthorizations } from 'types/Authorization';
import { Car } from 'types/Car';
import { ChargePointStatus } from 'types/ChargingStation';
import { KeyValue } from 'types/GlobalType';
import { CreateReservationDialogData, Reservation, ReservationType } from 'types/Reservation';
import { Tag } from 'types/Tag';
import { TenantComponents } from 'types/Tenant';
import { User, UserSessionContext, UserToken } from 'types/User';
import { Reservations } from 'utils/Reservations';
import { Utils } from 'utils/Utils';

@Component({
  templateUrl: 'charging-station-create-reservation-dialog-component.html',
})
export class ChargingStationCreateReservationDialogComponent implements OnInit {
  public title = '';
  public chargingStationID = '';
  public connectorID = null;
  public connectorStatus: ChargePointStatus = null;
  public isCarComponentActive: boolean;
  public selectedUser!: User;
  public selectedTag!: Tag;
  public selectedParentTag!: Tag;
  public selectedCar!: Car;

  public errorMessage: string;

  public loggedUser: UserToken;
  public canListUsers = false;

  public formGroup!: UntypedFormGroup;
  public userID!: AbstractControl;
  public user!: AbstractControl;
  public idTag!: AbstractControl;
  public visualTagID!: AbstractControl;
  public tag!: AbstractControl;
  public parentIdTag!: AbstractControl;
  public parentTag!: AbstractControl;
  public fromDate!: AbstractControl;
  public toDate!: AbstractControl;
  public expiryDate!: AbstractControl;
  public arrivalTime!: AbstractControl;
  public departureTime!: AbstractControl;
  public carID!: AbstractControl;
  public car!: AbstractControl;
  public type!: AbstractControl;

  public reservationTypes: KeyValue[] = RESERVATION_TYPES;

  public constructor(
    private dialog: MatDialog,
    private router: Router,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private dialogRef: MatDialogRef<ChargingStationCreateReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    data: DialogParamsWithAuth<CreateReservationDialogData, ReservationsAuthorizations>
  ) {
    this.title = translateService.instant('reservations.dialog.create.title');
    this.chargingStationID = data.dialogData.chargingStation.id;
    this.connectorID = data.dialogData.connector.connectorId;
    this.connectorStatus = data.dialogData.connector.status;
    this.loggedUser = this.centralServerService.getLoggedUser();
    this.canListUsers = data.dialogData.chargingStation.canListUsers;
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    Utils.registerValidateCloseKeyEvents(
      this.dialogRef,
      this.createReservation.bind(this),
      this.cancel.bind(this)
    );
  }

  public ngOnInit(): void {
    this.formGroup = new UntypedFormGroup({
      userID: new UntypedFormControl(null, Validators.compose([Validators.required])),
      user: new UntypedFormControl(null, Validators.compose([Validators.required])),
      visualTagID: new UntypedFormControl(null, Validators.compose([Validators.required])),
      tag: new UntypedFormControl(
        null,
        Validators.compose([Validators.required, this.tagActiveValidator.bind(this)])
      ),
      parentIdTag: new UntypedFormControl(null),
      parentTag: new UntypedFormControl(null),
      fromDate: new UntypedFormControl(
        null,
        Validators.compose([Reservations.validateDate, Validators.required])
      ),
      toDate: new UntypedFormControl(
        null,
        Validators.compose([Reservations.validateDate, Validators.required])
      ),
      expiryDate: new UntypedFormControl(
        null,
        Validators.compose([Reservations.validateDate, Reservations.expiryDateValidator])
      ),
      arrivalTime: new UntypedFormControl(
        { value: null, disabled: !this.expiryDate?.value },
        Validators.compose([Validators.required, Reservations.validateDate])
      ),
      departureTime: new UntypedFormControl(
        { value: null, disabled: this.arrivalTime?.value },
        Validators.compose([Validators.required, Reservations.validateDate])
      ),
      carID: new UntypedFormControl(null),
      car: new UntypedFormControl(null),
      type: new FormControl<ReservationType>(
        ReservationType.RESERVE_NOW,
        Validators.compose([Validators.required])
      ),
    });
    this.expiryDate = this.formGroup.controls['expiryDate'];
    this.fromDate = this.formGroup.controls['fromDate'];
    this.toDate = this.formGroup.controls['toDate'];
    this.arrivalTime = this.formGroup.controls['arrivalTime'];
    this.departureTime = this.formGroup.controls['departureTime'];
    this.userID = this.formGroup.controls['userID'];
    this.user = this.formGroup.controls['user'];
    this.visualTagID = this.formGroup.controls['visualTagID'];
    this.tag = this.formGroup.controls['tag'];
    this.parentIdTag = this.formGroup.controls['parentIdTag'];
    this.parentTag = this.formGroup.controls['parentTag'];
    this.carID = this.formGroup.controls['carID'];
    this.car = this.formGroup.controls['car'];
    this.type = this.formGroup.controls['type'];
    this.user.setValue(Utils.buildUserFullName(this.loggedUser));
    this.userID.setValue(this.loggedUser.id);
    if (this.connectorStatus !== ChargePointStatus.AVAILABLE) {
      this.type.setValue(ReservationType.PLANNED_RESERVATION);
      this.type.disable();
      this.expiryDate.disable();
    }
    // Per default
    if (this.type.value === ReservationType.RESERVE_NOW) {
      this.fromDate.disable();
      this.toDate.disable();
      this.arrivalTime.disable();
      this.departureTime.disable();
    }
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
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'reservations.select_user',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
      },
    };
    // Open
    this.dialog
      .open(UsersDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          this.selectedUser = result[0].objectRef as User;
          this.user.setValue(Utils.buildUserFullName(this.selectedUser));
          this.userID.setValue(this.selectedUser.id);
          this.tag.reset();
          this.visualTagID.reset();
          this.selectedTag = null;
          this.formGroup.markAsDirty();
          this.loadUserSessionContext();
        }
      });
  }

  public assignTag() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      title: 'reservations.select_tag',
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value,
        Issuer: true,
      },
    };
    // Show
    this.dialog
      .open(TagsDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          this.selectedTag = result[0].objectRef as Tag;
          this.tag.setValue(Utils.buildTagName(this.selectedTag));
          this.visualTagID.setValue(this.selectedTag.visualID);
          this.formGroup.markAsDirty();
        }
      });
  }

  public assignCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
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
          this.formGroup.markAsDirty();
        }
      });
  }

  public onReservationTypeChanged(event: MatRadioChange) {
    this.type.setValue(event.value);
    if (this.type.value === ReservationType.RESERVE_NOW) {
      this.fromDate.disable();
      this.toDate.disable();
      this.arrivalTime.disable();
      this.expiryDate.enable();
    } else {
      this.fromDate.enable();
      this.toDate.enable();
      this.arrivalTime.enable();
      this.departureTime.enable();
      this.expiryDate.disable();
    }
  }

  public determineMinDate(control: string): Date {
    const givenDate = moment(this.formGroup.controls[control]?.value ?? '');
    const actualDate = moment();
    if (!givenDate.isValid()) {
      return actualDate.toDate();
    }
    return givenDate.isBefore(actualDate) ? givenDate.toDate() : actualDate.toDate();
  }

  public isDateProvided() {
    return (
      !!this.expiryDate?.value ||
      (!!this.toDate?.value &&
        !!this.fromDate?.value &&
        !!this.arrivalTime?.value &&
        !!this.departureTime?.value)
    );
  }

  public onDateChanged(event: MatDatepickerInputEvent<Date>, control: string) {
    if (!event.target?.value) {
      return;
    }
    this.formGroup.controls[control].setValue(event.target.value);
    this.formGroup.controls[control].markAsTouched();
    this.formGroup.controls[control].markAsDirty();
  }

  public createReservation() {
    if (this.formGroup.valid) {
      const reservation: Reservation = {
        id: null,
        chargingStationID: this.chargingStationID,
        connectorID: this.connectorID,
        expiryDate: this.expiryDate.value ?? this.toDate.value,
        fromDate: this.fromDate.value ?? moment().toDate(),
        toDate: this.toDate.value ?? this.expiryDate.value,
        arrivalTime: this.arrivalTime.value ?? moment().toDate(),
        departureTime: this.departureTime.value ?? this.expiryDate.value,
        visualTagID: this.visualTagID.value,
        carID: this.carID.value,
        userID: this.userID.value,
        parentIdTag: this.parentIdTag.value,
        type: this.type.value,
      };
      this.dialogRef.close([reservation, this.user.value]);
    }
  }

  public cancel() {
    this.dialog.closeAll();
  }

  private tagActiveValidator(tagControl: AbstractControl): ValidationErrors | null {
    // Check the object
    if (!this.selectedTag || this.selectedTag.active) {
      return null;
    }
    return { inactive: true };
  }
}
