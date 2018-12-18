import {BehaviorSubject, interval, Observable, of, Subscription} from 'rxjs';
import {ElementRef} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {Ordering, Paging, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, DropdownItem} from '../../common.types';
import {Constants} from '../../utils/Constants';
import {Utils} from '../../utils/Utils';

import * as _ from 'lodash';

export abstract class TableDataSource<T> implements DataSource<T> {
  private dataSubject = new BehaviorSubject<any[]>([]);
  private searchInput: ElementRef;
  private paginator: MatPaginator;
  private sort: MatSort;
  private numberOfRecords = 0;
  private tableDef: TableDef;
  private actionsDef: TableActionDef[];
  private actionsRightDef: TableActionDef[];
  public rowActionsDef: TableActionDef[];
  private filtersDef: TableFilterDef[];
  private selectionModel: SelectionModel<any>;
  private data: any[] = [];
  private formattedData = [];
  private locale;
  private dataChangeSubscription: Subscription;
  private staticFilters = [];
  private pollingInterval: number;
  private i = 0;

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
    return this.dataSubject.asObservable();
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.dataSubject.complete();
  }

  public updatePaginator() {
    this.paginator.length = this.getNumberOfRecords();
  }

  public getPaginatorPageSizes() {
    return [25, 50, 100, 250, 500];
  }

  public getPaging(): Paging {
    return {
      skip: this.getPaginator().pageIndex * this.getPaginator().pageSize,
      limit: this.getPaginator().pageSize
    };
  }

  public getOrdering(): Ordering[] {
    return [
      {field: this.getSort().active, direction: this.getSort().direction}
    ]
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

  public getTableActionsDef(): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableRowActions(): TableActionDef[] {
    // Return default
    return [];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    // Return default
    return [];
  }

  public getTableDef(): TableDef {
    return {};
  }

  public filterChanged(filter: TableFilterDef) {
    // Update Filter
    const foundFilter = this.filtersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });
    // Update value
    foundFilter.currentValue = filter.currentValue;
    // Reload data
    this.loadData();
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
        this.loadData();
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

  public registerToDataChange() {
    // Listen for changes
    if (!this.dataChangeSubscription) {
      if (this.pollingInterval > 0) {
        this.dataChangeSubscription = interval(this.pollingInterval).subscribe(() => this.loadData());
      } else {
        this.dataChangeSubscription = this.getDataChangeSubject().subscribe(() => this.loadData());
      }
    }
  }

  public unregisterToDataChange() {
    // Exist?
    if (this.dataChangeSubscription) {
      // Unregister
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

  /**
   * getRowIndex
   row: T   */
  public getRowIndex(row: T) {
    const rowString = JSON.stringify(row);
    for (let index = 0; index < this.data.length; index++) {
      if (JSON.stringify(this.data[index]) === rowString) {
        return index;
      }
    }
  }

  abstract getTableColumnDefs(): TableColumnDef[];

  abstract loadData();

  refreshData(freshData: any[]) {
    const freshFormattedData = [];
    freshData.forEach((freshRow) => {
      const index = this.data.findIndex(row => row.id === freshRow.id);
      if (index !== -1) {
        if (_.isEqual(this.data[index], freshRow)) {
          freshFormattedData.push(this.formattedData[index]);
        } else {
          freshFormattedData.push(this._formatRow(freshRow));
        }
      } else {
        freshFormattedData.push(this._formatRow(freshRow));
      }
    });
    this.formattedData = freshFormattedData;
    this.data = freshData;
  }

  _formatRow(row): any[] {
    const formattedRow = [];
    this.getTableColumnDefs().forEach((columnDef) => {
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
}
