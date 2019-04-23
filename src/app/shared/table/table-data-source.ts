import {BehaviorSubject, Observable, of, Subject, Subscription} from 'rxjs';
import {ElementRef} from '@angular/core';
import {MatSort} from '@angular/material';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {DropdownItem, Ordering, Paging, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {TableResetFiltersAction} from './actions/table-reset-filters-action';
import {Constants} from '../../utils/Constants';
import {Utils} from '../../utils/Utils';
import * as _ from 'lodash';

export abstract class TableDataSource<T> implements DataSource<T> {
  public tableRowActionsDef: TableActionDef[];
  public tableDef: TableDef;
  public tableFiltersDef: TableFilterDef[];
  public tableActionsRightDef: TableActionDef[];
  public tableColumnDefs: TableColumnDef[];
  public specificRowActions: TableActionDef[];
  public data: any[] = [];
  public paging: Paging;

  public hasActions: boolean;
  public hasFilters: boolean;
  public isSearchEnabled: boolean;
  public isFooterEnabled: boolean;
  public hasRowActions: boolean;
  public selectedRows = 0;
  public maxSelectableRows = 0;
  public lastSelectedRow;

  protected formattedData = [];
  protected _displayDetailsColumns = new BehaviorSubject<boolean>(true);

  private dataSubject = new BehaviorSubject<any[]>([]);
  private searchValue = '';
  private totalNumberOfRecords = 0;
  private tableActionsDef: TableActionDef[];
  public sort: MatSort = new MatSort();
  private locale;
  private dataChangeSubscription: Subscription;
  private staticFilters = [];
  private pollingInterval = 0;
  private _ongoingAutoRefresh = new BehaviorSubject<boolean>(false);
  private _ongoingManualRefresh = new BehaviorSubject<boolean>(false);
  private _rowRefresh = new Subject<any>();
  private _isDestroyed = false;

  public connect(collectionViewer: CollectionViewer): Observable<T[]> {
    console.log('table-data-source - connect');
    this._isDestroyed = false;
    if (!this.dataSubject || this.dataSubject.isStopped || this.dataSubject.closed) {
      this.dataSubject = new BehaviorSubject<any[]>([]);
    }
    return this.dataSubject.asObservable();
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    console.log('table-data-source - disconnect');
    this._isDestroyed = true;

    this.dataSubject.complete();
  }

  public setPollingInterval(pollingInterval: number) {
    console.log('table-data-source - setPollingInterval');
    this.pollingInterval = pollingInterval;
  }

  public isRowSelectionEnabled(): boolean {
    console.log('table-data-source - isRowSelectionEnabled');
    // Return
    return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.enabled;
  }

  public isRowDetailsEnabled(): boolean {
    console.log('table-data-source - isRowDetailsEnabled');
    // Return
    return this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.enabled;
  }

  public hasRowDetailsHideShowField(): boolean {
    console.log('table-data-source - hasRowDetailsHideShowField');
    // Return
    return this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.hasOwnProperty('hideShowField');
  }

  public isMultiSelectionEnabled(): boolean {
    console.log('table-data-source - isMultiSelectionEnabled');
    // Return
    return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.multiple;
  }

  public isDesignFlat(): boolean {
    console.log('table-data-source - isDesignFlat');
    // Return
    return this.tableDef && this.tableDef.design && this.tableDef.design.flat;
  }

  public getSelectedRows(): T[] {
    console.log('table-data-source - getSelectedRows');
    return this.data.filter((row) => row.selected);
  }

  public hasSelectedRows(): boolean {
    console.log('table-data-source - hasSelectedRows');
    return (this.selectedRows > 0)
  }

  public clearSelectedRows() {
    console.log('table-data-source - clearSelectedRows');
    // Clear
    this.selectedRows = 0;
    this.data.forEach((row) => {
      if (row.isSelectable) {
        row.selected = false;
      }
    })
  }

  public selectAllRows() {
    console.log('table-data-source - selectAllRows');
    // Select All
    this.selectedRows = 0;
    this.data.forEach((row) => {
      // Check
      if (row.isSelectable) {
        row.selected = true;
        this.selectedRows++;
      }
    })
  }

  public toggleMasterSelect() {
    console.log('table-data-source - masterSelectToggle');
    if (this.isAllSelected()) {
      // Unselect All
      this.clearSelectedRows();
    } else {
      // Select All
      this.selectAllRows();
    }
  }
public toggleRowSelection(row) {
    console.log(`Before ${row.selected} - ${this.selectedRows} - ${this.maxSelectableRows}`);
    // Invert
    row.selected = !row.selected;
    // Adjust number of selected rows
    if (row.selected) {
      this.selectedRows++
      // Single Select?
      if (!this.tableDef.rowSelection.multiple && this.lastSelectedRow) {
        // Unselect last row
        this.lastSelectedRow.selected = false;
      }
      this.lastSelectedRow = row;
    } else {
      this.selectedRows--
      this.lastSelectedRow = null;
    }
    console.log(`After ${row.selected} - ${this.selectedRows}`);
  }

  public isAllSelected() {
    console.log('table-data-source - isAllSelected');
    return (this.selectedRows === this.maxSelectableRows);
  }

  public getDataSubjet(): BehaviorSubject<T[]> {
    console.log('table-data-source - getDataSubjet');
    return this.dataSubject;
  }

  public setSearchValue(searchValue: string) {
    console.log('table-data-source - setSearchValue');
    this.searchValue = searchValue;
  }

  public getSearchValue(): string {
    console.log('table-data-source - getSearchValue');
    return this.searchValue;
  }

  public getPageSize(): number {
    return 100;
  }

  public setPaging(paging: Paging) {
    this.paging = paging;
  }

  public getPaging(): Paging {
    console.log('table-data-source - getPaging');
    if (!this.paging) {
      this.paging = {
        skip: 0,
        limit: this.getPageSize()
      }
    }
    return this.paging;
  }

  public setSort(sort: MatSort) {
    console.log('table-data-source - setSort');
    this.sort = sort;
  }

  public getSort(): MatSort {
    console.log('table-data-source - getSort');
    return this.sort;
  }

  public getSorting(): Ordering[] {
    console.log('table-data-source - getOrdering');
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
    console.log('table-data-source - setNumberOfRecords');
    if (this.totalNumberOfRecords < totalNumberOfRecords) {
      this.totalNumberOfRecords = totalNumberOfRecords;
    }
  }

  public getTotalNumberOfRecords(): number {
    console.log('table-data-source - getNumberOfRecords');
    return this.totalNumberOfRecords;
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
    console.log('table-data-source - getTableActionsDef');
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
    console.log('table-data-source - getTableActionsRightDef');
    if (!this.tableActionsRightDef) {
      this.tableActionsRightDef = this.buildTableActionsRightDef();
    }
    return this.tableActionsRightDef;
  }

  public buildTableRowActions(item?: T): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableRowActions(item?: T): TableActionDef[] {
    console.log('table-data-source - getTableRowActions');
    if (!this.tableRowActionsDef) {
      this.tableRowActionsDef = this.buildTableRowActions();
    }
    return this.tableRowActionsDef;
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    console.log('table-data-source - getTableFiltersDef');
    if (!this.tableFiltersDef) {
      this.tableFiltersDef = this.buildTableFiltersDef();
    }
    return this.tableFiltersDef;
  }

  abstract buildTableDef(): TableDef;

  public getTableDef(): TableDef {
    console.log('table-data-source - getTableDef');
    if (!this.tableDef) {
      this.tableDef = this.buildTableDef();
    }
    return this.tableDef;
  }

  public setTableDef(tableDef: TableDef) {
    console.log('table-data-source - setTableDef');
    this.tableDef = tableDef;
  }

  public filterChanged(filter: TableFilterDef) {
    console.log('table-data-source - filterChanged');
    // Update Filter
    const foundFilter = this.tableFiltersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });
    // Update value
    foundFilter.currentValue = filter.currentValue;
  }

  public resetFilters() {
    console.log('table-data-source - resetFilters');
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
    console.log('table-data-source - actionTriggered');
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    console.log('table-data-source - rowActionTriggered');
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    console.log('table-data-source - getDataChangeSubject');
    // Return
    throw new Error('You must implement the method TableDataSource.getDataChangeSubject() to enable the auto-refresh feature');
  }

  public subscribeAutoRefresh(fn): Subscription {
    console.log('table-data-source - subscribeAutoRefresh');
    if (!this._ongoingAutoRefresh || this._ongoingAutoRefresh.isStopped) {
      // restart observable
      this._ongoingAutoRefresh = new BehaviorSubject(false);
    }
    return this._ongoingAutoRefresh.subscribe(fn);
  }

  public subscribeManualRefresh(fn): Subscription {
    console.log('table-data-source - subscribeManualRefresh');
    if (!this._ongoingManualRefresh || this._ongoingManualRefresh.isStopped) {
      // restart observable
      this._ongoingManualRefresh = new BehaviorSubject(false);
    }
    return this._ongoingManualRefresh.subscribe(fn);
  }

  public subscribeRowRefresh(fn): Subscription {
    console.log('table-data-source - subscribeRowRefresh');
    if (!this._rowRefresh || this._rowRefresh.isStopped) {
      // restart observable
      this._rowRefresh = new Subject();
    }
    return this._rowRefresh.subscribe(fn);
  }

  public buildFilterValues(withSearch: boolean = true) {
    console.log('table-data-source - getFilterValues');
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
    console.log('table-data-source - getRowDetails');
    return of('getRowDetails() not implemented in your data source!');
  }

  public setStaticFilters(staticFilters) {
    console.log('table-data-source - setStaticFilters');
    // Keep it
    this.staticFilters = staticFilters;
  }

  public getStaticFilters() {
    console.log('table-data-source - getStaticFilters');
    // Keep it
    return this.staticFilters;
  }

  public onRowActionMenuOpen(action: TableActionDef, row: T) {
    console.log('table-data-source - onRowActionMenuOpen');
    // Should be implemented in implementation
  }

  abstract buildTableColumnDefs(): TableColumnDef[];

  public getTableColumnDefs(): TableColumnDef[] {
    console.log('table-data-source - getTableColumnDefs');
    if (!this.tableColumnDefs) {
      this.tableColumnDefs = this.buildTableColumnDefs();
    }
    return this.tableColumnDefs;
  }

  public loadDataAndFormat(refreshAction: boolean = false): Observable<any> {
    console.log('table-data-source - loadDataAndFormat');
    return new Observable((observer) => {
      // Load data source
      this.loadData(refreshAction).subscribe((data) => {
        // Ok
        this.setData(data);
        // Notify
        observer.next(data);
        observer.complete();
      }, (error) => {
        // handle errors
      });
    });
  }

  abstract loadData(refreshAction): Observable<any>;

  private setData(data: T[]) {
    console.log('table-data-source - setData');
    // Format the data
    this._formatData(data);
    // Check Paging
    if (this.paging.skip === 0) {
      // Clear array
      this.data.length = 0;
    }
    // Add them
    this.data.push(...data);
  }

  public getData(): any[] {
    console.log('table-data-source - getData');
    return this.data;
  }

  _formatData(freshData: any[]) {
    const isRowSelectionEnabled = this.isRowSelectionEnabled()
    console.log('table-data-source - formatData - ' + (freshData ? freshData.length : 'null'));
    for (let i = 0; i < freshData.length; i++) {
      const freshRow = freshData[i];
      // Check for complex property
      for (const tableColumnDef of this.tableColumnDefs) {
        // Check
        if (tableColumnDef.id.indexOf('.') !== -1) {
          // Create new var for direct access
          freshRow[tableColumnDef.id] = _.get(freshRow, tableColumnDef.id);
        }
      }
      // Check dynamic row actions
      const dynamicRowActions = this.buildTableDynamicRowActions(freshRow);
      if (dynamicRowActions.length > 0) {
        freshRow['dynamicRowActions'] = dynamicRowActions;
      }
      // Check Row Action Authorization
      if (this.hasRowActions) {
        // Check if authorized
        this.tableRowActionsDef.forEach((rowActionDef) => {
          // Set if authorized
          freshRow[`canDisplayRowAction-${rowActionDef.id}`] = this.canDisplayRowAction(rowActionDef, freshRow);
        });
      }
      // Check if Row can be selected
      if (isRowSelectionEnabled) {
        // Check
        freshRow.isSelectable = this.isSelectable(freshRow);
        if (freshRow.isSelectable) {
          this.maxSelectableRows++;
        }
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
      // Format the row
      this._formatRow(freshRow);
    }
  }

  _formatRow(row) {
    // For each columns
    for (let i = 0; i < this.tableColumnDefs.length; i++) {
      // Get
      const tableColumnDef = this.tableColumnDefs[i];
      // Formatter provided?
      if (!tableColumnDef.formatter) {
        // No need to format
        continue;
      }
      // Value provided?
      let propertyValue = row[tableColumnDef.id];
      if (!propertyValue) {
        continue;
      }
      // Convert to primitive/object first
      switch (tableColumnDef.type) {
        // Date
        case 'date':
          propertyValue = Utils.convertToDate(propertyValue);
          break;
        // Integer
        case 'integer':
          propertyValue = Utils.convertToInteger(propertyValue);
          break;
        // Float
        case 'float':
          propertyValue = Utils.convertToFloat(propertyValue);
          break;
      }
      // Format + Override
      row[tableColumnDef.id] = tableColumnDef.formatter(propertyValue, row);
    }
  }

  /**
   * Used to retrieve individual line actions instead of general action table
   */
  buildTableDynamicRowActions(row: T): TableActionDef[] {
    console.log('table-data-source - buildTableDynamicRowActions');
    return [];
  }

  setLocale(locale: string) {
    console.log('table-data-source - setLocale');
    this.locale = locale;
  }

  canDisplayRowAction(rowAction: TableActionDef, rowItem: T) {
    return true;
  }

  protected initDataSource(): any {
    console.log('table-data-source - initDataSource');
    // Init data from sub-classes
    this.getTableColumnDefs();
    this.getTableDef();
    this.getTableFiltersDef();
    this.getTableActionsDef();
    this.getTableActionsRightDef();
    this.getTableRowActions();

    // Init vars
    // tslint:disable-next-line:max-line-length
    this.hasActions = (this.tableActionsDef && this.tableActionsDef.length > 0) || (this.tableActionsRightDef && this.tableActionsRightDef.length > 0);
    this.hasFilters = (this.tableFiltersDef && this.tableFiltersDef.length > 0);
    this.isSearchEnabled = this.tableDef && this.tableDef.search && this.tableDef.search.enabled;
    this.isFooterEnabled = this.tableDef && this.tableDef.footer && this.tableDef.footer.enabled;
    this.hasRowActions = this.tableRowActionsDef && this.tableRowActionsDef.length > 0;
  }

  isSelectable(row: T) {
    console.log('table-data-source - isSelectable');
    return true;
  }
}
