import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from '../../services/locale.service';
import { CentralServerService } from '../../services/central-server.service';
import { SpinnerService } from '../../services/spinner.service';
import { AuthorizationService } from '../../services/authorization-service';
import { CentralServerNotificationService } from '../../services/central-server-notification.service';
import { MessageService } from '../../services/message.service';
import { ChargingStationsDataSource } from './charging-stations-data-source-table';

@Component({
  selector: 'app-charging-stations-cmp',
  templateUrl: 'charging-stations.component.html'
})
export class ChargingStationsComponent implements OnInit {
  private messages;
  public isAdmin;
  public chargingStationsDataSource: ChargingStationsDataSource;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private router: Router,
  ) {
    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
    // Create table data source
    this.chargingStationsDataSource = new ChargingStationsDataSource(
      this.localeService,
      this.messageService,
      this.translateService,
      this.spinnerService,
      this.router,
      this.centralServerNotificationService,
      this.centralServerService
    );
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });
  }
}
