import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { CarsDialogComponent } from 'shared/dialogs/cars/cars-dialog.component';
import { ReservableChargingStationsDialogComponent } from 'shared/dialogs/charging-stations/reservable/reservable-charging-stations-dialog.component';
import { ChargingStationConnectorsDialogComponent } from 'shared/dialogs/connectors/connectors-dialog.component';
import { TagsDialogComponent } from 'shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from 'shared/dialogs/users/users-dialog.component';
import { RESERVATION_STATUSES, RESERVATION_TYPES } from 'shared/model/reservations.model';
import { ReservationsAuthorizations } from 'types/Authorization';
import { Car } from 'types/Car';
import { ChargingStation, Connector } from 'types/ChargingStation';
import { KeyValue, RestResponse } from 'types/GlobalType';
import { Reservation, ReservationStatus, ReservationType } from 'types/Reservation';
import { Tag } from 'types/Tag';
import { TenantComponents } from 'types/Tenant';
import { User, UserSessionContext, UserToken } from 'types/User';
import { Constants } from 'utils/Constants';
import { Reservations } from 'utils/Reservations';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-reservation-main',
  templateUrl: 'reservation-main.component.html',
})
export class ReservationMainComponent implements OnInit, OnChanges {
  @Input() public reservation!: Reservation;
  @Input() public formGroup: FormGroup;
  @Input() public readOnly: boolean;
  @Input() public reservationsAuthorizations: ReservationsAuthorizations;

  public siteAreaImage: string;
  public canListUsers: boolean;
  public isReservationComponentActive: boolean;
  public isCarComponentActive: boolean;
  public loggedUser: UserToken;

  public id!: AbstractControl;
  public chargingStationID!: AbstractControl;
  public chargingStation!: AbstractControl;
  public connectorID!: AbstractControl;
  public connector!: AbstractControl;
  public userID!: AbstractControl;
  public user!: AbstractControl;
  public idTag!: AbstractControl;
  public visualTagID!: AbstractControl;
  public tag!: AbstractControl;
  public parentIdTag!: AbstractControl;
  public parentTag!: AbstractControl;
  public fromDate!: AbstractControl;
  public toDate!: AbstractControl;
  public arrivalTime!: AbstractControl;
  public departureTime!: AbstractControl;
  public expiryDate!: AbstractControl;
  public carID!: AbstractControl;
  public car!: AbstractControl;
  public status!: AbstractControl;
  public type!: AbstractControl;

  public reservationTypes: KeyValue[] = RESERVATION_TYPES;
  public reservationStatuses: KeyValue[] = RESERVATION_STATUSES;

