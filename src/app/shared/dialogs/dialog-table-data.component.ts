import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DialogTableDataSource } from './dialog-table-data-source';
import { KeyValue, TableDef } from '../../common.types';

export abstract class DialogTableDataComponent<T> {
    public dialogDataSource: DialogTableDataSource<T>;
    protected abstract title: string;
    protected abstract dialogRef: MatDialogRef<DialogTableDataComponent<T>>

    constructor(@Inject(MAT_DIALOG_DATA) data) {
    }

    validate() {
        this.dialogRef.close(this.getSelectedItems(this.dialogDataSource.getSelectedRows()));
    }

    cancel() {
        this.dialogRef.close();
    }

    abstract getSelectedItems(selectedRows: T[]): KeyValue[];
}
