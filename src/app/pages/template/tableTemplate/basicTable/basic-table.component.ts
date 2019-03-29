import {Component} from '@angular/core';
import {BasicTableDataSource} from './basic-table-data-source-table';

@Component({
  selector: 'app-basic-table',
  templateUrl: 'basic-table.component.html',
  providers: [
    BasicTableDataSource
  ]
})
export class BasicTableComponent {
  constructor(
    public basicTableDataSource: BasicTableDataSource
  ) {
  }
}
