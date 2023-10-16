import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ErrorCodeDetailsDialogComponent } from '../../dialogs/error-code-details/error-code-details-dialog.component';

@Component({
  template: `
    <button mat-icon-button color="danger" (click)="showHelpDialog()">
      <mat-icon class="text-danger">info_outline</mat-icon>
    </button>
  `,
  styles: [
    `
      .no-margin {
        margin: 0;
      }
    `,
  ],
})
export class ErrorCodeDetailsComponent extends CellContentTemplateDirective {
  @Input() public row: any;

  public constructor(private dialog: MatDialog) {
    super();
  }

  public showHelpDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '20vw';
    dialogConfig.data = this.row.errorMessage;
    this.dialog.open(ErrorCodeDetailsDialogComponent, dialogConfig);
  }
}
