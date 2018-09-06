import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { TableColumnDef, TableSearch, Paging, Ordering, TableDef, SubjectInfo, TableActionDef, TableFilterDef } from '../../common.types';
import { Constants } from '../../utils/Constants';

export abstract class TableDataSource<T> {
    private dataSubject = new BehaviorSubject<T[]>([]);
    private searchInput: ElementRef;
    private paginator: MatPaginator;
    private sort: MatSort;
    private numberOfRecords = 0;
    private tableDef: TableDef;
    private actionsDef: TableActionDef[];
    private actionsRightDef: TableActionDef[];
    private filtersDef: TableFilterDef[];
    private selectionModel: SelectionModel<T>;
    private data: T[] = [];
    private dataChangeSubscription: Subscription;

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
            this._checkKnownActions(this.actionsRightDef);
        }
        if (!this.actionsRightDef) {
            // Get
            this.actionsRightDef = this.getTableActionsRightDef();
            // Check known actions
            this._checkKnownActions(this.actionsRightDef);
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

    public hasActions(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.actionsDef && this.actionsDef.length > 0;
    }

    public hasFilters(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.filtersDef && this.filtersDef.length > 0;
    }

    public isLineSelectionEnabled(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.tableDef && this.tableDef.lineSelection && this.tableDef.lineSelection.enabled;
    }

    public isMultiSelectionEnabled(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.tableDef && this.tableDef.lineSelection && this.tableDef.lineSelection.multiple;
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

    public getSelectionModel(): SelectionModel<T> {
        if (!this.selectionModel) {
            this.selectionModel = new SelectionModel<T>(
                this.isMultiSelectionEnabled(), []);
        }
        return this.selectionModel;
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
            { field: this.getSort().active, direction: this.getSort().direction }
        ]
    }

    public setNumberOfRecords(numberOfRecords: number) {
        this.numberOfRecords = numberOfRecords;
    }

    public getNumberOfRecords(): number {
        return this.numberOfRecords;
    }

    public setData(data: T[]) {
        this.data = data;
    }

    public getData(): T[] {
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

    public actionTriggered(actionDef: TableActionDef) {
        // Check common actions
        switch (actionDef.id) {
            // Refresh
            case 'refresh':
                // Reload data
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

    public getDataChangeSubject(): Observable<SubjectInfo> {
        // Return
        throw new Error('You must implement the method TableDataSource.getDataChangeSubject() to enable the auto-refresh feature');
    }

    public registerToDataChange() {
      // Listen for changes
      if (!this.dataChangeSubscription) {
        this.dataChangeSubscription = this.getDataChangeSubject().subscribe(() => {
            this.loadData();
        });
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
        const filterJson = {};
        // Parse filters
        this.filtersDef.forEach((filterDef) => {
            // Check the 'All' value
            if (filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
                if (filterDef.currentValue instanceof Date) {
                    // Set it
                    filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
                } else {
                    // Set it
                    filterJson[filterDef.httpId] = filterDef.currentValue;
                }
            }
        });
        // With Search?
        if (withSearch) {
            filterJson['Search'] = this.getSearchValue();
        }
        return filterJson;
    }

    abstract getTableColumnDefs(): TableColumnDef[];

    abstract loadData();
}
