import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DialogTableDataSource } from './dialog-table-data-source';
import { KeyValue } from '../../common.types';

export abstract class DialogTableDataComponent<T> {
    public dialogDataSource: DialogTableDataSource<T>;
    private title: string;
    protected dialogRef: MatDialogRef<DialogTableDataComponent<T>>

    constructor(@Inject(MAT_DIALOG_DATA) data, title) {
        this.title = title;
    }

    validate() {
        this.dialogRef.close(this.getSelectedItems(this.dialogDataSource.getSelectedRows()));
    }

    cancel() {
        this.dialogRef.close();
    }

    abstract getSelectedItems(selectedRows: T[]): KeyValue[];
}
