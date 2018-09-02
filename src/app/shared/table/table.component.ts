import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ConfigService } from '../../service/config.service';
import { TableDataSource } from './table-data-source';
import { TableColumnDef, TableDef } from '../../common.types';
import { Utils } from '../../utils/Utils';
import { SelectionModel } from '@angular/cdk/collections';

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
  private selection: SelectionModel<any>;
  private tableDef: TableDef;
  private footer = false;

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
    // Get table def
    this.tableDef = this.dataSource.getTableDef();
    // Get Selection
    this.selection = this.dataSource.getSelectionModel();
    // Get column defs
    this.columnDefs = this.dataSource.getColumnDefs();
    this.columns = this.dataSource.getColumnDefs().map( (column) => column.id);
    // Selection enabled?
    if (this.dataSource.isLineSelectionEnabled()) {
      // Add column select
      this.columns = ['select', ...this.columns];
    }
    // Paginator
    this.pageSizes = this.dataSource.getPaginatorPageSizes();
    // Sort
    const columnDef = this.dataSource.getColumnDefs().find((column) => column.sorted === true);
    if (columnDef) {
      // Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    this.searchSourceSubject.pipe(
      debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
      distinctUntilChanged()).subscribe(() => {
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.getData().forEach(row => this.selection.select(row));
  }

  getRowValue(row: any, columnDef: TableColumnDef) {
    let propertyValue = row[columnDef.id];

    // Check if ID contains multiple IDs
    if (columnDef.id.indexOf('.') > 0) {
      // Yes: get the sub-property
      propertyValue = row;
      // Get the Json value
      columnDef.id.split('.').forEach((id) => {
        propertyValue = propertyValue[id];
      });
    }

    // Type?
    switch (columnDef.type) {
      // Date
      case 'date':
        propertyValue = Utils.convertToDate(propertyValue);
        break;
      // Integer
      case 'integer':
        propertyValue = Utils.convertToInteger(propertyValue);
        break;
        // Float
      case 'float':
        propertyValue = Utils.convertToFloat(propertyValue);
        break;
    }

    // Format?
    if (columnDef.formatter) {
      // Yes
      propertyValue = columnDef.formatter(propertyValue, columnDef.formatterOptions);
    }
    // Return the property
    return propertyValue;
  }

  handleSortChanged() {
    // Reset paginator
    this.paginatorUp.pageIndex = 0;
    this.paginatorDown.pageIndex = 0;
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  handlePageChangedDown() {
    // Update the other paginator
    this.paginatorUp.pageIndex = this.paginatorDown.pageIndex;
    this.paginatorUp.pageSize = this.paginatorDown.pageSize;
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  handlePageChangedUp() {
    // Update the other paginator
    this.paginatorDown.pageIndex = this.paginatorUp.pageIndex;
    this.paginatorDown.pageSize = this.paginatorUp.pageSize;
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  loadData() {
    // Load data source
    this.dataSource.loadData();
  }

  rowClick(row) {
  }
}
