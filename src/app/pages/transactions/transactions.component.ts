import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../services/locale.service';
import {CentralServerService} from '../../services/central-server.service';
import {SpinnerService} from '../../services/spinner.service';
import {AuthorizationService} from '../../services/authorization-service';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {MessageService} from '../../services/message.service';
import {TransactionsDataSource} from './transactions-data-source-table';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-logs-cmp',
  templateUrl: 'transactions.component.html'
})
export class TransactionsComponent implements OnInit {
  public isAdmin;
  public transactionsDataSource: TransactionsDataSource;
  private messages;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
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
    this.transactionsDataSource = new TransactionsDataSource(
      this.localeService,
      this.messageService,
      this.translateService,
      this.spinnerService,
      this.router,
      this.dialog,
      this.centralServerNotificationService,
      this.centralServerService);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
