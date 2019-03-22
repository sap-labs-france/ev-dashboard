import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {LocaleService} from '../../../services/locale.service';

@Component({
  templateUrl: './error-code-details.dialog.component.html',
})
export class ErrorCodeDetailsDialogComponent implements OnInit {
  error: ErrorMessage;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<ErrorCodeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.error = data;
    }
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }
}

export class ErrorMessage {
  constructor(
    public title: string,
    public titleParameters: any = {},
    public description: string,
    public descriptionParameters: any = {},
    public action: string,
    public actionParameters: any = {}) {
  }
}
