import { Component, Input, OnInit } from '@angular/core';
import { ChargerInError } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { LocaleService } from 'app/services/locale.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { ChargerErrorCodeDetailsDialogComponent } from 'app/shared/dialogs/chargers/charger-error-code-details-dialog-component';

@Component({
  template: `
  <button class="btn-info action-icon-large btn-group btn btn-link btn-just-icon no-margin"
  (click)="showHelpDialog()">
      <i class="material-icons">info_outline</i>
    </button>
  `,
  styles: [`.no-margin {margin: 0}`]
})
export class ChargerErrorCodeComponent extends CellContentTemplateComponent implements OnInit {

  @Input() row: ChargerInError;

  constructor(private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
  }

  showHelpDialog() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '20vw';
    dialogConfig.data = {
      errorCode: this.row.errorCode
    };
    // Open
    const dialogRef = this.dialog.open(ChargerErrorCodeDetailsDialogComponent, dialogConfig);
  }
}
