import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-car [currentCarID]="carID" [inDialog]="true" [dialogRef]="dialogRef"></app-car>',
})
export class CarDialogComponent {
  public carID!: string;

  constructor(
    public dialogRef: MatDialogRef<CarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
      this.carID = data;
    }
}