  private initialized: boolean;
  private selectedUser: User;
  private selectedTag: Tag;
  private selectedChargingStation: ChargingStation;
  private selectedConnector: Connector;
  private selectedCar: Car;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private messageService: MessageService
  ) {
    this.initialized = false;
    this.isReservationComponentActive = this.componentService.isActive(
      TenantComponents.RESERVATION
    );
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public ngOnInit(): void {
    this.formGroup.addControl('id', new FormControl(null));
    this.formGroup.addControl(
      'chargingStationID',
      new FormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'chargingStation',
      new FormControl(
        { value: '', disabled: !this.isDateProvided() },
        Validators.compose([Validators.required])
      )
    );
    this.formGroup.addControl('connectorID', new FormControl(null));
    this.formGroup.addControl(
      'connector',
      new FormControl({ value: null, disabled: this.isChargingStationAvailable() })
    );
    this.formGroup.addControl('userID', new FormControl(null));
    this.formGroup.addControl('user', new FormControl(null));
    this.formGroup.addControl(
      'tag',
      new FormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'visualTagID',
      new FormControl(null, Validators.compose([Validators.required]))
    );
    this.formGroup.addControl('parentIdTag', new FormControl(null));
    this.formGroup.addControl('parentTag', new FormControl(null));
    this.formGroup.addControl(
      'fromDate',
      new FormControl(
        { value: null, disabled: this.isChargingStationAvailable() },
        Validators.compose([Reservations.validateDate, Validators.required])
      )
    );
    this.formGroup.addControl(
      'toDate',
      new FormControl(
        { value: null, disabled: this.isChargingStationAvailable() },
        Validators.compose([Reservations.validateDate, Validators.required])
      )
    );
    this.formGroup.addControl(
      'expiryDate',
      new FormControl(
        null,
        Validators.compose([Reservations.validateDate, Reservations.expiryDateValidator])
      )
    );
    this.formGroup.addControl('carID', new FormControl(null));
    this.formGroup.addControl('car', new FormControl(null));
    this.formGroup.addControl('status', new FormControl(null));
    this.formGroup.addControl(
      'type',
      new FormControl<ReservationType>(
        ReservationType.RESERVE_NOW,
        Validators.compose([Validators.required])
      )
    );
    this.formGroup.addControl(
      'arrivalTime',
      new FormControl(
        { value: null, disabled: !this.expiryDate?.value },
        Validators.compose([Validators.required, Reservations.validateDate])
      )
    );
    this.formGroup.addControl(
      'departureTime',
      new FormControl(
        { value: null, disabled: !this.arrivalTime?.value },
        Validators.compose([Validators.required, Reservations.validateDate])
      )
    );
    // Form
    this.id = this.formGroup.controls['id'];
    this.chargingStationID = this.formGroup.controls['chargingStationID'];
    this.chargingStation = this.formGroup.controls['chargingStation'];
    this.connectorID = this.formGroup.controls['connectorID'];
    this.connector = this.formGroup.controls['connector'];
    this.expiryDate = this.formGroup.controls['expiryDate'];
    this.fromDate = this.formGroup.controls['fromDate'];
    this.arrivalTime = this.formGroup.controls['arrivalTime'];
    this.departureTime = this.formGroup.controls['departureTime'];
    this.toDate = this.formGroup.controls['toDate'];
    this.userID = this.formGroup.controls['userID'];
    this.user = this.formGroup.controls['user'];
    this.visualTagID = this.formGroup.controls['visualTagID'];
    this.tag = this.formGroup.controls['tag'];
    this.parentIdTag = this.formGroup.controls['parentIdTag'];
    this.parentTag = this.formGroup.controls['parentTag'];
    this.carID = this.formGroup.controls['carID'];
    this.car = this.formGroup.controls['car'];
    this.status = this.formGroup.controls['status'];
    this.type = this.formGroup.controls['type'];
    if (!this.reservationsAuthorizations.canListUsers) {
      this.user.setValue(Utils.buildUserFullName(this.loggedUser));
      this.userID.setValue(this.loggedUser.id);
    }
    // Per default
    if (this.type.value === ReservationType.RESERVE_NOW) {
      this.fromDate.disable();
      this.toDate.disable();
      this.arrivalTime.disable();
      this.departureTime.disable();
    }
    this.initialized = true;
    this.loadReservation();
  }

  public ngOnChanges(): void {
    this.loadReservation();
  }

  public loadReservation() {
    if (this.initialized && this.reservation) {
      if (
        [
          ReservationStatus.CANCELLED,
          ReservationStatus.UNMET,
          ReservationStatus.EXPIRED,
          ReservationStatus.DONE,
        ].includes(this.reservation?.status)
      ) {
        this.formGroup.disable();
      }
      this.id.setValue(this.reservation.id);
      this.chargingStationID.setValue(this.reservation.chargingStationID);
      this.chargingStation.setValue(this.reservation.chargingStation.id);
      this.selectedChargingStation = this.reservation.chargingStation;
      this.connectorID.setValue(this.reservation.connectorID);
      this.selectedConnector = Utils.getConnectorFromID(
        this.selectedChargingStation,
        this.connectorID.value
      );
      this.connector.setValue(
        Utils.getConnectorLetterFromConnectorID(this.selectedConnector.connectorId)
      );
      if (this.reservation.type === ReservationType.PLANNED_RESERVATION) {
        this.fromDate.enable();
        this.toDate.enable();
        this.arrivalTime.enable();
        this.departureTime.enable();
      }
      this.fromDate.setValue(this.reservation.fromDate);
      this.toDate.setValue(this.reservation.toDate);
      this.expiryDate.setValue(this.reservation.expiryDate);
      this.arrivalTime.setValue(this.reservation.arrivalTime);
      this.departureTime.setValue(this.reservation.departureTime);
      this.userID.setValue(this.reservation.tag.userID);
      this.selectedUser = this.reservation.tag.user;
      this.user.setValue(Utils.buildUserFullName(this.selectedUser));
      this.selectedTag = this.reservation.tag;
      this.visualTagID.setValue(this.selectedTag.visualID);
      this.tag.setValue(Utils.buildTagName(this.selectedTag));
      this.parentIdTag.setValue(this.reservation.parentIdTag);
      this.status.setValue(this.reservation.status);
      if (
        ![
          ReservationStatus.CANCELLED,
          ReservationStatus.UNMET,
          ReservationStatus.DONE,
          ReservationStatus.EXPIRED,
        ].includes(this.reservation.status)
      ) {
        this.reservationStatuses = RESERVATION_STATUSES.filter((status) =>
          Constants.ReservationStatusTransitions.filter(
            (transition) => transition.from === this.reservation.status
          )
            .map((transition) => [transition.from, transition.to])
            .flatMap((transition) => transition)
            .includes(status.key)
        );
      }
      this.status.disable();
      this.type.setValue(this.reservation.type);
      this.selectedCar = this.reservation.car;
      this.car.setValue(Utils.buildCarName(this.selectedCar, this.translateService));
      this.carID.setValue(this.selectedCar.id);
      if (this.isDateProvided()) {
        this.chargingStation.enable();
        this.connector.enable();
      }
      // Site Area Image
      if (this.selectedChargingStation?.siteAreaID) {
        this.centralServerService
          .getSiteAreaImage(this.selectedChargingStation.siteAreaID)
          .subscribe({
            next: (image) => {
              this.siteAreaImage = image ?? Constants.NO_IMAGE;
            },
            error: (error) => {
              switch (error.status) {
                case StatusCodes.NOT_FOUND:
                  this.siteAreaImage = Constants.NO_IMAGE;
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'general.unexpected_error_backend'
                  );
              }
            },
          });
      }
    }
  }

  public loadUserSessionContext() {
    if (this.userID.value && this.chargingStationID.value && this.connectorID.value) {
      this.spinnerService.show();
      this.centralServerService
        .getUserSessionContext(
          this.userID.value,
          this.chargingStationID.value,
          this.connectorID.value
        )
        .subscribe({
          next: (userSessionContext: UserSessionContext) => {
            this.spinnerService.hide();
            // Set Tag
            this.selectedTag = userSessionContext.tag;
            this.tag.setValue(
              userSessionContext.tag ? Utils.buildTagName(userSessionContext.tag) : ''
            );
            this.visualTagID.setValue(this.selectedTag.visualID);
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
              this.formGroup.markAsDirty();
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

  public assignChargingStation() {
    const dialogConfig = new MatDialogConfig();
    const fromDate = moment(this.fromDate?.value ?? new Date());
    const arrivalTime = moment(this.arrivalTime?.value ?? new Date());
    const toDate = moment(this.toDate?.value ?? this.expiryDate.value);
    const departureTime = moment(this.departureTime?.value ?? this.expiryDate.value);
    dialogConfig.data = {
      title: 'reservations.select_charger',
      rowMultipleSelection: false,
      canDisplaySiteArea: true,
      staticFilter: {
        WithSiteArea: true,
        Issuer: true,
        FromDate: fromDate.toISOString(),
        ToDate: toDate.toISOString(),
        ArrivalTime: arrivalTime.toISOString(),
        DepartureTime: departureTime.toISOString(),
      },
    };
    this.dialog
      .open(ReservableChargingStationsDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          this.selectedChargingStation = result[0].objectRef as ChargingStation;
          this.chargingStation.setValue(this.selectedChargingStation.id);
          this.chargingStationID.setValue(this.selectedChargingStation.id);
          this.connector.enable();
          this.centralServerService
            .getSiteAreaImage(this.selectedChargingStation.siteAreaID)
            .subscribe({
              next: (image) => {
                this.siteAreaImage = image ?? Constants.NO_IMAGE;
              },
              error: (error) => {
                switch (error.status) {
                  case StatusCodes.NOT_FOUND:
                    this.siteAreaImage = Constants.NO_IMAGE;
                    break;
                  default:
                    Utils.handleHttpError(
                      error,
                      this.router,
                      this.messageService,
                      this.centralServerService,
                      'general.unexpected_error_backend'
                    );
                }
              },
            });
          this.formGroup.markAsDirty();
        }
      });
  }

  public assignConnector() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: 'reservations.select_connector',
      rowMultipleSelection: false,
      staticFilter: {
        id: this.selectedChargingStation.id,
        Issuer: true,
      },
    };
    this.dialog
      .open(ChargingStationConnectorsDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          this.selectedConnector = result[0].objectRef as Connector;
          this.connector.setValue(
            Utils.getConnectorLetterFromConnectorID(this.selectedConnector.connectorId)
          );
          this.connectorID.setValue(this.selectedConnector.connectorId);
          this.formGroup.markAsDirty();
          if (!this.canListUsers) {
            this.loadUserSessionContext();
          }
        }
      });
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

  public isChargingStationAvailable() {
    return Utils.isNullOrUndefined(this.selectedChargingStation);
  }

  public onStatusChanged(event: MatSelectChange) {
    this.status.setValue(event.value);
  }

  public onReservationTypeChanged(event: MatRadioChange) {
    this.type.setValue(event.value);
    this.status.reset();
    if (!Utils.isNullOrUndefined(this.reservation?.status)) {
      this.reservation.status = null;
    }
    if (this.type.value === ReservationType.RESERVE_NOW) {
      this.fromDate.disable();
      this.toDate.disable();
      this.arrivalTime.disable();
      this.departureTime.disable();
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

  public cancelReservation() {
    this.centralServerService.cancelReservation(this.reservation).subscribe({
      next: (response) => {
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('reservations.dialog.cancel_reservation.success', {
            reservationID: this.id.value,
            chargingStationID: this.chargingStationID.value,
          });
          this.dialog.closeAll();
        }
      },
      error: (error) => {
        this.messageService.showErrorMessage('reservations.dialog.cancel_reservation.error', {
          reservationID: this.id.value,
          chargingStationID: this.chargingStationID.value,
        });
      },
    });
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
    if (this.isDateProvided()) {
      this.chargingStation.enable();
    }
  }

  public cancel() {
    this.dialog.closeAll();
  }
}
