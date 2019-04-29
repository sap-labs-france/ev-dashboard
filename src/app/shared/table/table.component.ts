import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {MatDialog, MatSort, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {map, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {DropdownItem, TableActionDef, TableFilterDef, TableColumnDef} from '../../common.types';
import {ConfigService} from '../../services/config.service';
import {TableDataSource} from './table-data-source';
import {LocaleService} from '../../services/locale.service';
import {MatDatetimepickerInputEvent} from '@mat-datetimepicker/core';
import {SpinnerService} from 'app/services/spinner.service';
import {Observable, fromEvent} from 'rxjs';
import { Constants } from 'app/utils/Constants';
import * as _ from 'lodash';

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html'
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataSource: TableDataSource<any>;
  @ViewChild('searchInput') searchInput: ElementRef;
  public searchPlaceholder = '';
  public searchObservable: Observable<string>;
  public autoRefeshTimer;
  public ongoingRefresh = false;
  public sort: MatSort = new MatSort();
  public maxRecords = Constants.MAX_RECORDS;
  public numberOfColumns = 0;
  public pollingInterval = Constants.DEFAULT_POLLING_MILLIS;


  constructor(
    private configService: ConfigService,
    private translateService: TranslateService,
    protected localService: LocaleService,
    public spinnerService: SpinnerService,
    private dialog: MatDialog) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
    console.log('table.component - constructor');
  }

  ngOnInit() {
    // setInterval(() => {
    //   if (this.dataSource && this.dataSource.data && this.dataSource.data.length >= 5) {
    //     // Change
    //     const index = Math.trunc(Math.random() * 5);
    //     const newData = Array.from(this.dataSource.data);
    //     newData[index].id += 'M';
    //     // newData[index].chargeBoxID = 'FUCK';
    //     newData[index].connectors[1].currentConsumption = Math.trunc(Math.random() * 44000);
    //     // newData[index].connectors[1].currentConsumption = (newData[index].connectors[1].currentConsumption > 0 ? 0 : 50000);
    //     newData[index].connectors[1].status = (newData[index].connectors[1].status === 'Charging' ? 'Available' : 'Charging');
    //     // newData[index].id = 'Charging';
    //     // newData[index].id = 'E';
    //     // console.log(newData);
    //     console.log(`${newData[index].id} - ${newData[index].connectors[1].status} - ${newData[index].connectors[1].currentConsumption}`);
    //     this.dataSource.data.length = 0;
    //     this.dataSource.data.push(...newData);
    //   }
    // }, 2000);
    console.log('table.component - ngOnInit');

    // Handle Poll (config service available only in component not possible in data-source)
    if (this.configService.getCentralSystemServer().pollEnabled &&
        this.configService.getCentralSystemServer().pollIntervalSecs) {
      // Set
      this.pollingInterval = this.configService.getCentralSystemServer().pollIntervalSecs * 1000;
    }
    // Init Sort
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
    // Compute number of columns
    this.numberOfColumns = this.dataSource.tableColumnDefs.length +
      (this.dataSource.tableDef.rowDetails && this.dataSource.tableDef.rowDetails.enabled ? 1 : 0) +
      (this.dataSource.tableDef.rowSelection && this.dataSource.tableDef.rowSelection.enabled ? 1 : 0) +
      (this.dataSource.hasRowActions ? 1 : 0);
  }

  ngAfterViewInit() {
    console.log('table.component - ngAfterViewInit');
    // Search?
    if (this.dataSource.tableDef.search && this.dataSource.tableDef.search.enabled) {
      // Observe the Search field
      fromEvent(this.searchInput.nativeElement, 'input').pipe(
        map((e: KeyboardEvent) => e.target['value']),
        // Fucked up in dev env, takes a lot of time to process!!!!!
        debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
        distinctUntilChanged()
      ).subscribe((text: string) => {
          // Set
          this.dataSource.setSearchValue(text);
          // Load data
          this.loadData();
      });
    }
    // Check Auto-Refresh
    for (const tableActionRightDef of this.dataSource.tableActionsRightDef) {
      if (tableActionRightDef.id === 'auto-refresh') {
        // Active by default?
        if (tableActionRightDef.currentValue) {
          // Create
          this.createAutoRefreshTimer();
        }
        break;
      }
    }
    // Load the data
    this.loadData();
  }

  ngOnDestroy() {
    console.log('table.component - ngOnDestroy');
    // Destroy
    this.destroyAutoRefreshTimer();
  }

  displayMoreRecords() {
    // Get current paging
    const currentPaging = this.dataSource.getPaging();
    // Set new paging
    this.dataSource.setPaging({
      skip: currentPaging.skip + this.dataSource.getPageSize(),
      limit: currentPaging.limit
    });
    // Load data
    this.loadData();
  }

  requestNumberOfRecords() {
    console.log('table.component - requestNumberOfRecords');
    // Add only record count
    const staticFilters = [
      ...this.dataSource.getStaticFilters(),
      { 'OnlyRecordCount': true}
    ];
    // Set
    this.dataSource.setStaticFilters(staticFilters);
    // Load data
    this.dataSource.loadData().subscribe();
    // Remove OnlyRecordCount
    staticFilters.splice(staticFilters.length - 1, 1)
    // Reset static filter
    this.dataSource.setStaticFilters(staticFilters);
  }

  public filterChanged(filterDef: TableFilterDef) {
    console.log('table.component - filterChanged');
    // Get Actions def
    this.dataSource.filterChanged(filterDef);
    // Reload data
    this.loadData();
  }

  public sortChanged(tableColumnDef: TableColumnDef) {
    console.log('table.component - handleSortChanged');
    // Check
    if (tableColumnDef.sortable) {
      // Check
      if (this.sort.active === tableColumnDef.id) {
        // Reverse
        this.sort.direction = (this.sort.direction === 'asc' ? 'desc' : 'asc');
      } else {
        // New Sort
        this.sort.active = tableColumnDef.id;
        this.sort.direction = (tableColumnDef.direction ? tableColumnDef.direction : 'asc');
      }
      // Load data
      this.loadData();
    }
  }

  public dateFilterChanged(filterDef: TableFilterDef, event: MatDatetimepickerInputEvent<any>) {
    console.log('table.component - dateFilterChanged');
    // Date?
    if (filterDef.type === 'date') {
      // Date is one way binding: update the value manually
      filterDef.currentValue = event.value;
    }
    // Update filter
    this.filterChanged(filterDef);
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    console.log('table.component - resetDialogTableFilter');
    filterDef.currentValue = null;
    this.filterChanged(filterDef)
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
        this.filterChanged(filterDef);
      }
    });
  }

  createAutoRefreshTimer() {
    console.log('table.component - createAutoRefreshTimer');
    // Clean up
    if (!this.autoRefeshTimer) {
      // Create timer
      this.autoRefeshTimer = setInterval(() => {
        // Reload
        this.refresh(true);
      }, this.pollingInterval);
    }
  }

  destroyAutoRefreshTimer() {
    console.log('table.component - destroyAutoRefreshTimer');
    // Clean up
    if (this.autoRefeshTimer) {
      clearInterval(this.autoRefeshTimer);
    }
  }

  public toggleAutoRefresh({checked}) {
    console.log('table.component - toggleAutoRefresh');
    if (checked) {
      // Create
      this.createAutoRefreshTimer();
    } else {
      // Destroy
      this.destroyAutoRefreshTimer();
    }
  }

  public refresh(autoRefresh = false) {
    console.log('table.component - refresh');
    // Clear selection
    this.dataSource.clearSelectedRows();
    // Init paging
    const currentPaging = this.dataSource.getPaging();
    // Set new paging
    this.dataSource.setPaging({
      skip: 0,
      limit: currentPaging.limit + currentPaging.skip
    });
    // Enable animation in button
    if (autoRefresh) {
      this.ongoingRefresh = true;
    }
    // Load Data
    this.dataSource.refreshOrLoadData().subscribe(() => {
      // Enable animation in button
      if (autoRefresh) {
        this.ongoingRefresh = false;
      }
      // Reset Current Paging
      this.dataSource.setPaging(currentPaging);
    });
  }

  public resetFilters() {
    console.log('table.component - resetFilters');
    this.dataSource.setSearchValue('');
    this.dataSource.resetFilters();
    this.searchInput.nativeElement.value = '';
    this.loadData();
  }

  public actionTriggered(actionDef: TableActionDef, event?) {
    console.log('table.component - actionTriggered');
    // Slide?
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    console.log('table.component - rowActionTriggered');
    // Get Actions def
    this.dataSource.rowActionTriggered(actionDef, rowItem, dropdownItem);
  }

  public toggleRowSelection(row) {
    console.log('table.component - toggleRowSelection');
    this.dataSource.toggleRowSelection(row);
  }

  public toggleMasterSelect() {
    console.log('table.component - toggleMasterSelect');
    this.dataSource.toggleMasterSelect();
  }

  public onRowActionMenuOpen(action: TableActionDef, row) {
    this.dataSource.onRowActionMenuOpen(action, row);
  }

  public trackByObjectId(index: number, item: any): any {
    return item.id;
  }

  public loadData() {
    console.log('table.component - loadData');
    // Show Spinner
    this.spinnerService.show();
    // Load data source
    this.dataSource.refreshOrLoadData().subscribe((data) => {
      // Hide Spinner
      this.spinnerService.hide();
      if (this.dataSource.totalNumberOfRecords === Constants.MAX_RECORDS) {
        // Request nbr of records
        setTimeout(() => {
          this.requestNumberOfRecords()
        }, 100);
      }
    }, (error) => {
      // Hide Spinner
      this.spinnerService.hide();
    });
  }

  public showHideDetailsClicked(row) {
    console.log('table.component - showHideDetailsClicked');
    // Already Expanded
    if (!row.isExpanded) {
      // Already loaded?
      if (this.dataSource.tableDef.rowDetails.enabled && !row[this.dataSource.tableDef.rowDetails.detailsField]) {
        // Component?
        if (!this.dataSource.tableDef.rowDetails.isDetailComponent) {
          // No: Load details from data source
          this.dataSource.getRowDetails(row).subscribe((details) => {
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
