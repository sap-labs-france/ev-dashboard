import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Data, KeyValue } from '../../common.types';
import { DialogTableDataSource } from './dialog-table-data-source';

export abstract class DialogTableDataComponent<T extends Data> {
  public dialogDataSource: DialogTableDataSource<T>;
  public title: string;
  public buttonTitle: string;

  constructor(
      @Inject(MAT_DIALOG_DATA) data,
      protected dialogRef: MatDialogRef<DialogTableDataComponent<T>>,
      public dialogTableDataSource: DialogTableDataSource<T>) {
    // Assign dialog table data source if provided
    this.dialogDataSource = dialogTableDataSource;
    // Reset the provider if the filter has been reseted
    if (data.cleared) {
      this.dialogDataSource.setSearchValue('');
      this.dialogDataSource.destroyDatasource();
    }
    // assign parameters
    this.title = (data && data.title ? data.title : '');
    this.buttonTitle = (data && data.validateButtonTitle ? data.validateButtonTitle : 'general.select');
    // Set table definition if provided
    if (data && data.tableDef) {
      this.dialogDataSource.setTableDef(data.tableDef);
    }
    // Set static filter
    if (data.staticFilter) {
      this.dialogDataSource.setStaticFilters([
        data.staticFilter,
      ]);
    } else {
      this.dialogDataSource.setStaticFilters([]);
    }
    // Multiple Selection
    if (data.hasOwnProperty('rowMultipleSelection')) {
      this.dialogDataSource.setMultipleRowSelection(data.rowMultipleSelection);
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
    if (this.dialogDataSource.selectedRows > 0) {
      this.dialogRef.close(this.getSelectedItems(this.dialogDataSource.getSelectedRows()));
    }
  }

  setMultipleRowSelection(mutlipleRowSelection: boolean) {
    this.dialogDataSource.setMultipleRowSelection(mutlipleRowSelection);
  }

  cancel() {
    this.dialogRef.close();
  }

  abstract getSelectedItems(selectedRows: T[]): KeyValue[];
}
