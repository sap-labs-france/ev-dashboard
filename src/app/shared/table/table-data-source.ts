import {BehaviorSubject, interval, Observable, of, Subject, Subscription} from 'rxjs';
import {ElementRef} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
import {ConfigService} from '../../services/config.service';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {DropdownItem, Ordering, Paging, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {TableResetFiltersAction} from './actions/table-reset-filters-action';
import {Constants} from '../../utils/Constants';
import {Utils} from '../../utils/Utils';
import {LocaleService} from '../../services/locale.service';

import * as _ from 'lodash';
import {takeWhile} from 'rxjs/operators';

export abstract class TableDataSource<T> implements DataSource<T> {
  public rowActionsDef: TableActionDef[];
  public tableDef: TableDef;
  public filtersDef: TableFilterDef[];
  public actionsRightDef: TableActionDef[];
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
  private paginator: MatPaginator;
  private sort: MatSort;
  private numberOfRecords = 0;
  private actionsDef: TableActionDef[];
  private locale;
  private dataChangeSubscription: Subscription;
  private staticFilters = [];
  private pollingInterval = 0;
  private _ongoingAutoRefresh = new BehaviorSubject<boolean>(false);
  private _ongoingManualRefresh = new BehaviorSubject<boolean>(false);
  private _rowRefresh = new Subject<any>();
  private _isDestroyed = false;


  constructor(
      private configService: ConfigService,
      protected localService: LocaleService) {
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

  public getSelectionModel(): SelectionModel<any> {
    console.log('table-data-source - getSelectionModel');
    return new SelectionModel<any>(this.isMultiSelectionEnabled(), []);
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

  public setPaginator(paginator: MatPaginator) {
    console.log('table-data-source - setPaginator');
    this.paginator = paginator;
  }

  public getPaginator(): MatPaginator {
    console.log('table-data-source - getPaginator');
    // Return one of them
    return this.paginator;
  }

  public setSort(sort: MatSort) {
    console.log('table-data-source - setSort');
    this.sort = sort;
  }

  public getSort(): MatSort {
    console.log('table-data-source - getSort');
    return this.sort;
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
    console.log('table-data-source - updatePaginator');
    if (this.paginator) { // Might happen in case destroy occurs before the end of the loadData
      this.paginator.length = this.getNumberOfRecords();
    }
  }

  public getPaginatorPageSizes() {
    console.log('table-data-source - getPaginatorPageSizes');
    return [50, 100, 250, 500];
  }

  public getPaging(): Paging {
    console.log('table-data-source - getPaging');
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
      } else {
        return [
          // { field: 'id', direction: 'asc' }
        ]
      }
    }
  }

  public setNumberOfRecords(numberOfRecords: number) {
    console.log('table-data-source - setNumberOfRecords');
    this.numberOfRecords = numberOfRecords;
  }

  public getNumberOfRecords(): number {
    console.log('table-data-source - getNumberOfRecords');
    return this.numberOfRecords;
  }

  public setData(data: T[]) {
    console.log('table-data-source - setData');
    this.refreshData(data);
    this.dataSubject.next(this.formattedData);
  }

  public getData(): any[] {
    console.log('table-data-source - getData');
    return this.data;
  }

  public getFormattedData(): any[] {
    console.log('table-data-source - getFormattedData');
    return this.formattedData;
  }

  public getTableActionsDef(): TableActionDef[] {
    console.log('table-data-source - getTableActionsDef');
    // Return default
    if (this.filtersDef && this.filtersDef.length > 0) {
      return [
        new TableResetFiltersAction().getActionDef()
      ];
    } else {
      return [];
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    console.log('table-data-source - getTableActionsRightDef');
    // Return default
    return [];
  }

  public getTableRowActions(item?: T): TableActionDef[] {
    console.log('table-data-source - getTableRowActions');
    // Return default
    return [];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    console.log('table-data-source - getTableFiltersDef');
    // Return default
    return [];
  }

  public getTableDef(): TableDef {
    console.log('table-data-source - getTableDef');
    return {rowFieldNameIdentifier: ''};
  }

  public setTableDef(tableDef: TableDef) {
    console.log('table-data-source - setTableDef');
    this.tableDef = tableDef;
  }

  public filterChanged(filter: TableFilterDef) {
    console.log('table-data-source - filterChanged');
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
    console.log('table-data-source - reset');
    this.unregisterToDataChange();
    this.resetFilters();
    this.tableDef = null;
    this.filtersDef = null;
    this.actionsDef = null;
    this.actionsRightDef = null;
    this.rowActionsDef = null;
  }

  public resetFilters() {
    console.log('table-data-source - resetFilters');
    if (this.filtersDef) {
      this.filtersDef.forEach((filterDef: TableFilterDef) => {
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
        if (actionDef.currentValue) {
          // Activate
          this.registerToDataChange();
        } else {
          // Disable
          this.unregisterToDataChange();
        }
        break;
      case 'reset_filters':
        this.setSearchValue('');
        this.resetFilters();
        this.loadData(false);
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

  public subscribeDisplayDetailsColumn(fn): Subscription {
    console.log('table-data-source - subscribeDisplayDetailsColumn');
    if (!this._displayDetailsColumns || this._displayDetailsColumns.isStopped) {
      this._displayDetailsColumns = new BehaviorSubject<boolean>(true);
    }
    return this._displayDetailsColumns.subscribe(fn);
  }

  public registerToDataChange() {
    console.log('table-data-source - registerToDataChange');
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
    console.log('table-data-source - unregisterToDataChange');
    if (this.dataChangeSubscription) {
      this.dataChangeSubscription.unsubscribe();
      this.dataChangeSubscription = null;
    }
  }

  public getFilterValues(withSearch: boolean = true) {
    console.log('table-data-source - getFilterValues');
    let filterJson = {};
    // Parse filters
    if (this.filtersDef) {
      this.filtersDef.forEach((filterDef) => {
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

  abstract getTableColumnDefs(): TableColumnDef[];

  abstract loadData(refreshAction?: boolean);

  refreshData(freshData: any[]) {
    console.log('table-data-source - refreshData');
    const freshFormattedData = [];
    const rowRefreshed = [];
    freshData.forEach((freshRow) => {
      // Init Row Action Authorization
      if (this.hasRowActions) {
        // Check if authorized
        this.rowActionsDef.forEach((rowActionDef) => {
          // Set
          freshRow[`canDisplayRowAction-${rowActionDef.id}`] = this.canDisplayRowAction(rowActionDef, freshRow);
        });
      }
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
    console.log('table-data-source - _formatRow');
    const formattedRow = [];
    this.tableColumnDefs.forEach((columnDef) => {
      formattedRow.push(this._buildCellValue(row, columnDef));
    });
    formattedRow['data'] = row;
    return formattedRow;
  }

  changeLocaleTo(locale: string) {
    console.log('table-data-source - changeLocaleTo');
    if (this.locale !== locale) {
      this.locale = locale;
      this.formattedData = [];
      const toRefresh = this.data;
      this.data = [];
      this.setData(toRefresh);
    }
  }

  canDisplayRowAction(rowAction: TableActionDef, rowItem: T) {
    console.log('table-data-source - canDisplayRowAction');
    return true;
  }

  protected initDataSource(): any {
    console.log('table-data-source - initDataSource');
    this.tableDef = this.getTableDef();
    this.filtersDef = this.getTableFiltersDef();
    this.actionsDef = this.getTableActionsDef();
    this._checkKnownActions(this.actionsDef);
    this.actionsRightDef = this.getTableActionsRightDef();
    this._checkKnownActions(this.actionsRightDef);
    this.rowActionsDef = this.getTableRowActions();
    this._checkKnownActions(this.rowActionsDef);
    this.tableColumnDefs = this.getTableColumnDefs();
    this.selectionModel = this.getSelectionModel();

    // Init vars
    this.hasActions = (this.actionsDef && this.actionsDef.length > 0) || (this.actionsRightDef && this.actionsRightDef.length > 0);
    this.hasFilters = (this.filtersDef && this.filtersDef.length > 0);
    this.isSearchEnabled = this.tableDef && this.tableDef.search && this.tableDef.search.enabled;
    this.isFooterEnabled = this.tableDef && this.tableDef.footer && this.tableDef.footer.enabled;
    this.hasRowActions = this.rowActionsDef && this.rowActionsDef.length > 0;
  }

  private _checkKnownActions(actionsDef: TableActionDef[]): any {
    console.log('table-data-source - _checkKnownActions');
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
    console.log('table-data-source - findPropertyValue');
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
    console.log('table-data-source - _buildCellValue');
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
    console.log('table-data-source - specificRowActions');
    return [];
  }

  isSelectable(row: T) {
    console.log('table-data-source - isSelectable');
    return true;
  }
}
