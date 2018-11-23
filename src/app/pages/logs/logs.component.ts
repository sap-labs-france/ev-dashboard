import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocaleService} from '../../services/locale.service';
import {CentralServerService} from '../../services/central-server.service';
import {SpinnerService} from '../../services/spinner.service';
import {AuthorizationService} from '../../services/authorization-service';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {MessageService} from '../../services/message.service';
import {LogsDataSource} from './logs-data-source-table';
import {AppDatePipe} from '../../shared/formatters/app-date.pipe';

@Component({
  selector: 'app-logs-cmp',
  templateUrl: 'logs.component.html'
})
export class LogsComponent implements OnInit {
  public logsDataSource: LogsDataSource;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private localeService: LocaleService,
    private router: Router,
    private datePipe: AppDatePipe) {
    // Create table data source
    this.logsDataSource = new LogsDataSource(
      this.localeService,
      this.messageService,
      this.spinnerService,
      this.router,
      this.centralServerNotificationService,
      this.centralServerService,
      this.datePipe);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
