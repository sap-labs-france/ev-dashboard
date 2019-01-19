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
import { MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';

@Component({
  selector: 'app-charging-stations-cmp',
  templateUrl: 'charging-stations.component.html',
  styleUrls: ['charging-stations-data-source-table.scss'],
  styles: ['.fulldetails app-detail-component-container{width: 100%}']
})
export class ChargingStationsComponent implements OnInit {
  private messages;
  public chargingStationsDataSource: ChargingStationsDataSource;

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
    this.chargingStationsDataSource = new ChargingStationsDataSource(
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
