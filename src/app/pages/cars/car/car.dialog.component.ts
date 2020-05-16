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
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
