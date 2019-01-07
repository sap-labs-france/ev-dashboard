import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../services/locale.service';
import {CentralServerService} from '../../services/central-server.service';
import {SpinnerService} from '../../services/spinner.service';
import {AuthorizationService} from '../../services/authorization-service';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {MessageService} from '../../services/message.service';
import {TenantsDataSource} from './tenants-data-source-table';
import {MatDialog} from '@angular/material';
import {DialogService} from '../../services/dialog.service';
import {LogsDataSource} from '../logs/logs-data-source-table';

@Component({
  selector: 'app-tenants-cmp',
  templateUrl: 'tenants.component.html'
})
export class TenantsComponent implements OnInit {
  constructor(
    public tenantsDataSource: TenantsDataSource) {
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
