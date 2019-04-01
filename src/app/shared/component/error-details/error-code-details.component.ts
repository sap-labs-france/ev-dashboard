import {Component, Input, OnInit} from '@angular/core';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ErrorCodeDetailsDialogComponent} from '../../dialogs/error-details/error-code-details-dialog.component';

@Component({
  template: `
    <button mat-raised-button class="btn-info action-icon-large btn btn-link btn-just-icon no-margin"
            (click)="showHelpDialog()">
      <i class="material-icons">info_outline</i>
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
