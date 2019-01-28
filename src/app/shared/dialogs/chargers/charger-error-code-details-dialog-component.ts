import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Constants} from '../../../utils/Constants';
import {Connector, Image, SiteArea, Transaction} from '../../../common.types';
import {LocaleService} from '../../../services/locale.service';

@Component({
  templateUrl: './charger-error-code-details.dialog.component.html',
})
export class ChargerErrorCodeDetailsDialogComponent implements OnInit {
  errorCodeTitle: string;
  errorCodeDescription: string;
  errorCodeAction: string;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<ChargerErrorCodeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.errorCodeTitle = `chargers.errors.${data.errorCode}.title`;
      this.errorCodeDescription = `chargers.errors.${data.errorCode}.description`;
      this.errorCodeAction = `chargers.errors.${data.errorCode}.action`;
    }
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

}
