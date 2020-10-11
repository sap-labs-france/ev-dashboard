import { Component } from '@angular/core';

import { TagsListTableDataSource } from './tags-list-table-data-source';

@Component({
  selector: 'app-tags-list',
  template: '<app-table [dataSource]="tagsListTableDataSource"></app-table>',
  providers: [TagsListTableDataSource],
})
export class TagsListComponent {

  constructor(
    public tagsListTableDataSource: TagsListTableDataSource
  ) { }
}

