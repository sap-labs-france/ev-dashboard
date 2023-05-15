import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../types/GlobalType';
import { TableData } from '../../types/Table';
import { Utils } from '../../utils/Utils';
import { DialogTableDataSource } from './dialog-table-data-source';

export abstract class DialogTableDataComponent<T extends TableData> {
  public dialogDataSource: DialogTableDataSource<T>;
  public title: string;
  public buttonTitle: string;

  public constructor(
  @Inject(MAT_DIALOG_DATA) data: any,
    protected dialogRef: MatDialogRef<DialogTableDataComponent<T>>,
    public dialogTableDataSource: DialogTableDataSource<T>
  ) {
    // Assign dialog table data source if provided
    this.dialogDataSource = dialogTableDataSource;
    // Reset the provider if the filter has been reset
    if (data.cleared) {
      this.dialogDataSource.setSearchValue('');
      this.dialogDataSource.destroyDataSource();
    }
    // assign parameters
    this.title = data && data.title ? data.title : '';
    this.buttonTitle =
      data && data.validateButtonTitle ? data.validateButtonTitle : 'general.select';
    // Set table definition if provided
    if (data && data.tableDef) {
      this.dialogDataSource.setTableDef(data.tableDef);
    }
    // Set static filter
    if (data.staticFilter) {
      this.dialogDataSource.setStaticFilters([
        ...this.dialogDataSource.getStaticFilters(),
        data.staticFilter,
      ]);
    }
    // Multiple Selection
    if (Utils.objectHasProperty(data, 'rowMultipleSelection')) {
      this.dialogDataSource.setMultipleRowSelection(data.rowMultipleSelection);
    }
    Utils.registerValidateCloseKeyEvents(
      this.dialogRef,
      this.validate.bind(this),
      this.cancel.bind(this)
    );
  }

  public validate() {
    if (this.dialogDataSource.selectedRows > 0) {
      this.dialogRef.close(this.getSelectedItems(this.dialogDataSource.getSelectedRows()));
    }
  }

  public setMultipleRowSelection(mutlipleRowSelection: boolean) {
    this.dialogDataSource.setMultipleRowSelection(mutlipleRowSelection);
  }

  public cancel() {
    this.dialogRef.close();
  }

  public abstract getSelectedItems(selectedRows: T[]): KeyValue[];
}
