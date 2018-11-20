import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {CentralServerService} from '../../../services/central-server.service';
import {SpinnerService} from '../../../services/spinner.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {MessageService} from '../../../services/message.service';
import {TransactionsInProgressDataSource} from './transactions-in-progress-data-source-table';
import {MatDialog} from '@angular/material';
import {DialogService} from '../../../services/dialog.service';
import {AppDateTimePipe} from '../../../shared/formatters/app-date-time.pipe';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';

@Component({
  selector: 'app-transactions-in-progress',
  templateUrl: 'transactions-in-progress.component.html'
})
export class TransactionsInProgressComponent implements OnInit {
  public isAdmin;
  public transactionsInProgressDataSource: TransactionsInProgressDataSource;
  private messages;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private router: Router,
    private appDateTimePipe: AppDateTimePipe,
    private appUnitPipe: AppUnitPipe
    ) {
    // Get translated messages
    this.translateService.get('logs', {}).subscribe((messages) => {
      this.messages = messages;
    });
    this.isAdmin = this.authorizationService.isAdmin();
    // Create table data source
    this.transactionsInProgressDataSource = new TransactionsInProgressDataSource(
      this.localeService,
      this.messageService,
      this.translateService,
      this.spinnerService,
      this.dialogService,
      this.router,
      this.dialog,
      this.centralServerNotificationService,
      this.centralServerService,
      this.appDateTimePipe,
      this.appUnitPipe
    );
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
