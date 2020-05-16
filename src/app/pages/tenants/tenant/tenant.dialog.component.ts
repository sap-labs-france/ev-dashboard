import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-tenant [currentTenantID]="tenantID" [inDialog]="true" [dialogRef]="dialogRef"></app-tenant>',
})
export class TenantDialogComponent {
  public tenantID!: string;

  constructor(
    public dialogRef: MatDialogRef<TenantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.tenantID = data;
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
