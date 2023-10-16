import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { TranslateService } from '@ngx-translate/core';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeWhile } from 'rxjs/operators';

import { ConfigService } from '../../services/config.service';
import { LocaleService } from '../../services/locale.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { ButtonAction } from '../../types/GlobalType';
import {
  DropdownItem,
  FilterType,
  TableActionDef,
  TableColumnDef,
  TableData,
  TableEditType,
  TableFilterDef,
} from '../../types/Table';
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
  @ViewChildren('ngxDatePickerElement') public datePickerElements!: QueryList<MatFormField>;
  @ViewChildren(DaterangepickerDirective) public datePickers: QueryList<DaterangepickerDirective>;
  public searchPlaceholder = '';
  public ongoingAutoRefresh = false;
  public sort: MatSort = new MatSort();
  public maxRecords = Constants.INFINITE_RECORDS;
  public numberOfColumns = 0;
  public loading = false;

  public readonly FilterType = FilterType;
  public readonly TableEditType = TableEditType;
  public readonly ButtonAction = ButtonAction;

  private ongoingRefresh = false;

  private autoRefreshTimeout;
  private refreshIntervalSecs: number;
  private alive!: boolean;
  private tableActionAutoRefresh: TableActionDef;

  public constructor(
    private configService: ConfigService,
    private translateService: TranslateService,
    public spinnerService: SpinnerService,
    protected localService: LocaleService,
    public windowService: WindowService,
    private dialog: MatDialog
  ) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
    this.refreshIntervalSecs = this.configService.getCentralSystemServer().pollIntervalSecs;
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
        this.numberOfColumns =
          this.dataSource.tableColumnsDef.length +
          (this.dataSource.tableDef.rowDetails && this.dataSource.tableDef.rowDetails.enabled
            ? 1
            : 0) +
          (this.dataSource.tableDef.rowSelection && this.dataSource.tableDef.rowSelection.enabled
            ? 1
            : 0) +
          (this.dataSource.hasRowActions ? 1 : 0);
      }
    }
  }

  public ngAfterViewInit() {
    // HACK: Avoid ERROR Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    setTimeout(() => {
      this.alive = true;
      // Init Search
      if (
        this.dataSource.tableDef &&
        this.dataSource.tableDef.search &&
        this.dataSource.tableDef.search.enabled
      ) {
        // Init initial value
        this.searchInput.nativeElement.value = this.dataSource.getSearchValue();
        // Observe the Search field
        fromEvent(this.searchInput.nativeElement, 'input')
          .pipe(
            takeWhile(() => this.alive),
            map((e: KeyboardEvent) => e.target['value']),
            debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
            distinctUntilChanged()
          )
          .subscribe((text: string) => {
            this.dataSource.setSearchValue(text);
            this.refresh();
          });
      }
      // Search for Auto-Refresh
      for (const tableActionRightDef of this.dataSource.tableActionsRightDef) {
        if (tableActionRightDef.id === ButtonAction.AUTO_REFRESH) {
          // Keep it
          this.tableActionAutoRefresh = tableActionRightDef;
          break;
        }
      }
      // Initial Load
      this.loadData();
    }, 0);
  }

  public ngOnDestroy() {
    this.alive = false;
    this.destroyAutoRefresh();
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
    // this.updateUrlWithFilters(filterDef);
    this.refresh();
  }

  public dateRangeChanged(filterDef: TableFilterDef, event: any) {
    filterDef.dateRangeTableFilterDef.updateRanges();
    const currentValue = filterDef.currentValue;
    if (currentValue?.startDate !== event.startDate || currentValue?.endDate !== event.endDate) {
      filterDef.currentValue = {
        startDate: event?.startDate.toDate(),
        endDate: event?.endDate.toDate(),
      };
      for (const picker of this.datePickers) {
        picker.picker.updateCalendars();
        picker.hide();
      }
      this.filterChanged(filterDef);
    }
  }

  public dateRangeChangedDirectly(parent: MatFormField, filterDef: TableFilterDef) {
    let startDate;
    let endDate;
    const parentHTMLElement = parent.getConnectedOverlayOrigin().nativeElement as HTMLElement;
    for (const picker of this.datePickers) {
      if (parentHTMLElement.contains(picker.picker.pickerContainer.nativeElement as HTMLElement)) {
        startDate = picker.picker.startDate;
        endDate = picker.picker.endDate;
      }
    }
    this.dateRangeChanged(filterDef, {
      startDate,
      endDate,
    });
  }

  public openDateTimeRangePicker(parent: MatFormField, filterDef: TableFilterDef) {
    filterDef.dateRangeTableFilterDef.updateRanges();
    const parentHTMLElement = parent.getConnectedOverlayOrigin().nativeElement as HTMLElement;
    for (const picker of this.datePickers) {
      // Close any other open pickers
      if (parentHTMLElement.contains(picker.picker.pickerContainer.nativeElement as HTMLElement)) {
        picker.open();
      } else {
        picker.hide();
      }
    }
  }

  public updateUrlWithFilters(filter: TableFilterDef) {
    // Update URL with filter value
    if (filter.httpId && filter.httpId !== 'null') {
      // Capitalize first letter of search id
      const filterIdInCap = filter.httpId;
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
        this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Initial Sort
        this.sort.active = tableColumnDef.id;
        this.sort.direction = tableColumnDef.direction ? tableColumnDef.direction : 'asc';
      }
      this.refresh();
    }
  }

  public dateFilterChanged(filterDef: TableFilterDef, event: MatDatetimepickerInputEvent<any>) {
    // Date?
    if (filterDef.type === FilterType.DATE) {
      filterDef.currentValue = event.value ? event.value.toDate() : null;
    }
    // Update filter
    this.filterChanged(filterDef);
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    let filterIsChanged = false;
    if (
      (filterDef.type === FilterType.DIALOG_TABLE || filterDef.type === FilterType.DROPDOWN) &&
      filterDef.multiple
    ) {
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
    dialogRef
      .afterClosed()
      .pipe(takeWhile(() => this.alive))
      .subscribe((data) => {
        if (data) {
          filterDef.currentValue = data;
          this.filterChanged(filterDef);
        }
      });
  }

  public toggleAutoRefresh({ checked }) {
    this.tableActionAutoRefresh.currentValue = checked;
    if (checked) {
      this.createAutoRefresh();
    } else {
      this.destroyAutoRefresh();
    }
  }

  public refresh(autoRefresh = false) {
    // Start refresh
    if (!this.ongoingRefresh) {
      const refreshDone = () => {
        this.ongoingRefresh = false;
        if (autoRefresh) {
          this.ongoingAutoRefresh = false;
        }
        // Recreate the timeout
        this.destroyAutoRefresh();
        this.createAutoRefresh();
      };
      // Refresh Data
      this.ongoingRefresh = true;
      this.ongoingAutoRefresh = autoRefresh;
      this.dataSource.refreshData(!this.ongoingAutoRefresh).subscribe({
        next: () => {
          refreshDone();
        },
        error: (error) => {
          refreshDone();
        },
      });
    }
  }

  public resetFilters() {
    this.dataSource.setSearchValue('');
    this.dataSource.resetFilters();
    this.searchInput.nativeElement.value = '';
    this.refresh();
  }

  public resetSearchFilter() {
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
    const loadingDone = () => {
      this.loading = false;
      this.createAutoRefresh();
    };
    // Start initial loading
    this.loading = true;
    this.dataSource.loadData().subscribe({
      next: () => {
        loadingDone();
      },
      error: (error) => {
        loadingDone();
      },
    });
  }

  public showHideDetailsClicked(row: any) {
    // Already Expanded
    if (!row.isExpanded) {
      // Already Loaded
      if (
        this.dataSource &&
        this.dataSource.tableDef &&
        this.dataSource.tableDef.rowDetails &&
        this.dataSource.tableDef.rowDetails.enabled &&
        this.dataSource.tableDef.rowDetails.detailsField &&
        !row[this.dataSource.tableDef.rowDetails.detailsField]
      ) {
        // No: Load details from data source
        this.dataSource
          .getRowDetails(row)
          .pipe(takeWhile(() => this.alive))
          .subscribe((details) => {
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

  private createAutoRefresh() {
    if (
      !this.autoRefreshTimeout &&
      this.refreshIntervalSecs &&
      this.tableActionAutoRefresh?.currentValue
    ) {
      // Create the timer
      this.autoRefreshTimeout = setTimeout(() => {
        if (this.alive && !this.loading && !this.ongoingRefresh) {
          this.refresh(true);
        }
      }, this.refreshIntervalSecs * 1000);
    }
  }

  private destroyAutoRefresh() {
    if (this.autoRefreshTimeout) {
      clearTimeout(this.autoRefreshTimeout);
      this.autoRefreshTimeout = null;
    }
  }
}
