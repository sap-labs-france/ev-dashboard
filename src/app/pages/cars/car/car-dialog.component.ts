import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CarsAuthorizations, DialogMode, DialogParamsWithAuth } from 'types/Authorization';
import { Car } from 'types/Car';

import { Utils } from '../../../utils/Utils';
import { CarComponent } from './car.component';

@Component({
  template:
    '<app-car #appRef [currentCarID]="carID" [dialogMode]="dialogMode" [dialogRef]="dialogRef" [carsAuthorizations]="carsAuthorizations"></app-car>',
})
export class CarDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CarComponent;
  public carID!: string;
  public dialogMode!: DialogMode;
  public carsAuthorizations!: CarsAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<CarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<Car, CarsAuthorizations>
  ) {
    this.carID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    this.carsAuthorizations = dialogParams.authorizations;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveCar.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
