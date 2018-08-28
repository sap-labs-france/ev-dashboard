import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { ConfigService } from '../../service/config.service';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit, AfterViewInit {
  @Input() dataSource;
  public columnsDef = [];
  public columns: string[];
  public columnNames: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();

  @ViewChild(MatPaginator) paginator: MatPaginator;
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
    this.columnsDef = this.dataSource.getColumnDefs();
    this.columns = this.dataSource.getColumnDefs().map( (column) => column.id);
    this.columnNames = this.dataSource.getColumnDefs().map( (column) => column.name);
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
      this.paginator.pageIndex = 0;
      // Load data
      this.loadData();
    });
  }

  ngAfterViewInit() {
    // Set Paginator
    this.dataSource.setPaginator(this.paginator);
    // Set Sort
    this.dataSource.setSort(this.sort);
    // Set Search
    this.dataSource.setSearchInput(this.searchInput);
    // Load the data
    this.loadData();
    // Paginator changed
    this.paginator.page.subscribe(() => this.loadData());
    // Sort changed
    this.sort.sortChange.subscribe(() => {
        // Reset paginator
        this.paginator.pageIndex = 0;
        // Load data
        this.loadData();
    });
  }

  loadData() {
    // Load data source
    this.dataSource.load();
  }

  applyFilter(filterValue: string) {
    // Set filter
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  rowClick(row) {
    console.log(row);
  }
}
