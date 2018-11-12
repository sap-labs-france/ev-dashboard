import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {CentralServerService} from '../../../services/central-server.service';
import {SpinnerService} from '../../../services/spinner.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {MessageService} from '../../../services/message.service';
import {TransactionsHistoryDataSource} from './transactions-history-data-source-table';
import {MatDialog} from '@angular/material';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-transactions-history',
  templateUrl: 'transactions-history.component.html'
})
export class TransactionsHistoryComponent implements OnInit {
  public isAdmin;
  public transactionsHistoryDataSource: TransactionsHistoryDataSource;
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
    private router: Router) {
    // Get translated messages
    this.translateService.get('logs', {}).subscribe((messages) => {
      this.messages = messages;
    });
    this.isAdmin = this.authorizationService.isAdmin();
    // Create table data source
    this.transactionsHistoryDataSource = new TransactionsHistoryDataSource(
      this.localeService,
      this.messageService,
      this.translateService,
      this.spinnerService,
      this.dialogService,
      this.router,
      this.dialog,
      this.centralServerNotificationService,
      this.centralServerService
    );
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
