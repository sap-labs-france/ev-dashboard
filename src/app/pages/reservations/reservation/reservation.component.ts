import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { DialogMode, ReservationsAuthorizations } from 'types/Authorization';
import { RestResponse } from 'types/GlobalType';
import { Reservation, ReservationType } from 'types/Reservation';
import { Utils } from 'utils/Utils';
import { ComponentService } from 'services/component.service';
import { WindowService } from 'services/window.service';
import { TenantComponents } from 'types/Tenant';
import { ActionResponse } from 'types/DataResult';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';
import { ReservationMainComponent } from './main/reservation-main.component';

@Component({
  selector: 'app-reservation',
  templateUrl: 'reservation.component.html',
  styleUrls: ['reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
  @Input() public currentReservationID: number;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public reservationsAuthorizations!: ReservationsAuthorizations;

  @ViewChild('reservationMainComponent') public reservationMainComponent!: ReservationMainComponent;

  public formGroup!: UntypedFormGroup;
  public isReservationComponentActive: boolean;
  // public canListChargingStations: boolean;
  public canListUsers: boolean;
  public readOnly = true;
  public reservation: Reservation;
  public activeTabIndex = 0;

  public constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private componentService: ComponentService,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService
  ) {
    // super(activatedRoute,windowService, ['main','smartcharging'],false); for extends AbstractTabComponent
    this.isReservationComponentActive = this.componentService.isActive(
      TenantComponents.RESERVATION
    );
  }

  public ngOnInit() {
    this.formGroup = new UntypedFormGroup({});
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    this.canListUsers = Utils.convertToBoolean(this.reservationsAuthorizations.canListUsers);
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    this.loadReservation();
  }

  public onClose() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveReservation.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveReservation.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public loadReservation() {
    if (this.currentReservationID) {
      this.spinnerService.show();
      this.centralServerService.getReservation(this.currentReservationID).subscribe({
        next: (reservation: Reservation) => {
          this.spinnerService.hide();
          this.reservation = reservation;
          if (this.readOnly) {
            setTimeout(() => this.formGroup.disable(), 0);
          }
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('reservations.action_error.general.not_found');
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'reservations.action_error.general.not_found'
              );
          }
        },
      });
    }
  }

  public closeDialog(saved: boolean = false): void {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public saveReservation(reservation: Reservation): void {
    if (this.currentReservationID) {
      this.updateReservation(reservation);
    } else {
      this.createReservation(reservation);
    }
  }

  public changeActivePane(tabChangedEvent: MatTabChangeEvent) {
    this.activeTabIndex = tabChangedEvent.index;
  }

  private updateReservation(reservation: Reservation) {
    this.spinnerService.show();
    if (reservation.type === ReservationType.RESERVE_NOW) {
      reservation.fromDate = moment().toDate();
      reservation.toDate = reservation.expiryDate;
    } else {
      reservation.expiryDate = Utils.buildDateTimeObject(
        reservation.toDate,
        reservation.departureTime
      );
    }
    this.centralServerService.updateReservation(reservation).subscribe({
      next: (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('reservations.dialog.update.success', {
            chargingStationID: reservation.chargingStationID,
            connectorID: Utils.getConnectorLetterFromConnectorID(reservation.connectorID),
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'reservations.dialog.update.error'
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.spinnerService.hide();
        Utils.handleReservationErrorResponse(
          error,
          this.messageService,
          this.router,
          this.centralServerService
        );
      },
    });
  }

  private createReservation(reservation: Reservation) {
    if (!reservation.connectorID) {
      reservation.connectorID = 0;
    }
    if (!reservation.fromDate && !reservation.toDate) {
      reservation.fromDate = moment().toDate();
      reservation.toDate = reservation.expiryDate;
      reservation.arrivalTime = reservation.fromDate;
      reservation.departureTime = reservation.expiryDate;
    }
    if (!reservation.expiryDate) {
      reservation.expiryDate = Utils.buildDateTimeObject(
        reservation.toDate,
        reservation.departureTime
      );
    }
    this.spinnerService.show();
    this.centralServerService.createReservation(reservation).subscribe({
      next: (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('reservations.dialog.create.success', {
            chargingStationID: reservation.chargingStationID,
            connectorID: Utils.getConnectorLetterFromConnectorID(reservation.connectorID),
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'reservations.dialog.create.error'
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.spinnerService.hide();
        Utils.handleReservationErrorResponse(
          error,
          this.messageService,
          this.router,
          this.centralServerService
        );
      },
    });
  }
}
