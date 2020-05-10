import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-car-catalog [currentCarCatalogID]="carCatalogID" [inDialog]="true" [dialogRef]="dialogRef"></app-car-catalog>',
})
export class CarCatalogDialogComponent {
  public carCatalogID!: number;

  constructor(
    public dialogRef: MatDialogRef<CarCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: number) {
    if (data) {
      this.carCatalogID = data;
    }
  }
}
