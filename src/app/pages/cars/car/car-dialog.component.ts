import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CarAuthorizationActions, DialogMode, DialogParamsWithAuth } from 'types/Authorization';
import { Car } from 'types/Car';

import { Utils } from '../../../utils/Utils';
import { CarComponent } from './car.component';

@Component({
  template: '<app-car #appRef [currentCarID]="carID" [dialogMode]="dialogMode" [dialogRef]="dialogRef" [carAuthorizationActions]="carAuthorizationActions"></app-car>',
})
export class CarDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CarComponent;
  public carID!: string;
  public dialogMode!: DialogMode;
  public carAuthorizationActions!: CarAuthorizationActions;

  public constructor(
    public dialogRef: MatDialogRef<CarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<Car, CarAuthorizationActions>) {
    this.carID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    this.carAuthorizationActions = {
      canListUsers: dialogParams.authorizations?.canListUsers,
      canListCarCatalog: dialogParams.authorizations?.canListCarCatalog,
      canCreatePoolCar: dialogParams.authorizations?.canCreatePoolCar
    }
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveCar.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
