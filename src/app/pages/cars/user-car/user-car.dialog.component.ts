import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CarCatalog } from 'app/types/Car';

@Component({
  template: '<app-user-car [inDialog]="true" [dialogRef]="dialogRef"></app-user-car>',
})
export class UserCarDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<UserCarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {

  }
}
