import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ErrorCodeDetailsDialogComponent } from '../../dialogs/error-code-details/error-code-details-dialog.component';

@Component({
  template: `
    <button mat-icon-button color="danger" (click)="showHelpDialog()">
      <mat-icon class="text-danger">info_outline</mat-icon>
    </button>
  `,
  styles: [`.no-margin {
    margin: 0
  }`],
})
export class ErrorCodeDetailsComponent extends CellContentTemplateComponent {
  @Input() row: any;

  constructor(private dialog: MatDialog) {
    super();
  }

  showHelpDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '20vw';
    dialogConfig.data = this.row.errorMessage;
    this.dialog.open(ErrorCodeDetailsDialogComponent, dialogConfig);
  }
}
