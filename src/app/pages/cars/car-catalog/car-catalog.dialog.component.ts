import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-car-catalog [currentCarCatalogID]="carCatalogID" [inDialog]="true" [dialogRef]="dialogRef"></app-car-catalog>',
})
export class CarCatalogDialogComponent {
  carCatalogID!: number;

  constructor(
    public dialogRef: MatDialogRef<CarCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: number) {
    if (data) {
      this.carCatalogID = data;
    }
  }
}
