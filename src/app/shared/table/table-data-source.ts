import {BehaviorSubject, interval, Observable, of, Subject, Subscription} from 'rxjs';
import {ElementRef} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {DropdownItem, Ordering, Paging, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {TableResetFiltersAction} from './actions/table-reset-filters-action';
import {Constants} from '../../utils/Constants';
import {Utils} from '../../utils/Utils';

import * as _ from 'lodash';
import {takeWhile} from 'rxjs/operators';

export abstract class TableDataSource<T> implements DataSource<T> {
  public rowActionsDef: TableActionDef[];
  private dataSubject = new BehaviorSubject<any[]>([]);
  private searchInput: ElementRef;
  private paginator: MatPaginator;
  private sort: MatSort;
  private numberOfRecords = 0;
  private tableDef: TableDef;
  private tableColumnDef: TableColumnDef[];
  private actionsDef: TableActionDef[];
  private actionsRightDef: TableActionDef[];
  private actionsFiltersDef: TableActionDef[];
  private filtersDef: TableFilterDef[];
  private selectionModel: SelectionModel<any>;
  private data: any[] = [];
  protected formattedData = [];
  private locale;
  private dataChangeSubscription: Subscription;
  // private _refreshInterval;
  private staticFilters = [];
  private pollingInterval = 0;
  private _ongoingAutoRefresh = new BehaviorSubject<boolean>(false);
  private _ongoingManualRefresh = new BehaviorSubject<boolean>(false);
  private _rowRefresh = new Subject<any>();
  protected _displayDetailsColumns = new BehaviorSubject<boolean>(true);
  private _isDestroyed = false;

  public setPollingInterval(pollingInterval: number) {
    this.pollingInterval = pollingInterval;
  }

  public isEmpty(): boolean {
    // Empty?
    return this.data.length === 0;
  }

  public hasActions(): boolean {
    this._checkInitialized();
    return (this.actionsDef && this.actionsDef.length > 0) || (this.actionsRightDef && this.actionsRightDef.length > 0);
  }

  public hasRowActions(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.rowActionsDef && this.rowActionsDef.length > 0;
  }

  public hasFilters(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.filtersDef && this.filtersDef.length > 0;
  }

  public isRowSelectionEnabled(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.enabled;
  }

  public isRowDetailsEnabled(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.enabled;
  }

  public hasRowDetailsHideShowField(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.hasOwnProperty('hideShowField');
  }

  public isMultiSelectionEnabled(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.multiple;
  }

  public isFooterEnabled(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.tableDef && this.tableDef.footer && this.tableDef.footer.enabled;
  }

  public isSearchEnabled(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.tableDef && this.tableDef.search && this.tableDef.search.enabled;
  }

  public isDesignFlat(): boolean {
    // Check
    this._checkInitialized();
    // Return
    return this.tableDef && this.tableDef.design && this.tableDef.design.flat;
  }

  public getSelectionModel(): SelectionModel<any> {
    if (!this.selectionModel) {
      this.selectionModel = new SelectionModel<any>(
        this.isMultiSelectionEnabled(), []);
    }
    return this.selectionModel;
  }

  public getSelectedRows(): T[] {
    return this.getSelectionModel().selected.map(element => element['data']);
  }

  public hasSelectedRows(): boolean {
    return this.getSelectionModel().hasValue();
  }

  public clearSelectedRows() {
    return this.getSelectionModel().clear();
  }

  public getDataSubjet(): BehaviorSubject<T[]> {
    return this.dataSubject;
  }

  public setPaginator(paginator: MatPaginator) {
    this.paginator = paginator;
  }

  public getPaginator(): MatPaginator {
    // Return one of them
    return this.paginator;
  }

  public setSort(sort: MatSort) {
    this.sort = sort;
  }

  public getSort(): MatSort {
    return this.sort;
  }

  public setSearchInput(searchInput: ElementRef) {
    this.searchInput = searchInput;
  }

  public getSearchValue(): string {
    // Check
    if (this.searchInput) {
      return this.searchInput.nativeElement.value;
    }
    return '';
  }

  public connect(collectionViewer: CollectionViewer): Observable<T[]> {
    this._isDestroyed = false;
    if (!this.dataSubject || this.dataSubject.isStopped || this.dataSubject.closed) {
      this.dataSubject = new BehaviorSubject<any[]>([]);
    }
    return this.dataSubject.asObservable();
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this._isDestroyed = true;
    if (this._displayDetailsColumns) {
      this._displayDetailsColumns.complete();
      this._displayDetailsColumns = null;
    }
    if (this._rowRefresh) {
      this._rowRefresh.complete();
      this._rowRefresh = null;
    }
    if (this._ongoingAutoRefresh) {
      this._ongoingAutoRefresh.complete();
      this._ongoingAutoRefresh = null;
    }
    if (this._ongoingManualRefresh) {
      this._ongoingManualRefresh.complete();
      this._ongoingManualRefresh = null;
    }
    this.unregisterToDataChange();
    this.paginator = null;
    this.sort = null;

    this.dataSubject.complete();
  }

  public updatePaginator() {
    if (this.paginator) { // Might happen in case destroy occurs before the end of the loadData
      this.paginator.length = this.getNumberOfRecords();
    }
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500];
  }

  public getPaging(): Paging {
    if (this.getPaginator()) {
      return {
        skip: this.getPaginator().pageIndex * this.getPaginator().pageSize,
        limit: this.getPaginator().pageSize
      };
    } else {
      return {
        skip: 0,
        limit: this.getPaginatorPageSizes()[0]
      };
    }
  }

  public getOrdering(): Ordering[] {
    if (this.getSort()) {
      return [
        {field: this.getSort().active, direction: this.getSort().direction}
      ]
    } else {
      // Find Sorted columns
      const columnDef = this.tableColumnDef.find((column) => column.sorted === true);
      // Found?
      if (columnDef) {
        // Yes: Set Sorting
        return [
          {field: columnDef.id, direction: columnDef.direction}
        ]
      } else {
        return [
          // { field: 'id', direction: 'asc' }
        ]
      }
    }
  }

  public setNumberOfRecords(numberOfRecords: number) {
    this.numberOfRecords = numberOfRecords;
  }

  public getNumberOfRecords(): number {
    return this.numberOfRecords;
  }

  public setData(data: T[]) {
    this.refreshData(data);
    this.dataSubject.next(this.formattedData);
  }

  public getData(): any[] {
    return this.data;
  }

  public getFormattedData(): any[] {
    return this.formattedData;
  }

  public getTableActionsDef(): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableActionsFiltersDef(): TableActionDef[] {
    // Return default
    // If there is a filter then the reset filter action is present
    if (this.hasFilters) {
      return [
        new TableResetFiltersAction().getActionDef()
      ];
    } else {
      return [];
    }
  }

  public getTableRowActions(item?: T): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    // Return default
    return [];
  }

  public getTableDef(): TableDef {
    return {rowFieldNameIdentifier: ''};
  }

  public setTableDef(tableDef: TableDef) {
    this.tableDef = tableDef;
  }

  public filterChanged(filter: TableFilterDef) {
    // Update Filter
    const foundFilter = this.filtersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });
    // Update value
    foundFilter.currentValue = filter.currentValue;
    // Reload data
    this.loadData(false);
  }

  public reset() {
    this.unregisterToDataChange();
    this.resetFilters();
    this.tableDef = null;
    this.filtersDef = null;
    this.actionsDef = null;
    this.actionsRightDef = null;
    this.rowActionsDef = null;
  }

  public resetFilters() {
    if (this.filtersDef) {
      this.filtersDef.forEach((filterDef: TableFilterDef) => {
        filterDef.reset();
      });
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Check common actions
    switch (actionDef.id) {
      case 'refresh':
        this.clearSelectedRows();
        this._manualRefreshReload();
        break;
      // Auto Refresh
      case 'auto-refresh':
        // Check Change Listener
        if (actionDef.currentValue) {
          // Activate
          this.registerToDataChange();
        } else {
          // Disable
          this.unregisterToDataChange();
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    // Return
    throw new Error('You must implement the method TableDataSource.getDataChangeSubject() to enable the auto-refresh feature');
  }

  public subscribeAutoRefresh(fn): Subscription {
    if (!this._ongoingAutoRefresh || this._ongoingAutoRefresh.isStopped) {
      // restart observable
      this._ongoingAutoRefresh = new BehaviorSubject(false);
    }
    return this._ongoingAutoRefresh.subscribe(fn);
  }

  public subscribeManualRefresh(fn): Subscription {
    if (!this._ongoingManualRefresh || this._ongoingManualRefresh.isStopped) {
      // restart observable
      this._ongoingManualRefresh = new BehaviorSubject(false);
    }
    return this._ongoingManualRefresh.subscribe(fn);
  }

  public subscribeRowRefresh(fn): Subscription {
    if (!this._rowRefresh || this._rowRefresh.isStopped) {
      // restart observable
      this._rowRefresh = new Subject();
    }
    return this._rowRefresh.subscribe(fn);
  }

  public subscribeDisplayDetailsColumn(fn): Subscription {
    if (!this._displayDetailsColumns || this._displayDetailsColumns.isStopped) {
      this._displayDetailsColumns = new BehaviorSubject<boolean>(true);
    }
    return this._displayDetailsColumns.subscribe(fn);
  }

  public registerToDataChange() {
    if (!this._isDestroyed && !this.dataChangeSubscription) {
      if (this.pollingInterval > 1000) {
        this.dataChangeSubscription = interval(this.pollingInterval).pipe(takeWhile(() => !this._isDestroyed)).subscribe((occurrence) => {
          if (this._isDestroyed) {
            this.dataChangeSubscription.unsubscribe();
          } else {
            this.refreshReload();
          }
        });
      } else {
        this.dataChangeSubscription = this.getDataChangeSubject().subscribe(() => {
          this._ongoingAutoRefresh.next(true);
          this.loadData(true);
          this._ongoingAutoRefresh.next(false);
        });
      }
    }
  }

  refreshReload() {
    let refreshStatus;
    if (this._ongoingManualRefresh) {
      this._ongoingManualRefresh.subscribe(value => refreshStatus = value).unsubscribe();
    }
    this._ongoingAutoRefresh.subscribe(value => refreshStatus = refreshStatus || value).unsubscribe();
    if (refreshStatus) {
      return;
    }
    this._ongoingAutoRefresh.next(true);
    const startDate = new Date().getTime();
    this.loadData(true);
    const endDate = new Date().getTime();
    // display the spinner at min 1s
    if (endDate - startDate > 1000) {
      this._ongoingAutoRefresh.next(false);
    } else {
      setTimeout(() => {
        if (this._ongoingAutoRefresh) { // check if component si not destroyed in the meantime
          this._ongoingAutoRefresh.next(false);
        }
      }, 1000 - (endDate - startDate));
    }
  }

  private _manualRefreshReload() {
    // check if there is not already an ongoing refresh
    let refreshStatus;
    this._ongoingManualRefresh.subscribe(value => refreshStatus = value).unsubscribe();
    if (this._ongoingAutoRefresh) {
      this._ongoingAutoRefresh.subscribe(value => refreshStatus = refreshStatus || value).unsubscribe();
    }
    if (refreshStatus) {
      return;
    }
    // Start manual refresh
    this._ongoingManualRefresh.next(true);
    const startDate = new Date().getTime();
    this.loadData(true);
    const endDate = new Date().getTime();
    // display the spinner for min 1s
    if (endDate - startDate > 1000) {
      this._ongoingManualRefresh.next(false);
    } else {
      setTimeout(() => {
        if (this._ongoingManualRefresh) {
          this._ongoingManualRefresh.next(false);
        }
      }, 1000 - (endDate - startDate));
    }
  }


  public unregisterToDataChange() {
    if (this.dataChangeSubscription) {
      this.dataChangeSubscription.unsubscribe();
      this.dataChangeSubscription = null;
    }
  }

  public getFilterValues(withSearch: boolean = true) {
    let filterJson = {};
    // Parse filters
    if (this.filtersDef) {
      this.filtersDef.forEach((filterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
          if (filterDef.currentValue instanceof Date) {
            // Set it
            filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
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
    // Should be implemented in implementation
  }

  public getTableColumnDefs(): TableColumnDef[] {
    if (!this.tableColumnDef) {
      this.tableColumnDef = this.buildTableColumnDefs();
    }
    return this.tableColumnDef;
  }

  abstract buildTableColumnDefs(): TableColumnDef[];

  abstract loadData(refreshAction?: boolean);

  refreshData(freshData: any[]) {
    const freshFormattedData = [];
    const rowRefreshed = [];
    freshData.forEach((freshRow) => {
      const rowIdentifier = (this.getTableDef().rowFieldNameIdentifier ? this.getTableDef().rowFieldNameIdentifier : 'id');
      const index = this.data.findIndex(row => row[rowIdentifier] === freshRow[rowIdentifier]);
      if (index !== -1) {
        if (_.isEqual(this.data[index], freshRow)) {
          freshFormattedData.push(this.formattedData[index]);
        } else {
          const formattedRow = this._formatRow(freshRow);
          if ((this._ongoingAutoRefresh && this._ongoingAutoRefresh.getValue()) ||
            (this._ongoingManualRefresh && this._ongoingManualRefresh.getValue())) {
            // Check if row is expanded
            if (this.formattedData[index]['data'].hasOwnProperty('isExpanded')) {
              formattedRow['data'].isExpanded = this.formattedData[index]['data'].isExpanded;
            }
          }
          // Update specific row actions
          const specificRowActions = this.specificRowActions(formattedRow['data']);
          if (specificRowActions.length > 0) {
            formattedRow['specificRowActions'] = specificRowActions;
          }
          freshFormattedData.push(formattedRow);
          rowRefreshed.push({
            newValue: formattedRow, previousValue: this.formattedData[index]['data'],
            isAutoRefresh: ((this._ongoingAutoRefresh && this._ongoingAutoRefresh.getValue()) ||
              (this._ongoingManualRefresh && this._ongoingManualRefresh.getValue()))
          });
        }
      } else {
        const formattedRow = this._formatRow(freshRow);
        // Update specific row actions
        const specificRowActions = this.specificRowActions(formattedRow['data']);
        if (specificRowActions.length > 0) {
          formattedRow['specificRowActions'] = specificRowActions;
        }
        freshFormattedData.push(formattedRow);
      }
    });
    this.formattedData = freshFormattedData;
    this.data = freshData;
    if (this._rowRefresh) {
      rowRefreshed.forEach((row) => {
        this._rowRefresh.next(row);
      })
    }
  }

  _formatRow(row): any[] {
    const formattedRow = [];
    console.log('format row');
    this.tableColumnDef.forEach((columnDef) => {
      formattedRow.push(this._buildCellValue(row, columnDef));
    });
    formattedRow['data'] = row;
    return formattedRow;
  }

  changeLocaleTo(locale: string) {
    if (this.locale !== locale) {
      this.locale = locale;
      this.formattedData = [];
      const toRefresh = this.data;
      this.data = [];
      this.setData(toRefresh);
    }
  }

  canDisplayRowAction(rowAction: TableActionDef, rowItem: T) {
    return true;
  }

  private _checkInitialized(): any {
    // Check
    if (!this.tableDef) {
      this.tableDef = this.getTableDef();
    }
    if (!this.filtersDef) {
      this.filtersDef = this.getTableFiltersDef();
    }
    if (!this.actionsDef) {
      this.actionsDef = this.getTableActionsDef();
      // Check known actions
      this._checkKnownActions(this.actionsDef);
    }
    if (!this.actionsRightDef) {
      // Get
      this.actionsRightDef = this.getTableActionsRightDef();
      // Check known actions
      this._checkKnownActions(this.actionsRightDef);
    }
    if (!this.rowActionsDef) {
      this.rowActionsDef = this.getTableRowActions();
      // Check known actions
      this._checkKnownActions(this.rowActionsDef);
    }
    if (!this.tableColumnDef) {
      this.tableColumnDef = this.buildTableColumnDefs();
    }
  }

  private _checkKnownActions(actionsDef: TableActionDef[]): any {
    // Check
    if (actionsDef) {
      // Check
      actionsDef.forEach((actionDef) => {
        // Check known actions
        switch (actionDef.id) {
          // Auto Refresh
          case 'auto-refresh':
            // Check Change Listener
            if (actionDef.currentValue) {
              // Activate
              this.registerToDataChange();
            } else {
              // Disable
              this.unregisterToDataChange();
            }
            break;
        }
      });
    }
  }

  private findPropertyValue(columnDef, propertyName, source) {
    let propertyValue = null;
    propertyValue = source[propertyName];
    if (propertyName.indexOf('.') > 0) {
      propertyValue = source;
      propertyName.split('.').forEach((key) => {
          if (propertyValue.hasOwnProperty(key)) {
            propertyValue = propertyValue[key];
          } else if (columnDef.defaultValue) {
            propertyValue = columnDef.defaultValue;
          } else {
            switch (columnDef.type) {
              case 'number':
              case 'float':
                propertyValue = 0;
                break;
              default:
                propertyValue = '';
                break;
            }
          }
        }
      );
    }
    return propertyValue;
  }

  private _buildCellValue(row: any, columnDef: TableColumnDef) {
    let propertyValue = this.findPropertyValue(columnDef, columnDef.id, row);
    // Type?
    switch (columnDef.type) {
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

    if (columnDef.formatter) {
      propertyValue = columnDef.formatter(propertyValue, row);
    }
    // Return the property
    return `${propertyValue ? propertyValue : ''}`;
  }

  /**
   * Used to retrieve individual line actions instead of general action table
   *
   * @param {*} row
   * @memberof TableDataSource
   */
  specificRowActions(row: T): TableActionDef[] {
    return [];
  }


  isSelectable(row: T) {
    return true;
  }
}
