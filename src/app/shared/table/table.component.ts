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
  public pageLength = 0;
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
    this.columnsDef = this.dataSource.getColumnsDefs();
    this.columns = this.dataSource.getColumnsDefs().map( (column) => column.id);
    this.columnNames = this.dataSource.getColumnsDefs().map( (column) => column.name);
    // Paginator
    this.pageSizes = this.dataSource.getPaginatorPageSizes();
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
    this.dataSource.load({
      search: this.searchInput.nativeElement.value,
      sortField: this.sort.active,
      sortOrder: this.sort.direction,
      paginator: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    });
    // Update page length
    this.pageLength = Math.trunc(this.dataSource.getNumberOfRecords() / this.paginator.pageSize);
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
