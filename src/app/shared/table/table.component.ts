import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { WindowService } from 'app/services/window.service';
import { Constants } from 'app/utils/Constants';
import * as _ from 'lodash';
import { fromEvent, interval, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeWhile } from 'rxjs/operators';
import { DropdownItem, TableActionDef, TableColumnDef, TableFilterDef } from '../../common.types';
import { ConfigService } from '../../services/config.service';
import { LocaleService } from '../../services/locale.service';
import { TableDataSource } from './table-data-source';


@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html'
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataSource: TableDataSource<any>;
  @ViewChild('searchInput', {static: false}) searchInput: ElementRef;
  public searchPlaceholder = '';
  public ongoingAutoRefresh = false;
  public sort: MatSort = new MatSort();
  public maxRecords = Constants.INFINITE_RECORDS;
  public numberOfColumns = 0;
  private ongoingRefresh = false;

  private autoRefreshSubscription: Subscription;
  private autoRefreshPollEnabled;
  private autoRefreshPollingIntervalMillis = Constants.DEFAULT_POLLING_MILLIS;
  private alive: boolean;

  constructor(
    private configService: ConfigService,
    private translateService: TranslateService,
    public spinnerService: SpinnerService,
    protected localService: LocaleService,
    public windowService: WindowService,
    private dialog: MatDialog) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
  }

  ngOnInit() {
    // Handle Poll (config service available only in component not possible in data-source)
    this.autoRefreshPollEnabled = this.configService.getCentralSystemServer().pollEnabled;
    this.autoRefreshPollingIntervalMillis = this.configService.getCentralSystemServer().pollIntervalSecs * 1000;
    // Init Sort
    const columnDef = this.dataSource.tableColumnDefs.find((column) => column.sorted === true);
    if (columnDef) {
      // Yes: Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    this.dataSource.setSort(this.sort);
    // Compute number of columns
    this.numberOfColumns = this.dataSource.tableColumnDefs.length +
      (this.dataSource.tableDef.rowDetails && this.dataSource.tableDef.rowDetails.enabled ? 1 : 0) +
      (this.dataSource.tableDef.rowSelection && this.dataSource.tableDef.rowSelection.enabled ? 1 : 0) +
      (this.dataSource.hasRowActions ? 1 : 0);
  }

  ngAfterViewInit() {
    this.alive = true;
    // Init Search
    if (this.dataSource.tableDef.search && this.dataSource.tableDef.search.enabled) {
      // Init initial value
      this.searchInput.nativeElement.value = this.dataSource.getSearchValue();
      // Observe the Search field
      fromEvent(this.searchInput.nativeElement, 'input').pipe(
        takeWhile(() => this.alive),
        map((e: KeyboardEvent) => e.target['value']),
        debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
        distinctUntilChanged()
      ).subscribe((text: string) => {
        this.dataSource.setSearchValue(text);
        this.refresh();
      });
    }
    if (this.dataSource.tableActionsRightDef) {
      // Init Auto-Refresh
      for (const tableActionRightDef of this.dataSource.tableActionsRightDef) {
        if (tableActionRightDef.id === 'auto-refresh') {
          // Active by default?
          if (tableActionRightDef.currentValue) {
            this.createAutoRefreshTimer();
          }
          break;
        }
      }
    }
    // Initial Load
    this.loadData();
  }

  ngOnDestroy() {
    this.alive = false;
    this.destroyAutoRefreshTimer();
    this.dataSource.destroyDatasource();
  }

  displayMoreRecords() {
    // Set new paging
    this.dataSource.setPaging({
      skip: this.dataSource.data.length,
      limit: this.dataSource.getPageSize()
    });
    // Load data
    this.loadData();
  }

  public filterChanged(filterDef: TableFilterDef) {
    this.dataSource.filterChanged(filterDef);
    // this.updateUrlWithFilters(filterDef);
    if(filterDef.multiple) {
      this.updateFilterLabel(filterDef);
    }
    this.refresh();
  }

  public updateFilterLabel(filter: TableFilterDef) {
    if(Array.isArray(filter.currentValue)) {
      if(filter.currentValue.length > 0) {
        filter.label  = this.translateService.instant(filter.currentValue[0].value) + (filter.currentValue.length > 1 ? ` (+${filter.currentValue.length - 1})`:'');
      } else {
        filter.label = '';
      }
    }
  }

  public updateUrlWithFilters(filter: TableFilterDef) {
    // Update URL with filter value
    if (filter.httpId && filter.httpId !== 'null') {
      // Capitalize first letter of search id
      const filterIdInCap = filter.httpId;
      if (filter.currentValue === 'null' || !filter.currentValue) {
        this.windowService.deleteSearch(filterIdInCap);
      } else {
        switch (filter.type) {
          case Constants.FILTER_TYPE_DIALOG_TABLE: {
            this.windowService.setSearch(filterIdInCap, filter.currentValue[0].key);
            break;
          }
          case Constants.FILTER_TYPE_DROPDOWN: {
            this.windowService.setSearch(filterIdInCap, filter.currentValue);
            break;
          }
          case 'date': {
            this.windowService.setSearch(filterIdInCap, JSON.stringify(filter.currentValue));
            break;
          }
          default: {
            break;
          }
        }
      }
    }
  }

  public sortChanged(tableColumnDef: TableColumnDef) {
    if (tableColumnDef.sortable) {
      if (this.sort.active === tableColumnDef.id) {
        // Reverse Sort
        this.sort.direction = (this.sort.direction === 'asc' ? 'desc' : 'asc');
      } else {
        // Initial Sort
        this.sort.active = tableColumnDef.id;
        this.sort.direction = (tableColumnDef.direction ? tableColumnDef.direction : 'asc');
      }
      this.refresh();
    }
  }

  public dateFilterChanged(filterDef: TableFilterDef, event: MatDatetimepickerInputEvent<any>) {
    // Date?
    if (filterDef.type === 'date') {
      filterDef.currentValue = event.value.toDate();
    }
    // Update filter
    this.filterChanged(filterDef);
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    if ((filterDef.type === Constants.FILTER_TYPE_DIALOG_TABLE || filterDef.type === Constants.FILTER_TYPE_DROPDOWN) && filterDef.multiple) {
      filterDef.currentValue = [];
    } else {
      filterDef.currentValue = null;
    }
    this.filterChanged(filterDef);
  }

  public showDialogTableFilter(filterDef: TableFilterDef) {
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    // Init button title
    dialogConfig.data = {
      validateButtonTitle: 'general.set_filter'
    };
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
    // Add sites
    dialogRef.afterClosed().pipe(takeWhile(() => this.alive)).subscribe(data => {
      if (data) {
        filterDef.currentValue = data;
        this.filterChanged(filterDef);
      }
    });
  }

  createAutoRefreshTimer() {
    // Create timer only if socketIO is not active
    if (this.autoRefreshPollEnabled && !this.autoRefreshSubscription) {
      // Create timer
      this.autoRefreshSubscription = interval(this.autoRefreshPollingIntervalMillis).pipe(
        takeWhile(() => this.alive)
      ).subscribe(() => {
        if (!this.ongoingRefresh) {
          this.refresh(true);
        }
      });
    }
  }

  destroyAutoRefreshTimer() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
    this.autoRefreshSubscription = null;
  }

  public toggleAutoRefresh({checked}) {
    if (checked) {
      this.createAutoRefreshTimer();
    } else {
      this.destroyAutoRefreshTimer();
    }
  }

  public refresh(autoRefresh = false) {
    if (!this.ongoingRefresh) {
      this.ongoingRefresh = true;
      if (autoRefresh) {
        this.ongoingAutoRefresh = true;
      }
      // Refresh Data
      this.dataSource.refreshData(!this.ongoingAutoRefresh).subscribe(() => {
      this.ongoingRefresh = false;
      if (autoRefresh) {
        this.ongoingAutoRefresh = false;
      }
      });
    }
  }

  public resetFilters() {
    this.dataSource.setSearchValue('');
    this.dataSource.resetFilters();
    this.searchInput.nativeElement.value = '';
    this.refresh();
  }

  public actionTriggered(actionDef: TableActionDef, event?) {
    // Slide
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    this.dataSource.rowActionTriggered(actionDef, rowItem, dropdownItem);
  }

  public toggleRowSelection(row) {
    this.dataSource.toggleRowSelection(row);
  }

  public toggleMasterSelect() {
    this.dataSource.toggleMasterSelect();
  }

  public onRowActionMenuOpen(action: TableActionDef, row) {
    this.dataSource.onRowActionMenuOpen(action, row);
  }

  public trackByObjectId(index: number, item: any): any {
    return item.id;
  }

  public loadData() {
    this.dataSource.loadData().subscribe();
  }

  public showHideDetailsClicked(row) {
    // Already Expanded
    if (!row.isExpanded) {
      // Already Loaded
      if (this.dataSource.tableDef.rowDetails.enabled && !row[this.dataSource.tableDef.rowDetails.detailsField]) {
        // Component
        if (!this.dataSource.tableDef.rowDetails.angularComponent) {
          // No: Load details from data source
          this.dataSource.getRowDetails(row).pipe(takeWhile(() => this.alive)).subscribe((details) => {
            // Set details
            row[this.dataSource.tableDef.rowDetails.detailsField] = details;
            // No: Expand it!
            row.isExpanded = true;
          });
        } else {
          // Yes: Find the container related to the row
          row.isExpanded = true;
        }
      } else {
        // Yes: Expand it!
        row.isExpanded = true;
      }
    } else {
      // Fold it
      row.isExpanded = false;
    }
  }
}
