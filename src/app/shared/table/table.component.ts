import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { ConfigService } from '../../service/config.service';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { TableDataSource } from './table-data-source';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit, AfterViewInit {
  @Input() dataSource: TableDataSource<any>;
  public columnDefs = [];
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();

  @ViewChild('paginatorUp') paginatorUp: MatPaginator;
  @ViewChild('paginatorDown') paginatorDown: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(
      private configService: ConfigService,
      private translateService: TranslateService) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
  }

  ngOnInit() {
    // Set columns
    this.columnDefs = this.dataSource.getColumnDefs();
    this.columns = this.dataSource.getColumnDefs().map( (column) => column.id);
    // Paginator
    this.pageSizes = this.dataSource.getPaginatorPageSizes();
    // Sort
    const columnDef = this.dataSource.getColumnDefs().find((column) => column.sorted === true);
    if (columnDef) {
      // Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    // Subscribe to search changes
    this.searchSourceSubject.debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis)
        .distinctUntilChanged().subscribe(() => {
      // Reset paginator
      this.paginatorUp.pageIndex = 0;
      this.paginatorDown.pageIndex = 0;
      // Load data
      this.loadData();
    });
  }

  ngAfterViewInit() {
    // Set Paginator
    this.dataSource.setPaginatorUp(this.paginatorUp);
    this.dataSource.setPaginatorDown(this.paginatorDown);
    // Set Sort
    this.dataSource.setSort(this.sort);
    // Set Search
    this.dataSource.setSearchInput(this.searchInput);
    // Load the data
    this.loadData();
  }

  getRowValue(row: any, column: string) {
    // Check JSon sub-props
    if (column.indexOf('.') > 0) {
      // Yes: get the sub-property
      let nextProp = row;
      // Get the Json value
      column.split('.').forEach((oneColumn) => {
        nextProp = nextProp[oneColumn];
      });
      return nextProp;
    }
    // Return the property
    return row[column];
  }

  handleSortChanged() {
    // Reset paginator
    this.paginatorUp.pageIndex = 0;
    this.paginatorDown.pageIndex = 0;
    // Load data
    this.loadData();
  }

  handlePageChangedDown() {
    // Update the other paginator
    this.paginatorUp.pageIndex = this.paginatorDown.pageIndex;
    this.paginatorUp.pageSize = this.paginatorDown.pageSize;
    // Load data
    this.loadData();
  }

  handlePageChangedUp() {
    // Update the other paginator
    this.paginatorDown.pageIndex = this.paginatorUp.pageIndex;
    this.paginatorDown.pageSize = this.paginatorUp.pageSize;
    // Load data
    this.loadData();
  }

  loadData() {
    // Load data source
    this.dataSource.loadData();
  }

  rowClick(row) {
    console.log(row);
  }
}
