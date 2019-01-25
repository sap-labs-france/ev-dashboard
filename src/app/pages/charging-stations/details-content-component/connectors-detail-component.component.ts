import { Component, OnInit } from '@angular/core';
import { TableDef } from '../../../common.types';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../../services/config.service';
import { CentralServerService } from '../../../services/central-server.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DialogService } from '../../../services/dialog.service';
import { DetailComponent } from '../../../shared/table/detail-component/detail-component.component';
import { ConnectorsDataSource } from './connectors-data-source-detail-table';
import { LocaleService } from '../../../services/locale.service';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AuthorizationService } from '../../../services/authorization-service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: '<app-table [dataSource]="connectorsDataSource"></app-table>'
})

export class ConnectorsDetailComponent extends DetailComponent implements OnInit {
  connectorId: string;
  chargerInactive: boolean;
  classDateError: string;
  heartbeatDate: string;
  public connectorsDataSource: ConnectorsDataSource;

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
    this.connectorsDataSource = new ConnectorsDataSource(this.configService,
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
    this.connectorsDataSource.loadData();
  }

  /**
   * setData
   */
  setData(row: any, tabledef: TableDef) {
    this.connectorsDataSource.setCharger(row);
    this.connectorsDataSource.setDetailedDataSource(row.connectors);
  }

  refresh(row: any) {
    this.connectorsDataSource.setCharger(row);
    this.connectorsDataSource.setDetailedDataSource(row.connectors);
  }

}
