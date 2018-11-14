import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocaleService} from '../../services/locale.service';
import {CentralServerService} from '../../services/central-server.service';
import {SpinnerService} from '../../services/spinner.service';
import {AuthorizationService} from '../../services/authorization-service';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {MessageService} from '../../services/message.service';
import {LogDataSource} from './log-data-source-table';
import {AppDateTimePipe} from '../../shared/formatters/app-date-time.pipe';

@Component({
  selector: 'app-logs-cmp',
  templateUrl: 'logs.component.html'
})
export class LogsComponent implements OnInit {
  public isAdmin;
  public logDataSource: LogDataSource;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private localeService: LocaleService,
    private router: Router,
    private appDateTimePipe: AppDateTimePipe) {
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
    // Create table data source
    this.logDataSource = new LogDataSource(
      this.localeService,
      this.messageService,
      this.spinnerService,
      this.router,
      this.centralServerNotificationService,
      this.centralServerService,
      this.appDateTimePipe);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
