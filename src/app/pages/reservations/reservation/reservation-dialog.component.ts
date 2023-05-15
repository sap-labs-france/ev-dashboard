import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { DialogMode, DialogParamsWithAuth, ReservationsAuthorizations } from 'types/Authorization';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utils } from 'utils/Utils';
import { Reservation } from 'types/Reservation';
import { ReservationComponent } from './reservation.component';

@Component({
  template: `<app-reservation
    #appRef
    [currentReservationID]="reservationID"
    [dialogMode]="dialogMode"
    [dialogRef]="dialogRef"
    [reservationsAuthorizations]="reservationsAuthorizations"
  ></app-reservation>`,
})
export class ReservationDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ReservationComponent;
  public reservationID!: number;
  public dialogMode!: DialogMode;
  public reservationsAuthorizations!: ReservationsAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    dialogParams: DialogParamsWithAuth<Reservation, ReservationsAuthorizations>
  ) {
    this.reservationID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    this.reservationsAuthorizations = dialogParams.authorizations;
  }

  public ngAfterViewInit(): void {
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveReservation.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
