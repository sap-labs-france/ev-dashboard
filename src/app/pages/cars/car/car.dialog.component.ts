import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParams } from 'types/Authorization';
import { Car } from 'types/Car';

import { Utils } from '../../../utils/Utils';
import { CarComponent } from './car.component';

@Component({
  template: '<app-car #appRef [currentCarID]="carID" [dialogMode]="dialogMode" [dialogRef]="dialogRef"></app-car>',
})
export class CarDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CarComponent;
  public carID!: string;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<CarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<Car>) {
    this.carID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveCar.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
