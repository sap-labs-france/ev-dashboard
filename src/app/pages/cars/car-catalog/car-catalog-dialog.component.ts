import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogParams } from 'types/Authorization';
import { CarCatalog } from 'types/Car';

import { Utils } from '../../../utils/Utils';

@Component({
  template:
    '<app-car-catalog [currentCarCatalogID]="carCatalogID" [inDialog]="true" [dialogRef]="dialogRef"></app-car-catalog>',
})
export class CarCatalogDialogComponent {
  public carCatalogID!: number;

  public constructor(
    public dialogRef: MatDialogRef<CarCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<CarCatalog>
  ) {
    this.carCatalogID = dialogParams.dialogData?.id;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
