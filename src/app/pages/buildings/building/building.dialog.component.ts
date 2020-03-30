import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-building [currentBuildingID]="buildingID" [inDialog]="true" [dialogRef]="dialogRef"></app-building>',
})
export class BuildingDialogComponent {
  buildingID!: string;

  constructor(
    public dialogRef: MatDialogRef<BuildingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.buildingID = data;
    }
  }
}
