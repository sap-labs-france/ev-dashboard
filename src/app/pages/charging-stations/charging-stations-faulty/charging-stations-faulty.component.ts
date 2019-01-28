import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'app/services/locale.service';
import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AuthorizationService } from 'app/services/authorization-service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { MessageService } from 'app/services/message.service';
import { ChargingStationsFaultyDataSource } from './charging-stations-faulty-data-source-table';
import { MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';

@Component({
  selector: 'app-charging-stations-faulty',
  templateUrl: 'charging-stations-faulty.component.html',
  styleUrls: ['../charging-stations-data-source-table.scss'],
  styles: ['.fulldetails app-detail-component-container{width: 100%}']
})
export class ChargingStationsFaultyComponent implements OnInit {
  private messages;
  public chargingStationsFaultyDataSource: ChargingStationsFaultyDataSource;

  constructor(
    private centralServerService: CentralServerService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private authorizationService: AuthorizationService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private centralServerNotificationService: CentralServerNotificationService

  ) {
    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Create table data source
    this.chargingStationsFaultyDataSource = new ChargingStationsFaultyDataSource(
      this.localeService,
      this.messageService,
      this.translateService,
      this.spinnerService,
      this.router,
      this.centralServerNotificationService,
      this.centralServerService,
      this.authorizationService,
      this.dialog,
      this.dialogService
    );
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });
  }
}
