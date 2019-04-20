import {BehaviorSubject, Observable, of, Subject, Subscription} from 'rxjs';
import {ElementRef} from '@angular/core';
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
  public selectionModel: SelectionModel<any>;
  public data: any[] = [];

  public hasActions: boolean;
  public hasFilters: boolean;
  public isSearchEnabled: boolean;
  public isFooterEnabled: boolean;
  public hasRowActions: boolean;

  protected formattedData = [];
  protected _displayDetailsColumns = new BehaviorSubject<boolean>(true);

  private dataSubject = new BehaviorSubject<any[]>([]);
  private searchInput: ElementRef;
  private numberOfRecords = 0;
  private tableActionsDef: TableActionDef[];
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

  private getSelectionModel(): SelectionModel<any> {
    console.log('table-data-source - getSelectionModel');
    if (!this.selectionModel) {
      this.selectionModel = new SelectionModel<any>(this.isMultiSelectionEnabled(), []);
    }
    return this.selectionModel;
  }

  public getSelectedRows(): T[] {
    console.log('table-data-source - getSelectedRows');
    return this.getSelectionModel().selected.map(element => element['data']);
  }

  public hasSelectedRows(): boolean {
    console.log('table-data-source - hasSelectedRows');
    return this.getSelectionModel().hasValue();
  }

  public clearSelectedRows() {
    console.log('table-data-source - clearSelectedRows');
    return this.getSelectionModel().clear();
  }

  public getDataSubjet(): BehaviorSubject<T[]> {
    console.log('table-data-source - getDataSubjet');
    return this.dataSubject;
  }

  public setSearchInput(searchInput: ElementRef) {
    console.log('table-data-source - setSearchInput');
    this.searchInput = searchInput;
  }

  public setSearchValue(searchValue: String) {
    console.log('table-data-source - setSearchValue');
    this.searchInput.nativeElement.value = searchValue;
  }

  public getSearchValue(): string {
    console.log('table-data-source - getSearchValue');
    // Check
    if (this.searchInput) {
      return this.searchInput.nativeElement.value;
    }
    return '';
  }

  public buildPaging(): Paging {
    console.log('table-data-source - getPaging');
    return {
      skip: 0,
      limit: 100
    }
    // if (this.getPaginator()) {
    //   return {
    //     skip: this.getPaginator().pageIndex * this.getPaginator().pageSize,
    //     limit: this.getPaginator().pageSize
    //   };
    // } else {
    //   return {
    //     skip: 0,
    //     limit: this.getPaginatorPageSizes()[0]
    //   };
    // }
  }

  public buildOrdering(): Ordering[] {
    console.log('table-data-source - getOrdering');
    return [];
    // if (this.getSort()) {
    //   return [
    //     {field: this.getSort().active, direction: this.getSort().direction}
    //   ]
    // } else {
    //   // Find Sorted columns
    //   const columnDef = this.tableColumnDefs.find((column) => column.sorted === true);
    //   // Found?
    //   if (columnDef) {
    //     // Yes: Set Sorting
    //     return [
    //       {field: columnDef.id, direction: columnDef.direction}
    //     ]
    //   }
    // }
  }

  public setNumberOfRecords(numberOfRecords: number) {
    console.log('table-data-source - setNumberOfRecords');
    this.numberOfRecords = numberOfRecords;
  }

  public getNumberOfRecords(): number {
    console.log('table-data-source - getNumberOfRecords');
    return this.numberOfRecords;
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
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
        filterDef.reset();
      });
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    console.log('table-data-source - actionTriggered');
    // Check common actions
    switch (actionDef.id) {
      case 'refresh':
        this.clearSelectedRows();
        this._manualRefreshReload();
        break;
      // Auto Refresh
      case 'auto-refresh':
        // Check Change Listener
        break;
      case 'reset_filters':
        this.setSearchValue('');
        this.resetFilters();
        this.loadDataAndFormat(false).subscribe();
        break;
    }
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

  refreshReload() {
    console.log('table-data-source - refreshReload');
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
    this.loadDataAndFormat(true).subscribe();
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
    console.log('table-data-source - _manualRefreshReload');
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
    this.loadDataAndFormat(true).subscribe();
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

  public buildFilterValues(withSearch: boolean = true) {
    console.log('table-data-source - getFilterValues');
    let filterJson = {};
    // Parse filters
    if (this.tableFiltersDef) {
      this.tableFiltersDef.forEach((filterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
          if (filterDef.type === 'date') {
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

  public loadDataAndFormat(refreshAction: boolean): Observable<any> {
    console.log('table-data-source - loadDataAndFormat');
    return new Observable((observer) => {
      // Load data source
      this.loadData(false).subscribe((data) => {
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
    // Set it
    this.data.length = 0;
    this.data.push(...freshData);
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
  specificRowActions(row: T): TableActionDef[] {
    console.log('table-data-source - specificRowActions');
    return [];
  }

  setLocale(locale: string) {
    console.log('table-data-source - setLocale');
    this.locale = locale;
  }

  canDisplayRowAction(rowAction: TableActionDef, rowItem: T) {
    console.log('table-data-source - canDisplayRowAction');
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
    this.getSelectionModel();

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
