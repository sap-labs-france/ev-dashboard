import { Component, Input, OnInit } from '@angular/core';
import { ChargerInError, Charger } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { LocaleService } from 'app/services/locale.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { ChargerErrorCodeDetailsDialogComponent } from 'app/shared/dialogs/chargers/charger-error-code-details-dialog-component';
import { ChargingStations } from 'app/utils/ChargingStations';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private dialog: MatDialog,
      private translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
  }

  showHelpDialog() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '20vw';
    if (this.row.errorCode === 'missingSettings') {
      dialogConfig.data = {
        errorCode: this.row.errorCode,
        missingSettings: `(${ChargingStations.getListOfMissingSettings(<Charger>this.row).map((setting) => {
          return this.translateService.instant(setting.value);
        }).toString()})`
      };
    } else {
      dialogConfig.data = {
        errorCode: this.row.errorCode,
      };
    }
    // Open
    const dialogRef = this.dialog.open(ChargerErrorCodeDetailsDialogComponent, dialogConfig);
  }
}
