import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { Tag } from '../../../types/Tag';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { TagsDialogTableDataSource } from './tags-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class TagsDialogComponent extends DialogTableDataComponent<Tag> {
  constructor(
    protected dialogRef: MatDialogRef<TagsDialogComponent>,
    private tagsDialogTableDataSource: TagsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, tagsDialogTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'tags.select_tags';
    }
    this.tagsDialogTableDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: Tag[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: row.id, objectRef: row });
      });
    }
    return items;
  }
}
