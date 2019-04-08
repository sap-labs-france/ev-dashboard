import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog, MatPaginator, MatSort, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Subject, Subscription} from 'rxjs';
import {DropdownItem, TableActionDef, TableDef, TableFilterDef} from '../../common.types';
import {ConfigService} from '../../services/config.service';
import {CentralServerService} from '../../services/central-server.service';
import {TableDataSource} from './table-data-source';
import {TableFilter} from './filters/table-filter';
import {DetailComponentContainer} from './detail-component/detail-component-container.component';
import {LocaleService} from '../../services/locale.service';
import {MatDatetimepickerInputEvent} from '@mat-datetimepicker/core';
import { SpinnerService } from 'app/services/spinner.service';

const DEFAULT_POLLING = 10000;

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataSource: TableDataSource<any>;
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  public autoRefeshChecked = true;
  public ongoingAutoRefresh = false;
  public ongoingManualRefresh = false;

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChildren(DetailComponentContainer) detailComponentContainers: QueryList<DetailComponentContainer>;

  private autoRefreshObserver: Subscription;
  private manualRefreshObserver: Subscription;
  private rowRefreshObserver: Subscription;
  private displayDetailObserver: Subscription;
  private footer = false;
  private filters: TableFilter[] = [];

  constructor(
    private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    protected localService: LocaleService,
    public spinnerService: SpinnerService,
    private dialog: MatDialog) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
    console.log('table.component - constructor');
  }

  ngOnInit() {
    console.log('table.component - ngOnInit');
    // Handle locale (local service available only in component not possible in data-source)
    this.dataSource.changeLocaleTo(this.localService.getCurrentFullLocaleForJS());
    // Handle Poll (config service available only in component not possible in data-source)
    if (this.configService.getCentralSystemServer().pollEnabled) {
      this.dataSource.setPollingInterval(this.configService.getCentralSystemServer().pollIntervalSecs ?
        this.configService.getCentralSystemServer().pollIntervalSecs * 1000 : DEFAULT_POLLING);
    }
    // Extract columns for the template
    this.columns = this.dataSource.tableColumnDefs.map((column) => column.id);
    // Row Selection enabled?
    if (this.dataSource.isRowSelectionEnabled()) {
      // Yes: Add Select column
      this.columns = ['select', ...this.columns];
    }
    // Row Detailed enabled?
    if (this.dataSource.isRowDetailsEnabled()) {
      // Yes: Add Details column
      this.columns = ['details', ...this.columns];
      // Check if detail display columns must be displayed
      this.displayDetailObserver = this.dataSource.subscribeDisplayDetailsColumn((displayDetails) => {
        if (!displayDetails) {
          // Hide details column
          const indexDetails = this.columns.findIndex((element) => element === 'details');
          if (indexDetails >= 0) {
            this.columns.splice(indexDetails, 1);
          }
        } else {
          // Add details column
          const indexDetails = this.columns.findIndex((element) => element === 'details');
          if (indexDetails === -1) {
            this.columns = ['details', ...this.columns];
          }
        }
      });
    }
    // Is there specific row actions ?
    if (this.dataSource.hasRowActions) {
      // Yes add a new column actions
      this.columns = [...this.columns, 'actions'];
    }
    // Init paginator
    this.pageSizes = this.dataSource.getPaginatorPageSizes();
    // Search?
    if (this.dataSource.tableDef.search) {
      // Yes: Listen to Search change
      this.searchSourceSubject.pipe(
        debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
        distinctUntilChanged()).subscribe(() => {
          // Reset paginator
          this.paginator.pageIndex = 0;
          // Trigger load data
          this.loadData();
        }
      );
    }
    // Load the data
    this.loadData();
    // Auto Refresh Actions?
    if (this.dataSource.getTableActionsRightDef().findIndex(action => action.id === 'auto-refresh') >= 0) {
      // subscribe to auto-refresh
      this.autoRefreshObserver = this.dataSource.subscribeAutoRefresh(value =>
        this.ongoingManualRefresh = value
      );
    }
    if (this.dataSource.getTableActionsRightDef().findIndex(action => action.id === 'refresh') >= 0) {
      // subscribe to manual-refresh
      this.manualRefreshObserver = this.dataSource.subscribeManualRefresh(value =>
        this.ongoingManualRefresh = value
      );
    }
    // Subscribe to row-refresh
    this.rowRefreshObserver = this.dataSource.subscribeRowRefresh(row => {
      this._rowRefresh(row);
    });

  }

  ngAfterViewInit() {
    console.log('table.component - ngAfterViewInit');
    // Assign the Paginator
    this.dataSource.setPaginator(this.paginator);
    // Init the sorting coloumn
    // Find Sorted columns
    const columnDef = this.dataSource.tableColumnDefs.find((column) => column.sorted === true);
    // Found?
    if (columnDef) {
      // Yes: Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    // Set Sort
    this.dataSource.setSort(this.sort);
    // Set the Search input
    this.dataSource.setSearchInput(this.searchInput);
    // Clear the selection
    this.dataSource.selectionModel.clear();
  }

  ngOnDestroy() {
    console.log('table.component - ngOnDestroy');
    // Unregister
    this.dataSource.reset();
    if (this.manualRefreshObserver) {
      this.manualRefreshObserver.unsubscribe();
    }
    if (this.autoRefreshObserver) {
      this.autoRefreshObserver.unsubscribe();
    }
    if (this.rowRefreshObserver) {
      this.rowRefreshObserver.unsubscribe();
    }
    if (this.displayDetailObserver) {
      this.displayDetailObserver.unsubscribe();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    console.log('table.component - isAllSelected');
    return (this.dataSource.selectionModel.selected.length === this.dataSource.data.length);
  }

  public filterChanged(filterDef: TableFilterDef, event) {
    console.log('table.component - filterChanged');
    // Reset paginator
    this.paginator.pageIndex = 0;
    // Get Actions def
    this.dataSource.filterChanged(filterDef);
  }

  public dateFilterChanged(filterDef: TableFilterDef, event: MatDatetimepickerInputEvent<any>) {
    console.log('table.component - dateFilterChanged');
    // Date?
    if (filterDef.type === 'date') {
      // Date is one way binding: update the value manually
      if (event.value) {
        filterDef.currentValue = event.value;
      }
    }
    this.filterChanged(filterDef, event);
  }

  toggleSelectionRow(row) {
    // Select
    this.dataSource.selectionModel.toggle(row);
    // Toggle
    row.selected = !row.selected;
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    console.log('table.component - resetDialogTableFilter');
    // Reset paginator if field is not empty
    if (filterDef.currentValue !== null) {
      this.paginator.pageIndex = 0;
    }
    filterDef.currentValue = null;
    this.dataSource.filterChanged(filterDef)
  }

  public showDialogTableFilter(filterDef: TableFilterDef) {
    console.log('table.component - showDialogTableFilter');
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    // Set Validate button title to 'Set Filter'
    dialogConfig.data = {
      validateButtonTitle : 'general.set_filter'
    };
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
    // Add sites
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        filterDef.currentValue = data;
        // Reset paginator
        this.paginator.pageIndex = 0;
        this.dataSource.filterChanged(filterDef)
      }
    });
  }

  public actionTriggered(actionDef: TableActionDef, event?) {
    console.log('table.component - actionTriggered');
    // Slide?
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Reset Filters ?
    if (actionDef.id === 'reset_filters') {
      // Reset paginator
      this.paginator.pageIndex = 0;
      // Reset all filter fields
      this.dataSource.getTableFiltersDef().forEach((filterDef: TableFilterDef) => {
        switch (filterDef.type) {
          case 'dropdown':
            filterDef.currentValue = null;
            break;
          case 'dialog-table':
            filterDef.currentValue = null;
            break;
          case 'date':
            filterDef.reset();
            break;
        }
      });
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    console.log('table.component - rowActionTriggered');
    // Get Actions def
    this.dataSource.rowActionTriggered(actionDef, rowItem, dropdownItem);
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  public masterSelectToggle() {
    console.log('table.component - masterSelectToggle');
    this.isAllSelected() ?
      this.dataSource.selectionModel.clear() :
      this.dataSource.getFormattedData().forEach(row => {
        if (this.dataSource.isSelectable(row['data'])) {
          this.dataSource.selectionModel.select(row);
        }
      });
  }

  public handleSortChanged() {
    console.log('table.component - handleSortChanged');
    // Reset paginator
    this.paginator.pageIndex = 0;
    // Clear Selection
    this.dataSource.selectionModel.clear();
    // Load data
    this.loadData();
  }

  public trackByObjectId(index: number, item: any): any {
    console.log('table.component - trackByObjectId');
    return item ? item.id : null;
  }

  public handlePageChanged() {
    console.log('table.component - handlePageChanged');
    // Clear Selection
    this.dataSource.selectionModel.clear();
    // Load data
    this.loadData();
  }

  public loadData() {
    console.log('table.component - loadData');
    // Load data source
    this.dataSource.loadData(false);
  }

  public showHideDetailsClicked(row) {
    console.log('table.component - showHideDetailsClicked');
    // Already Expanded
    if (!row.isExpanded) {
      // Already loaded?
      if (this.dataSource.tableDef.rowDetails.enabled && !row[this.dataSource.tableDef.rowDetails.detailsField]) {
        if (!this.dataSource.tableDef.rowDetails.isDetailComponent) {
          // No: Load details from data source
          this.dataSource.getRowDetails(row).subscribe((details) => {
            // Set details
            row[this.dataSource.tableDef.rowDetails.detailsField] = details;
            // No: Expand it!
            row.isExpanded = true;
          });
        } else {
          // find the container related to the row
          this.detailComponentContainers.forEach((detailComponentContainer: DetailComponentContainer) => {
            if (detailComponentContainer.parentRow === row) {
              detailComponentContainer.loadComponent();
            }
          });
          row.isExpanded = true;
        }
      } else {
        // No: Expand it!
        row.isExpanded = true;
      }
    } else {
      // Fold it
      row.isExpanded = false;
    }
  }

  /**
   * setReferenceRow
   * @row
   * @rowDetails
   */
  public setReferenceRow(row, rowDetails) {
    console.log('table.component - setReferenceRow');
    rowDetails.parentRow = row;
    return true;
  }

  public onRowActionMenuOpen(action: TableActionDef, row) {
    console.log('table.component - onRowActionMenuOpen');
    this.dataSource.onRowActionMenuOpen(action, row);
  }

  canDisplayRowAction(rowAction: TableActionDef, rowItem: any) {
    console.log('table.component - canDisplayRowAction');
    return this.dataSource.canDisplayRowAction(rowAction, rowItem);
  }

  isPaginatorUseless() {
    console.log('table.component - isPaginatorUseless');
    return Array.isArray(this.pageSizes) && this.dataSource.getNumberOfRecords() < this.pageSizes[0];
  }

  private _rowRefresh(compositeValue) {
    console.log('table.component - _rowRefresh');
    if (compositeValue) {
      const data = compositeValue.newValue['data'];
      // Refresh details component
      if (data.isExpanded) {
        if (data[this.dataSource.tableDef.rowDetails.detailsField]) {
          // Simple fields
          this.dataSource.getRowDetails(data).subscribe((details) => {
            // Set details
            data[this.dataSource.tableDef.rowDetails.detailsField] = details;
          });
        } else {
          this.detailComponentContainers.forEach((detailComponentContainer: DetailComponentContainer) => {
            // tslint:disable-next-line:max-line-length
            const identifierFieldname = (this.dataSource.tableDef.rowFieldNameIdentifier ? this.dataSource.tableDef.rowFieldNameIdentifier : 'id');
            if (detailComponentContainer.parentRow[identifierFieldname] === data[identifierFieldname]) {
              detailComponentContainer.parentRow = data;
              detailComponentContainer.refresh(data, compositeValue.isAutoRefresh);
            }
          });
        }
      }
    }
  }
}
