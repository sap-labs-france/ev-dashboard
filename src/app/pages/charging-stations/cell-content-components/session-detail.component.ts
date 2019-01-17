import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Charger, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { LocaleService } from '../../../services/locale.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog-component';

@Component({
  template: `
      <button *ngIf="row.activeTransactionID > 0"
        class="btn-info action-icon-large btn-group btn btn-link btn-info btn-just-icon no-margin"
        (click)="showSessionDialog()"><i class="material-icons">open_in_new</i></button>
  `,
  styles: [`.no-margin {margin: 0}`]

})
export class SessionDetailComponent implements CellContentTemplateComponent {
  //  row: any = {};
  locale: string;

  @Input() row: Connector;

  constructor(localeService: LocaleService,
    private dialog: MatDialog) {
    this.locale = localeService.getCurrentFullLocaleForJS()
  }

  showSessionDialog() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.data = {
      transactionId: this.row.activeTransactionID,
      siteArea: '',
      connector: this.row,
    };
    // Open
    const dialogRef = this.dialog.open(SessionDialogComponent, dialogConfig);
  }

}
