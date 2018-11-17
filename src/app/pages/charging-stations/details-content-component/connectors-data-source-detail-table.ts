import { TranslateService } from '@ngx-translate/core';
import { Charger, Connector, SubjectInfo, TableColumnDef, TableActionDef, TableFilterDef, TableDef } from '../../../common.types';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../../services/central-server.service';
import { MatDialog } from "@angular/material";
import {ConfigService} from '../../../services/config.service';
import { SimpleTableDataSource } from '../../../shared/table/simple-table/simple-table-data-source';
import { ConnectorAvailibilityComponent } from "./connector-availibility.component";

export class ConnectorsDataSource extends SimpleTableDataSource<Connector> {
  constructor(private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    super();
  }

  public loadData() {
    // Set number of records
    this.setNumberOfRecords(this.getData().length);
    // Return connector
    this.getDataSubjet().next(this.getData());
  }

  setDetailedDataSource(row) {
    this.setData(row);
    this.loadData();
  }

  public getTableDef(): TableDef {
    return {
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
        enabled: false,
        detailsField: 'detailsComponent'
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    return [
      {
        id: 'connectorId',
        name: this.translateService.instant('chargers.connector'),
        headerClass: 'col-5p',
        class: 'col-5p'
      },
      {
        id: 'status',
        name: this.translateService.instant('chargers.status_available'),
        headerClass: 'col-5p',
        isAngularComponent: true,
        angularComponentName: ConnectorAvailibilityComponent
      },
      {
        id: 'currentConsumption',
        name: this.translateService.instant('chargers.connector'),
        headerClass: 'col-5p',
        class: 'charger-connector'
      },
      {
        id: 'totalConsumption',
        name: this.translateService.instant('chargers.charger_kw'),
        headerClass: 'col-5p',
        class: 'col-5p'
      },
      {
        id: 'type',
        name: this.translateService.instant('chargers.vendor'),
        headerClass: 'col-5p',
        class: 'col-5p'
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef()
    ];
  }

}
