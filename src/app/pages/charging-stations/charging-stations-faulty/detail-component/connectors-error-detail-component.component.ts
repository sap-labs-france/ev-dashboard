import { Component, OnInit } from '@angular/core';
import { TableDef } from 'app/common.types';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from 'app/services/config.service';
import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { DialogService } from 'app/services/dialog.service';
import { DetailComponent } from 'app/shared/table/detail-component/detail-component.component';
import { ConnectorsErrorDataSource } from './connectors-error-data-source-detail-table';
import { LocaleService } from 'app/services/locale.service';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { AuthorizationService } from 'app/services/authorization-service';
import { Router } from '@angular/router';
import { MessageService } from 'app/services/message.service';
@Component({
  styleUrls: ['../../charging-stations-data-source-table.scss'],
  template: '<app-table [dataSource]="connectorsErrorDataSource"></app-table>'
})

export class ConnectorsErrorDetailComponent extends DetailComponent implements OnInit {
  connectorId: string;
  chargerInactive: boolean;
  classDateError: string;
  heartbeatDate: string;
  public connectorsErrorDataSource: ConnectorsErrorDataSource;

  constructor(private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private appUnitPipe: AppUnitPipe,
    private dialog: MatDialog,
    private authorizationService: AuthorizationService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private dialogService: DialogService
  ) {
    super();
    this.connectorsErrorDataSource = new ConnectorsErrorDataSource(this.configService,
      this.centralServerService,
      this.translateService,
      this.localeService,
      this.appUnitPipe,
      this.dialog,
      this.authorizationService,
      this.spinnerService,
      this.messageService,
      this.router,
      this.dialogService);
  }

  ngOnInit(): void {
    this.connectorsErrorDataSource.loadData();
  }

  /**
   * setData
   */
  setData(row: any, tabledef: TableDef) {
    this.connectorsErrorDataSource.setCharger(row);
    this.connectorsErrorDataSource.setDetailedDataSource(row.connectors);
  }

  refresh(row: any) {
    this.connectorsErrorDataSource.setCharger(row);
    this.connectorsErrorDataSource.setDetailedDataSource(row.connectors);
  }

}
