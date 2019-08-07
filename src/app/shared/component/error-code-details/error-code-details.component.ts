import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ErrorCodeDetailsDialogComponent } from '../../dialogs/error-code-details/error-code-details-dialog.component';

@Component({
  template: `
    <button mat-icon-button color="primary" (click)="showHelpDialog()">
      <mat-icon>info_outline</mat-icon>
    </button>
  `,
  styles: [`.no-margin {
    margin: 0
  }`]
})
export class ErrorCodeDetailsComponent extends CellContentTemplateComponent implements OnInit {
  @Input() row: any;

  constructor(private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
  }

  showHelpDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '20vw';
    dialogConfig.data = this.row.errorMessage;
    this.dialog.open(ErrorCodeDetailsDialogComponent, dialogConfig);
  }
}
