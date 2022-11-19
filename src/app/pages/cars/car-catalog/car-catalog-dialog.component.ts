import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DialogMode, DialogParams } from 'types/Authorization';
import { CarCatalog } from 'types/Car';

import { Utils } from '../../../utils/Utils';

@Component({
  template: '<app-car-catalog [dialogMode]="dialogMode" [currentCarCatalogID]="carCatalogID" [inDialog]="true" [dialogRef]="dialogRef"></app-car-catalog>',
})
export class CarCatalogDialogComponent {
  public carCatalogID!: number;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<CarCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<CarCatalog>) {
    this.carCatalogID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
