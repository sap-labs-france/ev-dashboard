import {Component, Input, OnInit} from '@angular/core';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {LocaleService} from '../../../services/locale.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import {SessionDialogComponent} from 'app/shared/dialogs/session/session-dialog-component';
import {AuthorizationService} from 'app/services/authorization-service';
import {CentralServerService} from 'app/services/central-server.service';

@Component({
  template: `
    <button *ngIf="row.activeTransactionID > 0 && displaySessionAuthorized"
            class="btn-info action-icon-large btn btn-link btn-info btn-just-icon no-margin"
            (click)="showSessionDialog()"><i class="material-icons">open_in_new</i></button>
  `,
  styles: [`.no-margin {
      margin: 0
  }`]

})
export class SessionDetailComponent extends CellContentTemplateComponent implements OnInit {
  @Input() row: any;
  locale: string;
  displaySessionAuthorized: boolean;
  dialogRef: MatDialogRef<SessionDialogComponent>;

  constructor(localeService: LocaleService,
              private authorizationService: AuthorizationService,
              private centralServerService: CentralServerService,
              private dialog: MatDialog) {
    super();
    this.locale = localeService.getCurrentFullLocaleForJS();
  }

  showSessionDialog() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (this.row) {
      dialogConfig.data = {
        transactionId: this.row.activeTransactionID,
        siteArea: '',
        connector: this.row,
      };
    }
    // Open
    this.dialogRef = this.dialog.open(SessionDialogComponent, dialogConfig);
  }

  refresh() {
    if (this.dialogRef && this.dialogRef.componentInstance) {
      this.dialogRef.componentInstance.refresh();
    }
  }

  ngOnInit(): void {
    this.displaySessionAuthorized = this.authorizationService.isAdmin() || this.authorizationService.isDemo();
  }
}
