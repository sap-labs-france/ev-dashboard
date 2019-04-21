import {TranslateService} from '@ngx-translate/core';
import {Charger, Connector, TableActionDef, TableColumnDef, TableDef} from 'app/common.types';
import {CentralServerService} from 'app/services/central-server.service';
import {MatDialog} from '@angular/material';
import {ConfigService} from 'app/services/config.service';
import {Router} from '@angular/router';
import {MessageService} from 'app/services/message.service';
import {DialogService} from 'app/services/dialog.service';
import {ConnectorAvailibilityComponent} from '../../cell-content-components/connector-availibility.component';
import {AppConnectorErrorCodePipe} from 'app/shared/formatters/app-connector-error-code.pipe';
import {ConnectorCellComponent} from 'app/shared/component/connector/connector-cell.component';
import {LocaleService} from 'app/services/locale.service';
import {AppUnitPipe} from 'app/shared/formatters/app-unit.pipe';
import {SpinnerService} from 'app/services/spinner.service';
import {AuthorizationService} from 'app/services/authorization-service';
import {TableDataSource} from 'app/shared/table/table-data-source';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ConnectorsErrorDataSource extends TableDataSource<Connector> {

  private charger: Charger;
  private connectorTransactionAuthorization;

  constructor(
      private configService: ConfigService,
      private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private localeService: LocaleService,
      private appUnitPipe: AppUnitPipe,
      private dialog: MatDialog,
      private authorizationService: AuthorizationService,
      private spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private dialogService: DialogService) {
    super();
    // Init
    this.initDataSource();
  }

  public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      // Set number of records
      this.setNumberOfRecords(this.getData().length);
      // // Return connector
      if (this.charger && this.buildTableColumnDefs()) {
        // Ok
        observer.next(this.charger.connectors);
      }
      observer.complete();
    });
  }

  public setCharger(charger: Charger) {
    this.charger = charger;
  }

  setDetailedDataSource(row, autoRefresh = false) {
    if (autoRefresh) {
      this.refreshReload(); // will call loadData
    } else {
      this.loadData().subscribe();
    }
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-detailed-list',
      rowSelection: {
        enabled: false
      },
      footer: {
        enabled: false
      },
      search: {
        enabled: false
      },
      rowDetails: {
        enabled: false
      },
      rowFieldNameIdentifier: 'connectorId',
      isSimpleTable: true,
      design: {
        flat: true
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'connectorId',
        name: 'chargers.connector',
        headerClass: 'text-center',
        class: 'text-center',
        sortable: false,
        isAngularComponent: true,
        angularComponentName: ConnectorCellComponent
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        headerClass: 'text-center',
        class: '',
        isAngularComponent: true,
        angularComponentName: ConnectorAvailibilityComponent,
        sortable: false
      },
      {
        id: 'errorCode',
        name: 'chargers.connector_error_title',
        formatter: (errorCode) => {
          return new AppConnectorErrorCodePipe(this.translateService).transform(errorCode);
        },
        sortable: false
      },
      {
        id: 'info',
        name: 'chargers.connector_info_title',
        sortable: false
      },
      {
        id: 'vendorErrorCode',
        name: 'chargers.connector_vendor_error_code_title',
        sortable: false
      }
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [];
  }

  public buildTableRowActions(rowItem: Connector): TableActionDef[] {
    return [];
  }

  buildSpecificRowActions(rowItem): TableActionDef[] {
    return [];

  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Connector) {
  }

}
