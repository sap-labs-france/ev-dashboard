import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TableColumnDef, TableDef, TableFilterDef, TableActionDef } from '../../common.types';
import { ConfigService } from '../../services/config.service';
import { CentralServerService } from '../../services/central-server.service';
import { TableDataSource } from './table-data-source';
import { TableFilter } from './filters/table-filter';
import { Utils } from '../../utils/Utils';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataSource: TableDataSource<any>;
  public columnDefs = [];
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  private selection: SelectionModel<any>;
  private tableDef: TableDef;
  private filtersDef: TableFilterDef[] = [];
  private actionsDef: TableActionDef[] = [];
  private actionsRightDef: TableActionDef[] = [];
  private footer = false;
  public autoRefeshChecked = true;
  private filters: TableFilter[] = [];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(
      private configService: ConfigService,
      private centralServerService: CentralServerService,
      private translateService: TranslateService) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
  }

  ngOnInit() {
    // Get Table def
    this.tableDef = this.dataSource.getTableDef();
    // Get Filters def
    this.filtersDef = this.dataSource.getTableFiltersDef();
    // Get Actions def
    this.actionsDef = this.dataSource.getTableActionsDef();
    // Get Actions Right def
    this.actionsRightDef = this.dataSource.getTableActionsRightDef();
    // Get Selection Model
    this.selection = this.dataSource.getSelectionModel();
    // Get column defs
    this.columnDefs = this.dataSource.getTableColumnDefs();
    // Get columns
    this.columns = this.columnDefs.map( (column) => column.id);
    // Line Selection enabled?
    if (this.dataSource.isLineSelectionEnabled()) {
      // Yes: Add column select
      this.columns = ['select', ...this.columns];
    }
    // Paginator
    this.pageSizes = this.dataSource.getPaginatorPageSizes();
    // Find Sorted columns
    const columnDef = this.columnDefs.find((column) => column.sorted === true);
    // Found?
    if (columnDef) {
      // Yes: Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    // Listen to Search change
    this.searchSourceSubject.pipe(
      debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
      distinctUntilChanged()).subscribe(() => {
        // Reset paginator
        this.paginator.pageIndex = 0;
        // Load data
        this.loadData();
      }
    );
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
  }

  ngOnDestroy() {
    // Unregister
    this.dataSource.unregisterToDataChange();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().length;
    return numSelected === numRows;
  }

  filterChanged(filterDef: TableFilterDef, event) {
    // Date?
    if (filterDef.type === 'date') {
      // Date is one way binding: update the value manually
      filterDef.currentValue = event.value;
    }
      // Get Actions def
    this.dataSource.filterChanged(filterDef);
  }

  actionTriggered(actionDef: TableActionDef, event) {
    // Slide?
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  masterSelectToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.getData().forEach(row => this.selection.select(row));
  }

  buildRowValue(row: any, columnDef: TableColumnDef) {
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
    this.paginator.pageIndex = 0;
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  handlePageChanged() {
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
