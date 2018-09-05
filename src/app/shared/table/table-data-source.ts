import { BehaviorSubject, Observable } from 'rxjs';
import { ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { TableColumnDef, TableSearch, Paging, Ordering, TableDef, SubjectInfo, TableActionDef, TableFilterDef } from '../../common.types';

export abstract class TableDataSource<T> {
    private dataSubject = new BehaviorSubject<T[]>([]);
    private searchInput: ElementRef;
    private paginator: MatPaginator;
    private sort: MatSort;
    private numberOfRecords = 0;
    private actionsDef: TableActionDef[];
    private filtersDef: TableFilterDef[];
    private tableDef: TableDef;
    private selectionModel: SelectionModel<T>;
    private data: T[] = [];

    checkInitialized(): any {
        // Check
        if (!this.tableDef) {
            this.tableDef = this.getTableDef();
        }
        if (!this.filtersDef) {
            this.filtersDef = this.getTableFiltersDef();
        }
    }

    isAutoRefreshEnabled(): boolean {
        // Check
        this.checkInitialized();
        // return this.tableDef && this.tableDef.actions &&
        //     this.tableDef.actions.autoRefresh && this.tableDef.actions.autoRefresh.enabled;
        return false;
    }

    getAutoRefreshDefaultValue(): boolean {
        // Check
        this.checkInitialized();
        // return this.tableDef && this.tableDef.actions &&
        //     this.tableDef.actions.autoRefresh && this.tableDef.actions.autoRefresh.defaultValue;
        return false;
    }

    getAutoRefreshSubject(): Observable<SubjectInfo> {
        // Check
        this.checkInitialized();
        // Return
        return null;
    }

    hasActions(): boolean {
        // Check
        this.checkInitialized();
        // Return
        return this.actionsDef && this.actionsDef.length > 0;
    }

    hasFilters(): boolean {
        // Check
        this.checkInitialized();
        // Return
        return this.filtersDef && this.filtersDef.length > 0;
    }

    isRefreshEnabled(): boolean {
        // Check
        this.checkInitialized();
        // return this.tableDef && this.tableDef.actions &&
        //     this.tableDef.actions.refresh && this.tableDef.actions.refresh.enabled;
        return false;
    }

    isLineSelectionEnabled(): boolean {
        // Check
        this.checkInitialized();
        // Return
        return this.tableDef && this.tableDef.lineSelection && this.tableDef.lineSelection.enabled;
    }

    isMultiSelectionEnabled(): boolean {
        // Check
        this.checkInitialized();
        // Return
        return this.tableDef && this.tableDef.lineSelection && this.tableDef.lineSelection.multiple;
    }

    isFooterEnabled(): boolean {
        // Check
        this.checkInitialized();
        // Return
        return this.tableDef && this.tableDef.footer && this.tableDef.footer.enabled;
    }

    isSearchEnabled(): boolean {
        // Check
        this.checkInitialized();
        // Return
        return this.tableDef && this.tableDef.search && this.tableDef.search.enabled;
    }

    getSelectionModel(): SelectionModel<T> {
        if (!this.selectionModel) {
            this.selectionModel = new SelectionModel<T>(
                this.isMultiSelectionEnabled(), []);
        }
        return this.selectionModel;
    }

    getDataSubjet(): BehaviorSubject<T[]> {
        return this.dataSubject;
    }

    setPaginator(paginator: MatPaginator) {
        this.paginator = paginator;
    }

    getPaginator(): MatPaginator {
        // Return one of them
        return this.paginator;
    }

    setSort(sort: MatSort) {
        this.sort = sort;
    }

    getSort(): MatSort {
        return this.sort;
    }

    setSearchInput(searchInput: ElementRef) {
        this.searchInput = searchInput;
    }

    connect(collectionViewer: CollectionViewer): Observable<T[]> {
        return this.dataSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
    }

    updatePaginator() {
        this.paginator.length = this.getNumberOfRecords();
    }

    getPaginatorPageSizes() {
        return [25, 50, 100, 250, 500];
    }

    getSearch(): TableSearch {
        return { search: this.searchInput.nativeElement.value };
    }

    getPaging(): Paging {
        return {
            skip: this.getPaginator().pageIndex * this.getPaginator().pageSize,
            limit: this.getPaginator().pageSize
        };
    }

    getOrdering(): Ordering[] {
        return [
            { field: this.getSort().active, direction: this.getSort().direction }
        ]
    }

    setNumberOfRecords(numberOfRecords: number) {
        this.numberOfRecords = numberOfRecords;
    }

    getNumberOfRecords(): number {
        return this.numberOfRecords;
    }

    setData(data: T[]) {
        this.data = data;
    }

    getData(): T[] {
        return this.data;
    }

    getTableActionsDef(): TableActionDef[] {
        return [];
    }

    getTableFiltersDef(): TableFilterDef[] {
        return [];
    }

    getTableDef(): TableDef {
        return {
            search: {
                enabled: true
            }
        };
    }

    abstract loadData();
    abstract getColumnDefs(): TableColumnDef[];
}
