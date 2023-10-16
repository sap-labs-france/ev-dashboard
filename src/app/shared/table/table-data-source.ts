import { UntypedFormArray } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

import { SpinnerService } from '../../services/spinner.service';
import { DataResult, Ordering, Paging } from '../../types/DataResult';
import { FilterParams } from '../../types/GlobalType';
import {
  DropdownItem,
  FilterType,
  TableActionDef,
  TableColumnDef,
  TableData,
  TableDataSourceMode,
  TableDef,
  TableFilterDef,
} from '../../types/Table';
import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';
import { TableResetFiltersAction } from './actions/table-reset-filters-action';

export abstract class TableDataSource<T extends TableData> {
  public tableDef!: TableDef;
  public tableColumnsDef!: TableColumnDef[];
  public tableFiltersDef!: TableFilterDef[];
  public tableActionsDef!: TableActionDef[];
  public tableActionsRightDef!: TableActionDef[];
  public tableRowActionsDef!: TableActionDef[];
  public firstLoad = false;
  public tableDataSourceMode!: TableDataSourceMode;

  public data: T[] = [];
  public formArray?: UntypedFormArray;
  public paging: Paging = {
    limit: this.getPageSize(),
    skip: 0,
  };
  public sort: MatSort = new MatSort();

  public hasActions!: boolean;
  public hasFilters!: boolean;
  public filterSet = false;
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
  private staticFilters: Record<string, unknown>[] = [];

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    public additionalParameters?: any
  ) {}

  public isRowSelectionEnabled(): boolean {
    return !!this.tableDef && !!this.tableDef.rowSelection && this.tableDef.rowSelection.enabled;
  }

  public isRowDetailsEnabled(): boolean {
    return !!this.tableDef && !!this.tableDef.rowDetails && this.tableDef.rowDetails.enabled;
  }

  public hasRowDetailsHideShowField(): boolean {
    return (
      !!this.tableDef &&
      !!this.tableDef.rowDetails &&
      Utils.objectHasProperty(this.tableDef.rowDetails, 'showDetailsField')
    );
  }

  public isMultiSelectionEnabled(): boolean {
    return !!this.tableDef && !!this.tableDef.rowSelection && !!this.tableDef.rowSelection.multiple;
  }

  public isEditable(): boolean {
    return this.tableDef && this.tableDef.isEditable;
  }

  public getMode(): TableDataSourceMode {
    return this.tableDataSourceMode;
  }

  public setMode(tableDataSourceMode: TableDataSourceMode) {
    this.tableDataSourceMode = tableDataSourceMode;
  }

  public setMultipleRowSelection(multipleRowSelection: boolean) {
    this.multipleRowSelection = multipleRowSelection;
    if (
      this.tableDef &&
      this.tableDef.rowSelection &&
      !Utils.isUndefined(this.multipleRowSelection)
    ) {
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
    return this.selectedRows > 0;
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
    this.clearSelectedRows();
    this.data.forEach((row) => {
      if (row.isSelectable) {
        this.toggleRowSelection(row, true);
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

  public toggleRowSelection(row: T, checked: boolean) {
    if (this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.multiple) {
      row.isSelected = checked;
      if (row.isSelected) {
        this.selectedRows++;
        this.lastSelectedRow = row;
      } else {
        this.selectedRows--;
        this.lastSelectedRow = null;
      }
    } else {
      this.clearSelectedRows();
      if (checked) {
        row.isSelected = checked;
        this.selectedRows = 1;
        this.lastSelectedRow = row;
      }
    }
  }

  public isAllSelected() {
    return this.selectedRows === this.maxSelectableRows;
  }

  public setSearchValue(searchValue: string) {
    // Reset to default paging
    this.setPaging({
      skip: 0,
      limit: this.getPageSize(),
    });
    this.searchValue = searchValue;
    this.filterSet = true;
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
    const sort = this.getSort();
    if (sort && sort.active) {
      return [{ field: (sort.direction === 'desc' ? '-' : '') + sort.active }];
    }
    // Find Sorted columns
    const columnDef = this.tableColumnsDef.find((column) => column.sorted);
    if (columnDef) {
      return [{ field: (sort.direction === 'desc' ? '-' : '') + sort.active }];
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
    if (!Utils.isEmptyArray(this.tableFiltersDef)) {
      return [new TableResetFiltersAction().getActionDef()];
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

  public setTableDef(tableDef: TableDef) {
    this.tableDef = tableDef;
  }

  public setTableColumnDef(tableColumnDef: TableColumnDef[]) {
    this.tableColumnsDef = tableColumnDef;
  }

  public setTableActionDef(tableActionDef: TableActionDef[]) {
    this.tableActionsDef = tableActionDef;
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
    const foundFilter = this.tableFiltersDef.find((filterDef) => filterDef.id === filter.id);
    // Update value
    if (foundFilter) {
      foundFilter.currentValue = filter.currentValue;
    }
    if (filter.multiple) {
      this.updateFilterLabel(filter);
    }
    this.filterSet = true;
  }

  public updateFilterLabel(filter: TableFilterDef) {
    if (filter.multiple) {
      if (Array.isArray(filter.currentValue)) {
        if (filter.currentValue.length > 0) {
          if (Utils.isEmptyString(filter.currentValue[0].value)) {
            filter.label = '';
          } else {
            filter.label =
              this.translateService.instant(
                filter.currentValue[0].value ? filter.currentValue[0].value : filter.currentValue[0]
              ) + (filter.currentValue.length > 1 ? ` (+${filter.currentValue.length - 1})` : '');
          }
        } else {
          filter.label = '';
        }
      }
    }
  }

  public resetFilters() {
    if (this.tableFiltersDef) {
      // Reset all filter fields
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
        switch (filterDef.type) {
          case FilterType.DROPDOWN:
          case FilterType.DATE_RANGE:
            filterDef.reset();
            break;
          case FilterType.DIALOG_TABLE:
            if (filterDef.multiple) {
              filterDef.currentValue = [];
              filterDef.label = '';
            } else {
              filterDef.currentValue = null;
            }
            break;
          case 'date':
            if (Utils.objectHasProperty(filterDef, 'reset')) {
              filterDef.reset();
            }
            break;
        }
        this.updateFilterLabel(filterDef);
      });
      // Init
      this.resetTotalNumberOfRecords();
      this.filterSet = false;
    }
  }

  // eslint-disable-next-line no-empty,@typescript-eslint/no-empty-function
  public rowCellUpdated(cellValue: any, rowIndex: number, columnDef: TableColumnDef) {}

  // eslint-disable-next-line no-empty,@typescript-eslint/no-empty-function
  public actionTriggered(actionDef: TableActionDef) {}

  // eslint-disable-next-line no-empty,@typescript-eslint/no-empty-function
  public rowActionTriggered(actionDef: TableActionDef, rowItem: any, dropdownItem?: DropdownItem) {}

  // eslint-disable-next-line complexity
  public buildFilterValues(withSearch: boolean = true): FilterParams {
    let filterJson = {};
    // Parse filters
    if (this.tableFiltersDef) {
      for (const filterDef of this.tableFiltersDef) {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== FilterType.ALL_KEY) {
          if (filterDef.type === 'date') {
            // Date
            filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
          } else if (filterDef.type === FilterType.DATE_RANGE) {
            // Date range
            filterJson[filterDef.dateRangeTableFilterDef?.startDateTimeHttpId] =
              filterDef.currentValue.startDate.toISOString();
            filterJson[filterDef.dateRangeTableFilterDef?.endDateTimeHttpId] =
              filterDef.currentValue.endDate.toISOString();
          } else if (filterDef.type === FilterType.DIALOG_TABLE) {
            // Mono selection
            if (!filterDef.multiple) {
              if (!Utils.isEmptyArray(filterDef.currentValue)) {
                if (filterDef.currentValue[0].key !== FilterType.ALL_KEY) {
                  if (filterDef.currentValue.length > 1) {
                    // Handle multiple key selection as a JSON array
                    const jsonKeys = [];
                    for (const value of filterDef.currentValue) {
                      jsonKeys.push(value.key);
                    }
                    filterJson[filterDef.httpId] = JSON.stringify(jsonKeys);
                  } else {
                    filterJson[filterDef.httpId] = filterDef.currentValue[0].key;
                  }
                }
              }
              // Multiple selections
            } else {
              if (!Utils.isEmptyArray(filterDef.currentValue)) {
                filterJson[filterDef.httpId] = filterDef.currentValue
                  .map((obj) => obj.key)
                  .join('|');
              }
            }
            // Dropdown with multiple selections
          } else if (filterDef.type === FilterType.DROPDOWN && filterDef.multiple) {
            if (
              !Utils.isEmptyArray(filterDef.currentValue) &&
              (filterDef.currentValue.length < filterDef.items.length || !filterDef.exhaustive)
            ) {
              filterJson[filterDef.httpId] = filterDef.currentValue.map((obj) => obj.key).join('|');
            }
            // Others
          } else {
            filterJson[filterDef.httpId] = filterDef.currentValue;
          }
        }
      }
    }
    // With Search?
    const searchValue = this.getSearchValue();
    if (withSearch && searchValue) {
      filterJson['Search'] = searchValue;
    }
    // Static filters
    if (!Utils.isEmptyArray(this.staticFilters)) {
      filterJson = Object.assign(filterJson, ...this.staticFilters);
    }
    return filterJson;
  }

  public getRowDetails(row: T): Observable<string> {
    return of('getRowDetails() not implemented in your data source!');
  }

  public setStaticFilters(staticFilters: Record<string, unknown>[]): void {
    this.staticFilters = staticFilters;
  }

  public getStaticFilters(): Record<string, unknown>[] {
    return this.staticFilters;
  }

  // eslint-disable-next-line no-empty, @typescript-eslint/no-empty-function
  public onRowActionMenuOpen(action: TableActionDef, row: T) {}

  public refreshData(showSpinner = true): Observable<void> {
    // Init paging
    const currentPaging = this.getPaging();
    // Reload all loaded records
    this.setPaging({
      skip: 0,
      limit: currentPaging.limit + currentPaging.skip,
    });
    // Init
    this.resetTotalNumberOfRecords();
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
      this.loadDataImpl()
        .pipe(first())
        .subscribe({
          next: (data) => {
            // Set nbr of records
            this.setTotalNumberOfRecords(data.count);
            // Display only projected fields
            if (!Utils.isEmptyArray(data.projectFields)) {
              // Format createdBy/lastChangeBy properties Ids
              data.projectFields = data.projectFields.map((projectedField) => {
                if (
                  projectedField.split('.')[0] === 'createdBy' ||
                  projectedField.split('.')[0] === 'lastChangedBy'
                ) {
                  return projectedField.split('.')[0];
                } else {
                  return projectedField;
                }
              });
              for (const tableColumnDef of this.tableColumnsDef) {
                // If column visibility is not already set we use the project field
                const isColumnIDInProjectedFields = data.projectFields.includes(tableColumnDef.id);
                if (
                  Utils.isNullOrUndefined(tableColumnDef.visible) ||
                  !isColumnIDInProjectedFields
                ) {
                  tableColumnDef.visible = isColumnIDInProjectedFields;
                }
              }
              // No projected fields, display all
            } else {
              for (const tableColumnDef of this.tableColumnsDef) {
                // Only if prop is not provided
                if (!Utils.objectHasProperty(tableColumnDef, 'visible')) {
                  // If column visibility is not already set we display it (project field is empty)
                  if (Utils.isNullOrUndefined(tableColumnDef.visible)) {
                    tableColumnDef.visible = true;
                  }
                }
              }
            }
            // Build stats
            this.tableFooterStats = this.buildTableFooterStats(data);
            this.setData(data.result);
            // Loading on going?
            if (!this.loadingNumberOfRecords) {
              if (
                this.data.length !== this.totalNumberOfRecords && // Already have all the records?
                this.totalNumberOfRecords === Constants.INFINITE_RECORDS
              ) {
                // Load records
                this.requestNumberOfRecords();
              }
            }
            if (showSpinner) {
              this.spinnerService.hide();
            }
            this.firstLoad = true;
            observer.next();
            observer.complete();
          },
          error: (error) => {
            if (showSpinner) {
              this.spinnerService.hide();
            }
            observer.error(error);
          },
        });
    });
  }

  public getData(): T[] {
    return this.data;
  }

  public destroyDataSource() {
    this.clearData();
    this.resetTotalNumberOfRecords();
    this.clearPaging();
  }

  public getTableDef(): TableDef {
    return this.tableDef;
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
    const staticFilters = [...this.getStaticFilters(), { OnlyRecordCount: true }];
    // Set
    this.setStaticFilters(staticFilters);
    // Load data
    this.loadDataImpl(true)
      .pipe(first())
      .subscribe((data) => {
        this.setTotalNumberOfRecords(data.count);
        this.tableFooterStats = this.buildTableFooterStats(data);
        // Loading ended
        this.loadingNumberOfRecords = false;
      });
    // Reset static filter
    staticFilters.splice(staticFilters.length - 1, 1);
    this.setStaticFilters(staticFilters);
  }

  public buildTableDynamicRowActions(row?: T): TableActionDef[] {
    return [];
  }

  public canDisplayRowAction(rowAction: TableActionDef, rowItem: T) {
    return true;
  }

  public isSelectable(row: T) {
    return true;
  }

  public initDataSource(force: boolean = false): void {
    // Init data from sub-classes
    this.initTableColumnDefs(force);
    this.initTableDef(force);
    this.initTableFiltersDef(force);
    this.initTableActionsDef(force);
    this.initTableActionsRightDef(force);
    this.initTableRowActions(force);
    this.hasActions =
      !Utils.isEmptyArray(this.tableActionsDef) || !Utils.isEmptyArray(this.tableActionsRightDef);
    this.hasFilters = !Utils.isEmptyArray(this.tableFiltersDef);
    this.isSearchEnabled =
      !!this.tableDef && !!this.tableDef.search && this.tableDef.search.enabled;
    this.isFooterEnabled =
      !!this.tableDef && !!this.tableDef.footer && this.tableDef.footer.enabled;
    this.hasRowActions =
      (!!this.tableRowActionsDef && this.tableRowActionsDef.length > 0) ||
      (!!this.tableDef && !!this.tableDef.hasDynamicRowAction);
  }

  protected updateRowActions(row: T) {
    if (this.hasRowActions) {
      // Check if authorized
      this.tableRowActionsDef.forEach((rowActionDef) => {
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
    if (!this.tableColumnsDef || force) {
      this.tableColumnsDef = this.buildTableColumnDefs();
    }
    return this.tableColumnsDef;
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
      for (const tableFilterDef of this.tableFiltersDef) {
        this.updateFilterLabel(tableFilterDef);
      }
    }
    return this.tableFiltersDef;
  }

  private initTableDef(force: boolean): TableDef {
    if (!this.tableDef || force) {
      this.tableDef = this.buildTableDef();
    }
    // Override multi-selection (let the undef check for boolean not yet assigned!)
    if (
      this.tableDef &&
      this.tableDef.rowSelection &&
      !Utils.isUndefined(this.multipleRowSelection)
    ) {
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
    if (
      this.tableDef &&
      this.tableDef.rowSelection &&
      this.tableDef.rowSelection.enabled &&
      this.tableDef.rowSelection.multiple
    ) {
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
      for (const tableColumnDef of this.tableColumnsDef) {
        // Keep a ref of the column def
        freshRow[tableColumnDef.id + 'TableColumnsDef'] = tableColumnDef;
        // Check for complex column id with dot
        if (tableColumnDef.id.indexOf('.') !== -1) {
          const keys = tableColumnDef.id.split('.');
          let value = freshRow;
          keys.forEach((key) => {
            if (value) {
              value = value[key];
            }
          });
          // Create new var for direct access
          freshRow[tableColumnDef.id] = value;
        }
      }
      // Check dynamic row actions
      if (this.tableDef.hasDynamicRowAction) {
        const dynamicRowActions = this.buildTableDynamicRowActions(freshRow);
        if (!Utils.isEmptyArray(dynamicRowActions)) {
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
        // Set the ID
        if (!rowID) {
          freshRow.id = freshRow[rowID];
        }
      }
      // Check if Expanded
      const foundExpandedRow = expandedRowIDs.find((expandedRow) => expandedRow.id === freshRow.id);
      if (foundExpandedRow) {
        // Check if the table has a specific field to hide/show details
        if (
          this.tableDef &&
          this.tableDef.rowDetails &&
          this.tableDef.rowDetails.showDetailsField
        ) {
          // Check if it's still visible
          if (Utils.objectHasProperty(freshRow, this.tableDef.rowDetails.showDetailsField)) {
            // Set
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
          freshRow[this.tableDef.rowDetails.detailsField] =
            foundExpandedRow[this.tableDef.rowDetails.detailsField];
        }
      }
      // Check if Selected
      if (selectedRowIDs.indexOf(freshRow.id) !== -1) {
        // Select it
        freshRow.isSelected = true;
      }
    }
  }

  public abstract buildTableDef(): TableDef;

  public abstract buildTableColumnDefs(): TableColumnDef[];

  public abstract loadDataImpl(requestNumberOfRecords?: boolean): Observable<DataResult<T>>;
}
