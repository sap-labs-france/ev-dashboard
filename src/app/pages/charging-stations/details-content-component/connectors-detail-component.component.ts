import {Component} from '@angular/core';
import {TableDef} from '../../../common.types';
import {MatDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '../../../services/config.service';
import {CentralServerService} from '../../../services/central-server.service';

import {DetailComponent} from '../../../shared/table/detail-component/detail-component.component';
import {ConnectorsDataSource} from './connectors-data-source-detail-table';
import {LocaleService} from '../../../services/locale.service';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';
import {AuthorizationService} from '../../../services/authorization-service';
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: '<app-simple-table [dataSource]="connectorsDataSource"></app-simple-table>'
})

export class ConnectorsDetailComponent implements DetailComponent {
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
              private authorizationService: AuthorizationService) {
    this.connectorsDataSource = new ConnectorsDataSource(this.configService,
      this.centralServerService,
      this.translateService,
      this.localeService,
      this.appUnitPipe,
      this.dialog,
      this.authorizationService);
  }

  /**
   * setData
   */
  setData(row: any, tabledef: TableDef) {
    this.connectorsDataSource.setDetailedDataSource(row.connectors);
    this.connectorsDataSource.loadData();
  }

}
