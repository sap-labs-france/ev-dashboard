import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { CollectionViewer, SelectionModel, DataSource } from '@angular/cdk/collections';
import { TableColumnDef, Paging, Ordering, TableDef, SubjectInfo, TableActionDef, TableFilterDef, Variant, FilterType } from '../../common.types';
import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';

export abstract class TableDataSource<T> implements DataSource<T> {
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
    private staticFilters = [];
    private viewID: string;
    private variants: Variant[];
    private selectedVariant: Variant;

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
        if (!this.viewID) {
            this.viewID = this.getViewID();
        }
    }

    public isEmpty(): boolean {
        // Empty?
        return this.data.length === 0;
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

    public getSelectionModel(): SelectionModel<T> {
        if (!this.selectionModel) {
            this.selectionModel = new SelectionModel<T>(
                this.isMultiSelectionEnabled(), []);
        }
        return this.selectionModel;
    }

    public getSelectedRows(): T[] {
        return this.getSelectionModel().selected;
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

    public filterChanged(filter: TableFilterDef, reload: boolean = true) {
        // Update Filter
        const foundFilter = this.filtersDef.find((filterDef) => {
            return filterDef.id === filter.id;
        });
        // Update value
        foundFilter.currentValue = filter.currentValue;
        // Reload? (Prevent reload in case of variant)
        if (reload) {
            // Reload data
            this.loadData();
        }
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
        let filterJson = {};
        // Parse filters
        this.filtersDef.forEach((filterDef) => {
            // Check the 'All' value
            if (filterDef.currentValue && filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
                if (filterDef.currentValue instanceof Date) {
                    // Set it
                    filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
                } else if (filterDef.type === Constants.FILTER_TYPE_DIALOG_TABLE) {
                    if (filterDef.currentValue.length > 0) {
                        // TODO: must be updated when the multi selection is supported
                        if (filterDef.currentValue[0].key !== Constants.FILTER_ALL_KEY) {
                            filterJson[filterDef.httpId] = filterDef.currentValue[0].key;
                        }
                    }
                } else {
                    // Set it
                    filterJson[filterDef.httpId] = filterDef.currentValue;
                }
            }
        });
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

    public isVariantEnabled(): boolean {
        // Return
        return this.hasFilters() && this.tableDef.variant.enabled;
    }

    public variantDeleted(variant: Variant) {
        // Find variant
        const foundVariant = this.variants.find(variantDef => {
            return (variantDef.id === variant.id);
        });
        // Delete variant
        if(foundVariant) {
            const index = this.variants.indexOf(foundVariant, 0);
            this.variants.splice(index, 1);
        }
    }

    public variantCreated(variant) {
        this.variants.push(variant);
    }

    public variantUpdated(variant) {
        // Get variant
        const foundVariant = this.variants.find(variantDef => {
            return variantDef.id === variant.id;
        });
        // Update filter
        foundVariant.filters = JSON.parse(JSON.stringify(variant.filters));
    }

    public getVariants() {
        const variants: Variant[] = [];
        return this.variants ? this.variants : variants;
    }

    public setVariants(variants: Variant[]) {
        this.variants = variants;
    }

    public getFiltredVariants(variantName: string) {
        return this.getVariants().filter(variant => variant.name.toLowerCase().startsWith(variantName.toLowerCase()));
    }

    public getViewID() {
        return '';
    }

    abstract getTableColumnDefs(): TableColumnDef[];

    abstract loadData();
}
