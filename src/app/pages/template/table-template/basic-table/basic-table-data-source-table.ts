import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from 'app/shared/table/table-data-source';
import {DropdownItem, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from 'app/common.types';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {DialogService} from 'app/services/dialog.service';
import {CentralServerNotificationService} from 'app/services/central-server-notification.service';
import {TableAutoRefreshAction} from 'app/shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from 'app/shared/table/actions/table-refresh-action';
import {CentralServerService} from 'app/services/central-server.service';
import {LocaleService} from 'app/services/locale.service';
import {MessageService} from 'app/services/message.service';
import {SpinnerService} from 'app/services/spinner.service';
import {SitesTableFilter} from 'app/shared/table/filters/site-filter';
import {Injectable} from '@angular/core';
import {AuthorizationService} from 'app/services/authorization-service';
import {Constants} from 'app/utils/Constants';
import {TableEditAction} from 'app/shared/table/actions/table-edit-action';
import {TableExportAction} from 'app/shared/table/actions/table-export-action';
import {TableOpenInMapsAction} from 'app/shared/table/actions/table-open-in-maps-action';
import {ComponentService} from 'app/services/component.service';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { ChargerTableFilter } from 'app/shared/table/filters/charger-filter';
import { TransactionsDateFromFilter } from 'app/pages/transactions/filters/transactions-date-from-filter';

const DEFAULT_ROW_ACTIONS = [
  new TableEditAction().getActionDef(),
  new TableOpenInMapsAction().getActionDef(),
  new TableDeleteAction().getActionDef()
];

const TEST_DATA = [
  {id: 1, col1: '1.1', col2: '1.2', col3: '1.3', col4: '1.4' },
  {id: 2, col1: '2.1', col2: '2.2', col3: '2.3', col4: '2.4' },
  {id: 3, col1: '3.1', col2: '3.2', col3: '3.3', col4: '3.4' },
  {id: 4, col1: '4.1', col2: '4.2', col3: '4.3', col4: '4.4' },
  {id: 5, col1: '5.1', col2: '5.2', col3: '5.3', col4: '5.4' },
  {id: 6, col1: '6.1', col2: '6.2', col3: '6.3', col4: '6.4' },
]

@Injectable()
export class BasicTableDataSource extends TableDataSource<any> {

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    super();
    this.setStaticFilters([{'WithSite': true}]);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadData(refreshAction: boolean) {
    if (!refreshAction) {
      // Show
      this.spinnerService.show();
    }
    // Get data
    setTimeout(() => {
      if (!refreshAction) {
        // Hide
        this.spinnerService.hide();
      }
      // Set number of records
      this.setNumberOfRecords(TEST_DATA.length);
      // Update page length
      this.updatePaginator();
      this.setData(TEST_DATA);
    }, 800)
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: true
      },
      rowSelection: {
        enabled: false,
        multiple: false
      },
      rowDetails: {
        enabled: false
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    // Build common part for all cases
    return [
      {
        id: 'id',
        name: 'id',
        sortable: true,
        sorted: true,
        direction: 'asc'
      },
      {
        id: 'col1',
        name: 'col1',
        headerClass: 'text-center',
        class: 'text-center',
        sortable: false
      },
      {
        id: 'col2',
        name: 'col2',
        headerClass: 'text-center',
        class: 'text-center',
      },
      {
        id: 'col3',
        name: 'col3',
      },
      {
        id: 'col4',
        name: 'col4',
        sortable: true,
        defaultValue: 'Default',
        headerClass: 'd-none d-xl-table-cell',
        formatter: (value) => {
          return 'formatted ' + value; 
        },
      }
    ]
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500, 1000, 2000];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableDeleteAction().getActionDef(),
      new TableAutoRefreshAction().getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.getTableActionsDef();
    return [
      // new TableOpenInMapsAction().getActionDef(),
      new TableExportAction().getActionDef(),
      ...tableActionsDef,
      new TableCreateAction().getActionDef()
    ];
  }

  public getTableRowActions(): TableActionDef[] {
      return DEFAULT_ROW_ACTIONS;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case 'export':
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('chargers.dialog.export.title'),
          this.translateService.instant('chargers.dialog.export.confirm')
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
          }
        });
        break;
      case 'open_in_maps':
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: any, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      // case 'edit':
      //   break;
      // case 'open_in_maps':
      //   break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableFiltersDef(): TableFilterDef[] {
      return [
        new ChargerTableFilter().getFilterDef(),
        new SitesTableFilter().getFilterDef(),
        new TransactionsDateFromFilter().getFilterDef()
      ];
  }
}
