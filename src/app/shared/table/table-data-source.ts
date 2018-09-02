import { BehaviorSubject, Observable } from 'rxjs';
import { ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { TableColumnDef, Paging, Ordering, TableDef } from '../../common.types';

interface TableSearch {
    search: string;
}

export abstract class TableDataSource<T> {
    private subject = new BehaviorSubject<T[]>([]);
    private searchInput: ElementRef;
    private paginatorUp: MatPaginator;
    private paginatorDown: MatPaginator;
    private sort: MatSort;
    private numberOfRecords = 0;
    private tableDef: TableDef = {};
    private selectionModel: SelectionModel<T>;
    private data: T[] = [];

    constructor() {
        // Retrieve table definition
        this.tableDef = this.getTableDef();
    }

    isLineSelectionEnabled(): boolean {
        return this.tableDef && this.tableDef.lineSelection && this.tableDef.lineSelection.enabled;
    }

    isMultiSelectionEnabled(): boolean {
        return this.tableDef && this.tableDef.lineSelection && this.tableDef.lineSelection.multiple;
    }

    isFooterEnabled(): boolean {
        return this.tableDef && this.tableDef.footer && this.tableDef.footer.enabled;
    }

    isSearchEnabled(): boolean {
        return this.tableDef && this.tableDef.search && this.tableDef.search.enabled;
    }

    getSelectionModel(): SelectionModel<T> {
        if (!this.selectionModel) {
            this.selectionModel = new SelectionModel<T>(
                this.isMultiSelectionEnabled(), []);
        }
        return this.selectionModel;
    }

    getSubjet(): BehaviorSubject<T[]> {
        return this.subject;
    }

    setPaginatorUp(paginator: MatPaginator) {
        this.paginatorUp = paginator;
    }

    setPaginatorDown(paginator: MatPaginator) {
        this.paginatorDown = paginator;
    }

    getPaginator(): MatPaginator {
        // Return one of them
        return this.paginatorUp;
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
        return this.subject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.subject.complete();
    }

    updatePaginator() {
        this.paginatorUp.length = this.getNumberOfRecords();
        this.paginatorDown.length = this.getNumberOfRecords();
    }

    getPaginatorPageSizes() {
        return [15, 25, 50, 100, 250, 500];
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
