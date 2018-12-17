import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { MatSort } from '@angular/material';
import { CollectionViewer, SelectionModel, DataSource } from '@angular/cdk/collections';
import { TableColumnDef, Ordering, TableDef, SubjectInfo, TableActionDef } from '../../../common.types';

export abstract class SimpleTableDataSource<T> implements DataSource<T> {
    protected dataSubject = new BehaviorSubject<T[]>([]);
    private sort: MatSort;
    private numberOfRecords = 0;
    private tableDef: TableDef;
    private actionsDef: TableActionDef[];
    private actionsRightDef: TableActionDef[];
    private selectionModel: SelectionModel<T>;
    private data: T[] = [];
    private dataChangeSubscription: Subscription;
    private rowActionsDef: TableActionDef[];

    private _checkInitialized(): any {
        // Check
        if (!this.tableDef) {
            this.tableDef = this.getTableDef();
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

    public getTableRowActions(rowItem?): TableActionDef[] {
        // Return default
        return [];
    }

    public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    }

    public hasActions(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.actionsDef && this.actionsDef.length > 0;
    }

    public isRowSelectionEnabled(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.enabled;
    }

    public isMultiSelectionEnabled(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.tableDef && this.tableDef.rowSelection && this.tableDef.rowSelection.multiple;
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

    public setSort(sort: MatSort) {
        this.sort = sort;
    }

    public getSort(): MatSort {
        return this.sort;
    }

    public connect(collectionViewer: CollectionViewer): Observable<T[]> {
        return this.dataSubject.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
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

    public getTableDef(): TableDef {
        return {};
    }

    public actionTriggered(actionDef: TableActionDef) {
        // Check common actions
        switch (actionDef.id) {
            case 'refresh':
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

    public hasRowActions(): boolean {
        // Check
        this._checkInitialized();
        // Return
        return this.rowActionsDef && this.rowActionsDef.length > 0;
      }

    abstract getTableColumnDefs(): TableColumnDef[];

    abstract loadData();

    abstract setDetailedDataSource(row);
}
