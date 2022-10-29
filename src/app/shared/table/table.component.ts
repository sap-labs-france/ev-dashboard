import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { Dayjs } from 'dayjs';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeWhile } from 'rxjs/operators';

import { ConfigService } from '../../services/config.service';
import { LocaleService } from '../../services/locale.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { ButtonAction } from '../../types/GlobalType';
import { ActionType, DateTimeRange, DropdownItem, FilterType, TableActionDef, TableColumnDef, TableData, TableEditType, TableFilterDef } from '../../types/Table';
import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';
import { TableDataSource } from './table-data-source';

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public dataSource!: TableDataSource<TableData>;
  @ViewChild('searchInput') public searchInput!: ElementRef;

  public searchPlaceholder = '';
  public sort: MatSort = new MatSort();
  public maxRecords = Constants.INFINITE_RECORDS;
  public numberOfColumns = 0;
  public loading = false;
  public isMobile = false;
  public filterAreaVisible = true;

  public readonly FilterType = FilterType;
  public readonly TableEditType = TableEditType;
  public readonly ButtonAction = ButtonAction;
  public readonly ActionType = ActionType;

  private alive!: boolean;

  public constructor(
    private configService: ConfigService,
    private translateService: TranslateService,
    public spinnerService: SpinnerService,
    protected localService: LocaleService,
    public windowService: WindowService,
    private dialog: MatDialog) {
    this.searchPlaceholder = this.translateService.instant('general.search');
    this.isMobile = Utils.isMobile();
    this.windowService.getFilterAreaVisibleSubject().subscribe((filterAreaVisible) => {
      this.filterAreaVisible = filterAreaVisible;
    });
  }

  public ngOnInit() {
    if (this.dataSource) {
      // Init Sort
      if (this.dataSource.tableColumnsDef) {
        const columnDef = this.dataSource.tableColumnsDef.find((column) => column.sorted === true);
        if (columnDef) {
          // Yes: Set Sorting
          this.sort.active = columnDef.id;
          this.sort.direction = columnDef.direction ? columnDef.direction : '';
        }
        this.dataSource.setSort(this.sort);
        // Compute number of columns
        this.numberOfColumns = this.dataSource.tableColumnsDef.length +
          (this.dataSource.tableDef.rowDetails && this.dataSource.tableDef.rowDetails.enabled ? 1 : 0) +
          (this.dataSource.tableDef.rowSelection && this.dataSource.tableDef.rowSelection.enabled ? 1 : 0) +
          (this.dataSource.hasRowActions ? 1 : 0);
      }
    }
  }

  public ngAfterViewInit() {
    // Avoid ERROR Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    setTimeout(() => {
      this.alive = true;
      // Init Search
      if (this.dataSource.tableDef && this.dataSource.tableDef.search && this.dataSource.tableDef.search.enabled) {
        // Init initial value
        this.searchInput.nativeElement.value = this.dataSource.getSearchValue();
        // Observe the Search field
        fromEvent(this.searchInput.nativeElement, 'input').pipe(
          takeWhile(() => this.alive),
          map((e: KeyboardEvent) => e.target['value']),
          debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
          distinctUntilChanged(),
        ).subscribe((text: string) => {
          this.dataSource.setSearchValue(text);
          this.refresh();
        });
      }
      // Initial Load
      this.loadData();
    }, 0);
  }

  public ngOnDestroy() {
    this.alive = false;
  }

  public displayMoreRecords() {
    // Set new paging
    this.dataSource.setPaging({
      skip: this.dataSource.data.length,
      limit: this.dataSource.getPageSize(),
    });
    // Load data
    this.loadData();
  }

  public rowCellUpdated(cellValue: any, rowIndex: number, columnDef: TableColumnDef) {
    if (this.dataSource.tableDef && this.dataSource.tableDef.isEditable) {
      this.dataSource.rowCellUpdated(cellValue, rowIndex, columnDef);
    }
  }

  public filterChanged(filterDef: TableFilterDef) {
    this.dataSource.filterChanged(filterDef);
    this.refresh();
  }

  public updateUrlWithFilters(filter: TableFilterDef) {
    // Update URL with filter value
    if (filter.httpID && filter.httpID !== 'null') {
      // Capitalize first letter of search id
      const filterIdInCap = filter.httpID;
      if (filter.currentValue === 'null' || !filter.currentValue) {
        this.windowService.deleteUrlParameter(filterIdInCap);
      } else {
        switch (filter.type) {
          case FilterType.DIALOG_TABLE: {
            this.windowService.setUrlParameter(filterIdInCap, filter.currentValue[0].key);
            break;
          }
          case FilterType.DROPDOWN: {
            this.windowService.setUrlParameter(filterIdInCap, filter.currentValue);
            break;
          }
          case FilterType.DATE: {
            this.windowService.setUrlParameter(filterIdInCap, JSON.stringify(filter.currentValue));
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

  public dateTimeChanged(filterDef: TableFilterDef, date: Date) {
    filterDef.currentValue = date;
    this.filterChanged(filterDef);
  }

  public dateTimeRangeChanged(filterDef: TableFilterDef, dateRange: DateTimeRange) {
    const currentValue = filterDef.currentValue;
    if (currentValue?.startDate !== dateRange.startDate ||
        currentValue?.endDate !== dateRange.endDate) {
      filterDef.currentValue.startDate = dateRange.startDate;
      filterDef.currentValue.endDate = dateRange.endDate;
      this.filterChanged(filterDef);
    }
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    let filterIsChanged = false;
    if ((filterDef.type === FilterType.DIALOG_TABLE ||
      filterDef.type === FilterType.DROPDOWN) && filterDef.multiple) {
      if (!Utils.isEmptyArray(filterDef.currentValue)) {
        filterDef.currentValue = [];
        filterIsChanged = true;
      }
      filterDef.cleared = true;
    } else {
      if (filterDef.currentValue) {
        filterDef.currentValue = null;
        filterIsChanged = true;
      }
    }
    if (filterIsChanged) {
      this.filterChanged(filterDef);
    }
  }

  public showDialogTableFilter(filterDef: TableFilterDef) {
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {};
    Utils.buildDependentFilters(filterDef);
    if (filterDef.dialogComponentData) {
      Object.assign(dialogConfig.data, filterDef.dialogComponentData);
    }
    if (filterDef.cleared) {
      dialogConfig.data.cleared = true;
      filterDef.cleared = false;
    }
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
    // Add sites
    dialogRef.afterClosed().pipe(takeWhile(() => this.alive)).subscribe((data) => {
      if (data) {
        filterDef.currentValue = data;
        this.filterChanged(filterDef);
      }
    });
  }

  public refresh(showSpinner = true) {
    // Start refresh
    if (!this.loading) {
      this.loading = true;
      // Refresh Data
      this.dataSource.refreshData(showSpinner).subscribe({
        next: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
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

  public resetSearchFilter(){
    this.searchInput.nativeElement.value = '';
    this.dataSource.setSearchValue('');
    this.refresh();
  }

  public actionTriggered(actionDef: TableActionDef, event?: MouseEvent | MatSlideToggleChange) {
    // Slide
    if (event && event instanceof MatSlideToggleChange && actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: any, dropdownItem?: DropdownItem) {
    this.dataSource.rowActionTriggered(actionDef, rowItem, dropdownItem);
  }

  public toggleRowSelection(row: TableData, event: MatCheckboxChange) {
    this.dataSource.toggleRowSelection(row, event.checked);
  }

  public toggleMasterSelect() {
    this.dataSource.toggleMasterSelect();
  }

  public onRowActionMenuOpen(action: TableActionDef, row: any) {
    this.dataSource.onRowActionMenuOpen(action, row);
  }

  public trackByObjectId(index: number, item: TableData): string {
    return item.id as string;
  }

  public trackByObjectIndex(index: number, item: TableData): string {
    return index.toString();
  }

  public loadData() {
    // Start initial loading
    this.loading = true;
    this.dataSource.loadData().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  public showHideDetailsClicked(row: any) {
    // Already Expanded
    if (!row.isExpanded) {
      // Already Loaded
      if (this.dataSource && this.dataSource.tableDef && this.dataSource.tableDef.rowDetails
        && this.dataSource.tableDef.rowDetails.enabled
        && this.dataSource.tableDef.rowDetails.detailsField
        && !row[this.dataSource.tableDef.rowDetails.detailsField]) {
        // No: Load details from data source
        this.dataSource.getRowDetails(row).pipe(takeWhile(() => this.alive)).subscribe((details) => {
          // Set details
          row[this.dataSource.tableDef.rowDetails.detailsField] = details;
          // No: Expand it!
          row.isExpanded = true;
        });
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
