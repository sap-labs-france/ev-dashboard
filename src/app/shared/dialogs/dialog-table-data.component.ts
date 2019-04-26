import {Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DialogTableDataSource} from './dialog-table-data-source';
import {KeyValue} from '../../common.types';

export abstract class DialogTableDataComponent<T> {
  public dialogDataSource: DialogTableDataSource<T>;
  public title: string;
  public buttonTitle: string;
  protected dialogRef: MatDialogRef<DialogTableDataComponent<T>>

  constructor(@Inject(MAT_DIALOG_DATA) data, dialogTableDataSource?: DialogTableDataSource<T>) {
    // Assign dialog table data source if provided
    if (dialogTableDataSource) {
      this.dialogDataSource = dialogTableDataSource;
    }
    // assign parameters
    this.title = (data && data.title ? data.title : '');
    this.buttonTitle = (data && data.validateButtonTitle ? data.validateButtonTitle : 'general.select');
    // Set table definition if provided
    if (data && data.tableDef) {
      this.dialogDataSource.setTableDef(data.tableDef);
    }
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.cancel();
      }
      // check if enter
      if (keydownEvents && keydownEvents.code === 'Enter') {
        this.validate();
      }
    });
  }

  validate() {
    this.dialogRef.close(this.getSelectedItems(this.dialogDataSource.getSelectedRows()));
  }

  cancel() {
    this.dialogRef.close();
  }

  abstract getSelectedItems(selectedRows: T[]): KeyValue[];
}
