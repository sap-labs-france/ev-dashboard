import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeWhile } from 'rxjs/operators';

import { ConfigService } from '../../services/config.service';
import { LocaleService } from '../../services/locale.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import ChangeNotification from '../../types/ChangeNotification';
import { ButtonAction } from '../../types/GlobalType';
import { Data, DropdownItem, FilterType, TableActionDef, TableColumnDef, TableEditType, TableFilterDef } from '../../types/Table';
import { Constants } from '../../utils/Constants';
import { TableDataSource } from './table-data-source';

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public dataSource!: TableDataSource<Data>;
  @ViewChild('searchInput') public searchInput!: ElementRef;
  public searchPlaceholder = '';
  private ongoingRefresh = false;
  public ongoingAutoRefresh = false;
  public sort: MatSort = new MatSort();
  public maxRecords = Constants.INFINITE_RECORDS;
  public numberOfColumns = 0;
  public loading = false;

  public readonly FilterType = FilterType;
  public readonly TableEditType = TableEditType;
  public readonly ButtonAction = ButtonAction;

  private autoRefreshSubscription!: Subscription;
  private alive!: boolean;

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
    // HACK: Avoid ERROR Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
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
      if (this.dataSource.tableActionsRightDef) {
        // Init Auto-Refresh
        for (const tableActionRightDef of this.dataSource.tableActionsRightDef) {
          if (tableActionRightDef.id === ButtonAction.AUTO_REFRESH) {
            // Active by default?
            if (tableActionRightDef.currentValue) {
              this.createAutoRefresh();
            }
            break;
          }
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

  public updateUrlWithFilters(filter: TableFilterDef) {
    // Update URL with filter value
    if (filter.httpId && filter.httpId !== 'null') {
      // Capitalize first letter of search id
      const filterIdInCap = filter.httpId;
      if (filter.currentValue === 'null' || !filter.currentValue) {
        this.windowService.deleteSearch(filterIdInCap);
      } else {
        switch (filter.type) {
          case FilterType.DIALOG_TABLE: {
            this.windowService.setSearch(filterIdInCap, filter.currentValue[0].key);
            break;
          }
          case FilterType.DROPDOWN: {
            this.windowService.setSearch(filterIdInCap, filter.currentValue);
            break;
          }
          case FilterType.DATE: {
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
    if (filterDef.type === FilterType.DATE) {
      filterDef.currentValue = event.value ? event.value.toDate() : null;
    }
    // Update filter
    this.filterChanged(filterDef);
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    let filterIsChanged = false;
    if ((filterDef.type === FilterType.DIALOG_TABLE ||
      filterDef.type === FilterType.DROPDOWN) && filterDef.multiple) {
      if (filterDef.currentValue.length > 0) {
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
    // Init button title
    dialogConfig.data = {
      validateButtonTitle: 'general.set_filter',
    };
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

  private createAutoRefresh() {
    if (this.configService.getCentralSystemServer().socketIOEnabled) {
      if (!this.autoRefreshSubscription) {
        const refreshObservable: Observable<ChangeNotification> = this.dataSource.getDataChangeSubject();
        if (refreshObservable) {
          this.autoRefreshSubscription = refreshObservable.pipe(
            takeWhile(() => this.alive),
          ).subscribe(() => {
            if (!this.ongoingRefresh) {
              this.refresh(true);
            }
          });
        }
      }
    }
  }

  private destroyAutoRefresh() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
    this.autoRefreshSubscription = null;
  }

  public toggleAutoRefresh({ checked }) {
    if (checked) {
      this.createAutoRefresh();
    } else {
      this.destroyAutoRefresh();
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

  public toggleRowSelection(row: Data, event: MatCheckboxChange) {
    this.dataSource.toggleRowSelection(row, event.checked);
  }

  public toggleMasterSelect() {
    this.dataSource.toggleMasterSelect();
  }

  public onRowActionMenuOpen(action: TableActionDef, row: any) {
    this.dataSource.onRowActionMenuOpen(action, row);
  }

  public trackByObjectId(index: number, item: Data): string {
    return item.id as string;
  }

  public trackByObjectIndex(index: number, item: Data): string {
    return index.toString();
  }

  public loadData() {
    this.loading = true;
    this.dataSource.loadData().subscribe(() => {
      this.loading = false;
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
