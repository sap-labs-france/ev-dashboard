import {Observable, of} from 'rxjs';
import {MatSort} from '@angular/material';
import {DropdownItem, Ordering, Paging, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {TableResetFiltersAction} from './actions/table-reset-filters-action';
import {Constants} from '../../utils/Constants';
import { SpinnerService } from 'app/services/spinner.service';
import * as _ from 'lodash';

export abstract class TableDataSource<T> {
  public tableDef: TableDef;
  public tableColumnDefs: TableColumnDef[];
  public tableFiltersDef: TableFilterDef[];
  public tableActionsDef: TableActionDef[];
  public tableActionsRightDef: TableActionDef[];
  public tableRowActionsDef: TableActionDef[];

  public data: any[] = [];
  public paging: Paging = {
    limit: this.getPageSize(),
    skip: 0
  };
  public sort: MatSort = new MatSort();

  public hasActions: boolean;
  public hasFilters: boolean;
  public isSearchEnabled: boolean;
  public isFooterEnabled: boolean;
  public hasRowActions: boolean;
  public selectedRows = 0;
  public maxSelectableRows = 0;
  public lastSelectedRow;
  public totalNumberOfRecords = Constants.INFINITE_RECORDS;

  private loadingNumberOfRecords = false;
  private searchValue = '';
  private staticFilters = [];

  constructor(
    public spinnerService: SpinnerService) {
  }

  public isRowSelectionEnabled(): boolean {
    // Return
    return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.enabled;
  }

  public isRowDetailsEnabled(): boolean {
    // Return
    return this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.enabled;
  }

  public hasRowDetailsHideShowField(): boolean {
    // Return
    return this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.hasOwnProperty('showDetailsField');
  }

  public isMultiSelectionEnabled(): boolean {
    // Return
    return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.multiple;
  }

  public getSelectedRows(): T[] {
    return this.data.filter((row) => row.isSelected);
  }

  public hasSelectedRows(): boolean {
    return (this.selectedRows > 0)
  }

  public clearSelectedRows() {
    // Clear
    this.selectedRows = 0;
    this.data.forEach((row) => {
      if (row.isSelectable) {
        row.isSelected = false;
      }
    })
  }

  public selectAllRows() {
    // Select All
    this.selectedRows = 0;
    this.data.forEach((row) => {
      // Check
      if (row.isSelectable) {
        row.isSelected = true;
        this.selectedRows++;
      }
    })
  }

  public toggleMasterSelect() {
    if (this.isAllSelected()) {
      // Unselect All
      this.clearSelectedRows();
    } else {
      // Select All
      this.selectAllRows();
    }
  }

  public toggleRowSelection(row) {
    // Invert
    row.isSelected = !row.isSelected;
    // Adjust number of selected rows
    if (row.isSelected) {
      this.selectedRows++
      // Single Select?
      if (!this.tableDef.rowSelection.multiple && this.lastSelectedRow) {
        // Unselect last row
        this.lastSelectedRow.isSelected = false;
      }
      this.lastSelectedRow = row;
    } else {
      this.selectedRows--
      this.lastSelectedRow = null;
    }
  }

  public isAllSelected() {
    return (this.selectedRows === this.maxSelectableRows);
  }

  public setSearchValue(searchValue: string) {
    // Reset to default paging
    this.setPaging({
      skip: 0,
      limit: this.getPageSize()
    });
    // Set value
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
        limit: this.getPageSize()
      }
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
        {field: this.getSort().active, direction: this.getSort().direction}
      ]
    } else {
      // Find Sorted columns
      const columnDef = this.tableColumnDefs.find((column) => column.sorted === true);
      // Found?
      if (columnDef) {
        // Yes: Set Sorting
        return [
          {field: columnDef.id, direction: columnDef.direction}
        ]
      }
    }
  }

  public setTotalNumberOfRecords(totalNumberOfRecords: number) {
    // Set only when all records have been retrieved
    if (totalNumberOfRecords !== Constants.INFINITE_RECORDS) {
      this.totalNumberOfRecords = totalNumberOfRecords;
    }
  }

  public getTotalNumberOfRecords(): number {
    return this.totalNumberOfRecords;
  }

  public resetTotalNumberOfRecords() {
    this.totalNumberOfRecords = Constants.INFINITE_RECORDS;
  }

  public buildTableActionsDef(): TableActionDef[] {
    // Return default
    if (this.tableFiltersDef && this.tableFiltersDef.length > 0) {
      return [
        new TableResetFiltersAction().getActionDef()
      ];
    } else {
      return [];
    }
  }

  public getTableActionsDef(): TableActionDef[] {
    if (!this.tableActionsDef) {
      this.tableActionsDef = this.buildTableActionsDef();
    }
    return this.tableActionsDef;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    if (!this.tableActionsRightDef) {
      this.tableActionsRightDef = this.buildTableActionsRightDef();
    }
    return this.tableActionsRightDef;
  }

  public buildTableRowActions(): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableRowActions(): TableActionDef[] {
    if (!this.tableRowActionsDef) {
      this.tableRowActionsDef = this.buildTableRowActions();
    }
    return this.tableRowActionsDef;
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    if (!this.tableFiltersDef) {
      this.tableFiltersDef = this.buildTableFiltersDef();
    }
    return this.tableFiltersDef;
  }

  abstract buildTableDef(): TableDef;

  public getTableDef(): TableDef {
    if (!this.tableDef) {
      this.tableDef = this.buildTableDef();
    }
    return this.tableDef;
  }

  public setTableDef(tableDef: TableDef) {
    this.tableDef = tableDef;
  }

  public filterChanged(filter: TableFilterDef) {
    // Reset to default paging
    this.setPaging({
      skip: 0,
      limit: this.getPageSize()
    });
    // Update Filter
    const foundFilter = this.tableFiltersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });
    // Update value
    foundFilter.currentValue = filter.currentValue;
  }

  public resetFilters() {
    if (this.tableFiltersDef) {
      // Reset all filter fields
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
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
  }

  public actionTriggered(actionDef: TableActionDef) {
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    // Return
    throw new Error('You must implement the method TableDataSource.getDataChangeSubject() to enable the auto-refresh feature');
  }

  public buildFilterValues(withSearch: boolean = true) {
    let filterJson = {};
    // Parse filters
    if (this.tableFiltersDef) {
      this.tableFiltersDef.forEach((filterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
          // Date
          if (filterDef.type === 'date') {
            filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
          // Table
          } else if (filterDef.type === Constants.FILTER_TYPE_DIALOG_TABLE) {
            if (filterDef.currentValue.length > 0) {
              if (filterDef.currentValue[0].key !== Constants.FILTER_ALL_KEY) {
                if (filterDef.currentValue.length > 1) {
                  // Handle multiple key selection as a JSON array
                  const jsonKeys = [];
                  for (let index = 0; index < filterDef.currentValue.length; index++) {
                    jsonKeys.push(filterDef.currentValue[index].key);
                  }
                  filterJson[filterDef.httpId] = JSON.stringify(jsonKeys);
                } else {
                  filterJson[filterDef.httpId] = filterDef.currentValue[0].key;
                }
              }
            }
          // Others
          } else {
            // Set it
            filterJson[filterDef.httpId] = filterDef.currentValue;
          }
        }
      });
    }
    // With Search?
    const searchValue = this.getSearchValue();
    if (withSearch && searchValue) {
      filterJson['Search'] = searchValue;
    }
    // Static filters
    if (this.staticFilters && this.staticFilters.length > 0) {
      // Update
      filterJson = Object.assign(filterJson, ...this.staticFilters);
    }
    return filterJson;
  }

  public getRowDetails(row: T): Observable<String> {
    return of('getRowDetails() not implemented in your data source!');
  }

  public setStaticFilters(staticFilters) {
    // Keep it
    this.staticFilters = staticFilters;
  }

  public getStaticFilters() {
    // Keep it
    return this.staticFilters;
  }

  public onRowActionMenuOpen(action: TableActionDef, row: T) {
  }

  abstract buildTableColumnDefs(): TableColumnDef[];

  public getTableColumnDefs(): TableColumnDef[] {
    if (!this.tableColumnDefs) {
      this.tableColumnDefs = this.buildTableColumnDefs();
    }
    return this.tableColumnDefs;
  }

  public refreshData(showSpinner = true): Observable<any> {
    // Init paging
    const currentPaging = this.getPaging();
    // Reload all loaded records
    this.setPaging({
      skip: 0,
      limit: currentPaging.limit + currentPaging.skip
    });
    // Load data
    return this.loadData(showSpinner, true);
  }

  public loadData(showSpinner = true, forceRefreshRecords = false): Observable<any> {
    return new Observable((observer) => {
      // Show Spinner
      if (showSpinner) {
        this.spinnerService.show();
      }
        // Load data source
      this.loadDataImpl().subscribe((data) => {
        // Hide Spinner
        if (showSpinner) {
          this.spinnerService.hide();
        }
        // Ok
        this.setData(data);
        // Load number of records
        setTimeout(() => {
          // Loading on going?
          if (!this.loadingNumberOfRecords) {
            // No: Check
            if (this.data.length !== this.totalNumberOfRecords &&  // Already have all the records?
               (forceRefreshRecords || // Force refresh records
                this.totalNumberOfRecords === Constants.INFINITE_RECORDS || // Never loaded
                this.data.length + this.getPageSize() >= this.totalNumberOfRecords) // Approaching the end of the max
              ) {
                // Load records
                this.requestNumberOfRecords();
            }
          }
        }, 1);
        // Notify
        observer.next(data);
        observer.complete();
      }, (error) => {
        // Hide Spinner
        if (showSpinner) {
          this.spinnerService.hide();
        }
      });
    });
  }

  abstract loadDataImpl(): Observable<any>;

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

  public getData(): any[] {
    return this.data;
  }

  requestNumberOfRecords() {
    // Reset
    this.resetTotalNumberOfRecords();
    // Set flag
    this.loadingNumberOfRecords = true;
    // Add only record count
    const staticFilters = [
      ...this.getStaticFilters(),
      { 'OnlyRecordCount': true}
    ];
    // Set
    this.setStaticFilters(staticFilters);
    // Load data
    this.loadDataImpl().subscribe(() => {
      // Unset flag
      this.loadingNumberOfRecords = false;
    });
    // Remove OnlyRecordCount
    staticFilters.splice(staticFilters.length - 1, 1)
    // Reset static filter
    this.setStaticFilters(staticFilters);
  }

  private enrichData(freshData: any[]) {
    const isRowSelectionEnabled = this.isRowSelectionEnabled();
    const expandedRowIDs = this.data.filter((row) => row.isExpanded);
    const selectedRowIDs = this.data.filter((row) => row.isSelected).map((row) => row.id);
    for (let i = 0; i < freshData.length; i++) {
      const freshRow = freshData[i];
      // Check for complex property
      for (const tableColumnDef of this.tableColumnDefs) {
        // Check for complex column id with dot
        if (tableColumnDef.id.indexOf('.') !== -1) {
          // Create new var for direct access
          freshRow[tableColumnDef.id] = _.get(freshRow, tableColumnDef.id);
        }
      }
      // Check dynamic row actions
      if (this.tableDef.hasDynamicRowAction) {
        const dynamicRowActions = this.buildTableDynamicRowActions(freshRow);
        if (dynamicRowActions.length > 0) {
          freshRow['dynamicRowActions'] = dynamicRowActions;
        }
      }
      // Check Row Action Authorization
      if (this.hasRowActions) {
        // Check if authorized
        this.tableRowActionsDef.forEach((rowActionDef) => {
          freshRow[`canDisplayRowAction-${rowActionDef.id}`] = this.canDisplayRowAction(rowActionDef, freshRow);
        });
      }
      // Check if row can be selected
      if (isRowSelectionEnabled) {
        freshRow.isSelectable = this.isSelectable(freshRow);
      }
      // Set row ID
      if (!freshRow.id) {
        // Get row ID
        const rowID = this.getTableDef().rowFieldNameIdentifier;
        // Trigger exception
        if (!rowID) {
          throw new Error('Table Def has no row ID defined!');
        }
        // Set the ID
        freshRow.id = freshRow[rowID];
      }
      // Check if Expanded
      const foundExpandedRow = expandedRowIDs.find((expandedRow) => expandedRow.id === freshRow.id);
      if (foundExpandedRow) {
        // Check if the table has a specific field to hide/show details
        if (this.tableDef.rowDetails.showDetailsField) {
          // Check if it's still visible
          if (freshRow.hasOwnProperty(this.tableDef.rowDetails.showDetailsField)) {
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
        if (this.tableDef.rowDetails.detailsField) {
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

  buildTableDynamicRowActions(row: T): TableActionDef[] {
    return [];
  }

  canDisplayRowAction(rowAction: TableActionDef, rowItem: T) {
    return true;
  }

  protected initDataSource(): any {
    // Init data from sub-classes
    this.getTableColumnDefs();
    this.getTableDef();
    this.getTableFiltersDef();
    this.getTableActionsDef();
    this.getTableActionsRightDef();
    this.getTableRowActions();

    // Init vars
    // tslint:disable-next-line:max-line-length
    this.hasActions = (this.tableActionsDef && this.tableActionsDef.length > 0) ||
      (this.tableActionsRightDef && this.tableActionsRightDef.length > 0);
    this.hasFilters = (this.tableFiltersDef && this.tableFiltersDef.length > 0);
    this.isSearchEnabled = this.tableDef && this.tableDef.search && this.tableDef.search.enabled;
    this.isFooterEnabled = this.tableDef && this.tableDef.footer && this.tableDef.footer.enabled;
    this.hasRowActions = (this.tableRowActionsDef && this.tableRowActionsDef.length > 0) ||
      this.tableDef.hasDynamicRowAction;
  }

  isSelectable(row: T) {
    return true;
  }
}
