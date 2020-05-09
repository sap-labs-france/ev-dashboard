import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-car [inDialog]="true" [dialogRef]="dialogRef"></app-car>',
})
export class CarDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
  }
}
