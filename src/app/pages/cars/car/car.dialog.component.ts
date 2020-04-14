import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-car [currentCarID]="carID" [inDialog]="true" [dialogRef]="dialogRef"></app-car>',
})
export class CarDialogComponent {
  carID!: number;

  constructor(
    public dialogRef: MatDialogRef<CarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: number) {
    if (data) {
      this.carID = data;
    }
  }
}
