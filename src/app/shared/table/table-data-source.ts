import { FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSort } from '@angular/material/sort';
import { SpinnerService } from 'app/services/spinner.service';
import { DataResult, Ordering, Paging } from 'app/types/DataResult';
import { SubjectInfo } from 'app/types/GlobalType';
import { Data, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { of, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Constants } from '../../utils/Constants';
import { TableResetFiltersAction } from './actions/table-reset-filters-action';

export abstract class TableDataSource<T extends Data> {
  public tableDef!: TableDef;
  public tableColumnDefs!: TableColumnDef[];
  public tableFiltersDef!: TableFilterDef[];
  public tableActionsDef!: TableActionDef[];
  public tableActionsRightDef!: TableActionDef[];
  public tableRowActionsDef!: TableActionDef[];

  public data: T[] = [];
  public formArray?: FormArray;
  public paging: Paging = {
    limit: this.getPageSize(),
    skip: 0,
  };
  public sort: MatSort = new MatSort();

  public hasActions!: boolean;
  public hasFilters!: boolean;
  public isSearchEnabled = false;
  public isFooterEnabled = false;
  public hasRowActions = false;
  public selectedRows = 0;
  public maxSelectableRows = 0;
  public lastSelectedRow: any;
  public totalNumberOfRecords = Constants.INFINITE_RECORDS;
  public tableFooterStats = '';
  public multipleRowSelection!: boolean;

  private loadingNumberOfRecords = false;
  private searchValue = '';
  private staticFilters: object[] = [];

  constructor(
    public spinnerService: SpinnerService,
    public additionalParameters?: any) {
  }

  public isRowSelectionEnabled(): boolean {
    return !!this.tableDef && !!this.tableDef.rowSelection && this.tableDef.rowSelection.enabled;
  }

  public isRowDetailsEnabled(): boolean {
    return !!this.tableDef && !!this.tableDef.rowDetails && this.tableDef.rowDetails.enabled;
  }

  public hasRowDetailsHideShowField(): boolean {
    return !!this.tableDef && !!this.tableDef.rowDetails && this.tableDef.rowDetails.hasOwnProperty('showDetailsField');
  }

  public isMultiSelectionEnabled(): boolean {
    return !!this.tableDef && !!this.tableDef.rowSelection && !!this.tableDef.rowSelection.multiple;
  }

  public setMultipleRowSelection(multipleRowSelection: boolean) {
    this.multipleRowSelection = multipleRowSelection;
    if (this.tableDef && this.tableDef.rowSelection && this.multipleRowSelection !== undefined) {
      this.tableDef.rowSelection.multiple = this.multipleRowSelection;
      if (!multipleRowSelection && this.selectedRows > 1) {
        this.clearSelectedRows();
      }
    }
  }

  public getSelectedRows(): T[] {
    return this.data.filter((row) => row.isSelected);
  }

  public hasSelectedRows(): boolean {
    return (this.selectedRows > 0);
  }

  public clearSelectedRows() {
    // Clear all
    this.selectedRows = 0;
    this.lastSelectedRow = null;
    this.data.forEach((row) => {
      if (row.isSelectable) {
        row.isSelected = false;
      }
    });
  }

  public selectAllRows() {
    // Select All
    this.selectedRows = 0;
    this.data.forEach((row) => {
      if (row.isSelectable) {
        row.isSelected = true;
        this.selectedRows++;
      }
    });
  }

  public toggleMasterSelect() {
    if (this.isAllSelected()) {
      this.clearSelectedRows();
    } else {
      this.selectAllRows();
    }
  }

  public toggleRowSelection(row: Data, event: MatCheckboxChange) {
    if (this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.multiple) {
      row.isSelected = event.checked;
      if (row.isSelected) {
        this.selectedRows++;
        this.lastSelectedRow = row;
      } else {
        this.selectedRows--;
        this.lastSelectedRow = null;
      }
    } else {
      this.clearSelectedRows();
      if (event.checked) {
        row.isSelected = event.checked;
        this.selectedRows = 1;
        this.lastSelectedRow = row;
      }
    }
  }

  public isAllSelected() {
    return (this.selectedRows === this.maxSelectableRows);
  }

  public setSearchValue(searchValue: string) {
    // Reset to default paging
    this.setPaging({
      skip: 0,
      limit: this.getPageSize(),
    });
    this.searchValue = searchValue;
  }

  public getSearchValue(): string {
    return this.searchValue;
  }

  public getPageSize(): number {
    return Constants.DEFAULT_PAGE_SIZE;
  }

  public setPaging(paging: Paging) {
    this.paging = paging;
  }

  public getPaging(): Paging {
    if (!this.paging) {
      this.paging = {
        skip: 0,
        limit: this.getPageSize(),
      };
    }
    return this.paging;
  }

  public setSort(sort: MatSort) {
    this.sort = sort;
  }

  public getSort(): MatSort {
    return this.sort;
  }

  public getSorting(): Ordering[] {
    if (this.getSort()) {
      return [
        { field: this.getSort().active, direction: this.getSort().direction },
      ];
    }
    // Find Sorted columns
    const columnDef = this.tableColumnDefs.find((column) => column.sorted === true);
    if (columnDef) {
      return [
        { field: columnDef.id, direction: columnDef.direction ? columnDef.direction : '' },
      ];
    }
    return [];
  }

  public setTotalNumberOfRecords(totalNumberOfRecords: number) {
    // Set only when all records have been retrieved
    if (totalNumberOfRecords !== Constants.INFINITE_RECORDS) {
      this.totalNumberOfRecords = totalNumberOfRecords;
    }
  }

  public buildTableFooterStats(data: any): string {
    return '';
  }

  public getTotalNumberOfRecords(): number {
    return this.totalNumberOfRecords;
  }

  public resetTotalNumberOfRecords() {
    this.totalNumberOfRecords = Constants.INFINITE_RECORDS;
  }

  public buildTableActionsDef(): TableActionDef[] {
    // Default
    if (this.tableFiltersDef && this.tableFiltersDef.length > 0) {
      return [
        new TableResetFiltersAction().getActionDef(),
      ];
    }
    return [];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  abstract buildTableDef(): TableDef;

  public setTableDef(tableDef: TableDef) {
    this.tableDef = tableDef;
  }

  public filterChanged(filter: TableFilterDef) {
    // Reset to default paging
    this.setPaging({
      skip: 0,
      limit: this.getPageSize(),
    });
    // Init
    this.resetTotalNumberOfRecords();
    // Update Filter
    const foundFilter = this.tableFiltersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });
    // Update value
    if (foundFilter) {
      foundFilter.currentValue = filter.currentValue;
    }
  }

  public resetFilters() {
    if (this.tableFiltersDef) {
      // Reset all filter fields
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
        switch (filterDef.type) {
          case Constants.FILTER_TYPE_DROPDOWN:
            if (filterDef.multiple) {
              filterDef.currentValue = [];
              filterDef.label = '';
            } else {
              filterDef.currentValue = null;
            }
            break;
          case Constants.FILTER_TYPE_DIALOG_TABLE:
            if (filterDef.multiple) {
              filterDef.currentValue = [];
              filterDef.label = '';
            } else {
              filterDef.currentValue = null;
            }
            break;
          case 'date':
            filterDef.reset && filterDef.reset();
            break;
        }
      });
      // Init
      this.resetTotalNumberOfRecords();
    }
  }

  // tslint:disable-next-line:no-empty
  public updateRow(row: any, index: number, columnDef: TableColumnDef) {
  }

  // tslint:disable-next-line:no-empty
  public actionTriggered(actionDef: TableActionDef) {
  }

  // tslint:disable-next-line:no-empty
  public rowActionTriggered(actionDef: TableActionDef, rowItem: any, dropdownItem?: DropdownItem) {
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    throw new Error('You must implement the method TableDataSource.getDataChangeSubject() to enable the auto-refresh feature');
  }

  public buildFilterValues(withSearch: boolean = true): { [param: string]: string | string[]; } {
    let filterJson = {};
    // Parse filters
    if (this.tableFiltersDef) {
      this.tableFiltersDef.forEach((filterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
          // Date
          if (filterDef.type === 'date') {
            // @ts-ignore
            filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
            // Dialog
          } else if (filterDef.type === Constants.FILTER_TYPE_DIALOG_TABLE && !filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              if (filterDef.currentValue[0].key !== Constants.FILTER_ALL_KEY) {
                if (filterDef.currentValue.length > 1) {
                  // Handle multiple key selection as a JSON array
                  const jsonKeys = [];
                  for (const value of filterDef.currentValue) {
                    jsonKeys.push(value.key);
                  }
                  // @ts-ignore
                  filterJson[filterDef.httpId] = JSON.stringify(jsonKeys);
                } else {
                  // @ts-ignore
                  filterJson[filterDef.httpId] = filterDef.currentValue[0].key;
                }
              }
            }
            // Dialog with multiple selections
          } else if (filterDef.type === Constants.FILTER_TYPE_DIALOG_TABLE && filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              // @ts-ignore
              filterJson[filterDef.httpId] = filterDef.currentValue.map((obj) => obj.key).join('|');
            }
            // Dropdown with multiple selections
          } else if (filterDef.type === Constants.FILTER_TYPE_DROPDOWN && filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              // @ts-ignore
              filterJson[filterDef.httpId] = filterDef.currentValue.map((obj) => obj.key).join('|');
            }
            // Others
          } else {
            // @ts-ignore
            filterJson[filterDef.httpId] = filterDef.currentValue;
          }
        }
      });
    }
    // With Search?
    const searchValue = this.getSearchValue();
    if (withSearch && searchValue) {
      // @ts-ignore
      filterJson['Search'] = searchValue;
    }
    // Static filters
    if (this.staticFilters && this.staticFilters.length > 0) {
      filterJson = Object.assign(filterJson, ...this.staticFilters);
    }
    return filterJson;
  }

  public getRowDetails(row: T): Observable<string> {
    return of('getRowDetails() not implemented in your data source!');
  }

  public setStaticFilters(staticFilters: object[]) {
    this.staticFilters = staticFilters;
  }

  public getStaticFilters(): object[] {
    return this.staticFilters;
  }

  // tslint:disable-next-line:no-empty
  public onRowActionMenuOpen(action: TableActionDef, row: T) {
  }

  abstract buildTableColumnDefs(): TableColumnDef[];

  public refreshData(showSpinner = true): Observable<void> {
    // Init paging
    const currentPaging = this.getPaging();
    // Reload all loaded records
    this.setPaging({
      skip: 0,
      limit: currentPaging.limit + currentPaging.skip,
    });
    // Load data
    return this.loadData(showSpinner);
  }

  public loadData(showSpinner = true): Observable<void> {
    return new Observable((observer) => {
      // Show Spinner
      if (showSpinner) {
        this.spinnerService.show();
      }
      // Load data source
      this.loadDataImpl().pipe(first()).subscribe((data) => {
        // Set nbr of records
        this.setTotalNumberOfRecords(data.count);
        // Build stats
        this.tableFooterStats = this.buildTableFooterStats(data);
        // Ok
        this.setData(data.result);
        // Loading on going?
        if (!this.loadingNumberOfRecords) {
          if (this.data.length !== this.totalNumberOfRecords &&  // Already have all the records?
            this.totalNumberOfRecords === Constants.INFINITE_RECORDS) {
            // Load records
            this.requestNumberOfRecords();
          }
        }
        // Hide Spinner
        if (showSpinner) {
          this.spinnerService.hide();
        }
        // Notify
        observer.next();
        observer.complete();
      }, (error) => {
        // Hide Spinner
        if (showSpinner) {
          this.spinnerService.hide();
        }
        observer.error(error);
      });
    });
  }

  abstract loadDataImpl(): Observable<DataResult<T>>;

  public getData(): T[] {
    return this.data;
  }

  public destroyDatasource() {
    this.clearData();
    this.resetTotalNumberOfRecords();
    this.clearPaging();
  }

  public clearData() {
    this.data.length = 0;
  }

  public clearPaging() {
    this.paging = {
      limit: this.getPageSize(),
      skip: 0,
    };
  }

  public requestNumberOfRecords() {
    // Loading on going
    this.loadingNumberOfRecords = true;
    // Reset current
    this.resetTotalNumberOfRecords();
    // Set static filter
    const staticFilters = [
      ...this.getStaticFilters(),
      { OnlyRecordCount: true },
    ];
    // Set
    this.setStaticFilters(staticFilters);
    // Load data
    this.loadDataImpl().pipe(first()).subscribe((data) => {
      this.setTotalNumberOfRecords(data.count);
      this.tableFooterStats = this.buildTableFooterStats(data);
      // Loading ended
      this.loadingNumberOfRecords = false;
    });
    // Reset static filter
    staticFilters.splice(staticFilters.length - 1, 1);
    this.setStaticFilters(staticFilters);
  }

  buildTableDynamicRowActions(row: T): TableActionDef[] {
    return [];
  }

  canDisplayRowAction(rowAction: TableActionDef, rowItem: T) {
    return true;
  }

  isSelectable(row: T) {
    return true;
  }

  protected initDataSource(force: boolean = false): void {
    // Init data from sub-classes
    this.initTableColumnDefs(force);
    this.initTableDef(force);
    this.initTableFiltersDef(force);
    this.initTableActionsDef(force);
    this.initTableActionsRightDef(force);
    this.initTableRowActions(force);

    // tslint:disable-next-line:max-line-length
    this.hasActions = (this.tableActionsDef && this.tableActionsDef.length > 0) ||
      (this.tableActionsRightDef && this.tableActionsRightDef.length > 0);
    this.hasFilters = (this.tableFiltersDef && this.tableFiltersDef.length > 0);
    this.isSearchEnabled = !!this.tableDef && !!this.tableDef.search && this.tableDef.search.enabled;
    this.isFooterEnabled = !!this.tableDef && !!this.tableDef.footer && this.tableDef.footer.enabled;
    this.hasRowActions = (!!this.tableRowActionsDef && this.tableRowActionsDef.length > 0) ||
      (!!this.tableDef && !!this.tableDef.hasDynamicRowAction);
  }

  protected updateRowActions(row: T) {
    if (this.hasRowActions) {
      // Check if authorized
      this.tableRowActionsDef.forEach((rowActionDef) => {
        // @ts-ignore
        row[`canDisplayRowAction-${rowActionDef.id}`] = this.canDisplayRowAction(rowActionDef, row);
      });
    }
  }

  private initTableRowActions(force: boolean): TableActionDef[] {
    if (!this.tableRowActionsDef || force) {
      this.tableRowActionsDef = this.buildTableRowActions();
    }
    return this.tableRowActionsDef;
  }

  private initTableColumnDefs(force: boolean): TableColumnDef[] {
    if (!this.tableColumnDefs || force) {
      this.tableColumnDefs = this.buildTableColumnDefs();
    }
    return this.tableColumnDefs;
  }

  private initTableActionsDef(force: boolean): TableActionDef[] {
    if (!this.tableActionsDef || force) {
      this.tableActionsDef = this.buildTableActionsDef();
    }
    return this.tableActionsDef;
  }

  private initTableActionsRightDef(force: boolean): TableActionDef[] {
    if (!this.tableActionsRightDef || force) {
      this.tableActionsRightDef = this.buildTableActionsRightDef();
    }
    return this.tableActionsRightDef;
  }

  private initTableFiltersDef(force: boolean): TableFilterDef[] {
    if (!this.tableFiltersDef || force) {
      this.tableFiltersDef = this.buildTableFiltersDef();
    }
    return this.tableFiltersDef;
  }

  private initTableDef(force: boolean): TableDef {
    if (!this.tableDef || force) {
      this.tableDef = this.buildTableDef();
    }
    // Override multi-selection (let the undef check for boolean not yet assigned!)
    if (this.tableDef && this.tableDef.rowSelection && this.multipleRowSelection !== undefined) {
      this.tableDef.rowSelection.multiple = this.multipleRowSelection;
    }
    return this.tableDef;
  }

  private setData(data: T[]) {
    // Format the data
    this.enrichData(data);
    // Check Paging
    if (this.paging.skip === 0) {
      // Clear array
      this.data.length = 0;
      this.data.push(...data);
    } else {
      // Add
      this.data.splice(this.paging.skip, this.paging.limit, ...data);
    }
    // Update Selection variables
    if (this.tableDef.rowSelection &&
      this.tableDef.rowSelection.enabled &&
      this.tableDef.rowSelection.multiple) {
      // Init
      this.maxSelectableRows = 0;
      this.selectedRows = 0;
      for (const row of this.data) {
        if (row.isSelectable) {
          this.maxSelectableRows++;
        } else {
          row.isSelected = false;
        }
        if (row.isSelected) {
          this.selectedRows++;
        }
      }
    }
  }

  private enrichData(freshData: T[]): void {
    const isRowSelectionEnabled = this.isRowSelectionEnabled();
    const expandedRowIDs = this.data.filter((row) => row.isExpanded);
    const selectedRowIDs = this.data.filter((row) => row.isSelected).map((row) => row.id);
    for (const freshRow of freshData) {
      // Check for complex property
      for (const tableColumnDef of this.tableColumnDefs) {
        // Check for complex column id with dot
        if (tableColumnDef.id.indexOf('.') !== -1) {
          const keys = tableColumnDef.id.split('.');
          let value = freshRow;
          keys.forEach((key) => {
            if (value) {
              // @ts-ignore
              value = value[key];
            }
          });
          // Create new var for direct access
          // @ts-ignore
          freshRow[tableColumnDef.id] = value;
        }
      }
      // Check dynamic row actions
      if (this.tableDef.hasDynamicRowAction) {
        const dynamicRowActions = this.buildTableDynamicRowActions(freshRow);
        if (dynamicRowActions.length > 0) {
          // @ts-ignore
          freshRow['dynamicRowActions'] = dynamicRowActions;
        }
      }
      this.updateRowActions(freshRow);
      // Check if row can be selected
      if (isRowSelectionEnabled) {
        freshRow.isSelectable = this.isSelectable(freshRow);
      }

      // Set row ID
      if (!freshRow.id) {
        // Get row ID
        const rowID = this.initTableDef(false).rowFieldNameIdentifier;
        // Trigger exception
        if (!rowID) {
          throw new Error('Table Def has no row ID defined!');
        }
        // Set the ID
        // @ts-ignore
        freshRow.id = freshRow[rowID];
      }
      // Check if Expanded
      const foundExpandedRow = expandedRowIDs.find((expandedRow) => expandedRow.id === freshRow.id);
      if (foundExpandedRow) {
        // Check if the table has a specific field to hide/show details
        if (this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.showDetailsField) {
          // Check if it's still visible
          if (freshRow.hasOwnProperty(this.tableDef.rowDetails.showDetailsField)) {
            // Set
            // @ts-ignore
            freshRow.isExpanded = freshRow[this.tableDef.rowDetails.showDetailsField];
          } else {
            freshRow.isExpanded = true;
          }
        } else {
          // Not hiding: keep the row expanded
          freshRow.isExpanded = true;
        }
        // Detailed field?
        if (this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.detailsField) {
          // @ts-ignore
          freshRow[this.tableDef.rowDetails.detailsField] = foundExpandedRow[this.tableDef.rowDetails.detailsField];
        }
      }
      // Check if Selected
      if (selectedRowIDs.indexOf(freshRow.id) !== -1) {
        // Select it
        freshRow.isSelected = true;
      }
    }
  }
}
