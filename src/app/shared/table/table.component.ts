import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog, MatPaginator, MatSort} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {SelectionModel} from '@angular/cdk/collections';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {ConfigService} from '../../services/config.service';
import {CentralServerService} from '../../services/central-server.service';
import {TableDataSource} from './table-data-source';
import {TableFilter} from './filters/table-filter';
import {Utils} from '../../utils/Utils';
import { DetailComponentContainer } from './detail-component/detail-component-container.component';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  private _detailComponentId: number;
  @Input() dataSource: TableDataSource<any>;
  public columnDefs = [];
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  public tableDef: TableDef;
  public autoRefeshChecked = true;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChildren(DetailComponentContainer) detailComponentContainers: QueryList<DetailComponentContainer>;
  private selection: SelectionModel<any>;
  private filtersDef: TableFilterDef[] = [];
  private actionsDef: TableActionDef[] = [];
  private actionsRightDef: TableActionDef[] = [];
  private footer = false;
  private filters: TableFilter[] = [];

  constructor(
    private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private dialog: MatDialog) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
    this._detailComponentId = 0;
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
    this.columns = this.columnDefs.map((column) => column.id);
    // Row Selection enabled?
    if (this.dataSource.isRowSelectionEnabled()) {
      // Yes: Add Select column
      this.columns = ['select', ...this.columns];
    }
    // Row Detailed enabled?
    if (this.dataSource.isRowDetailsEnabled()) {
      // Yes: Add Details column
      this.columns = ['details', ...this.columns];
    }
    // Is there specific row actions ?
    if (this.dataSource.hasRowActions()) {
      this.columns = [...this.columns, 'actions'];
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
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().length;
    return numSelected === numRows;
  }

  public filterChanged(filterDef: TableFilterDef, event) {
    // Date?
    if (filterDef.type === 'date') {
      // Date is one way binding: update the value manually
      filterDef.currentValue = event.value;
    }
    // Get Actions def
    this.dataSource.filterChanged(filterDef);
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    filterDef.currentValue = null;
    this.dataSource.filterChanged(filterDef)
  }

  public showDialogTableFilter(filterDef: TableFilterDef) {
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent);
    // Add sites
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        filterDef.currentValue = data;
        this.dataSource.filterChanged(filterDef)
      }
    });
  }

  public actionTriggered(actionDef: TableActionDef, event?) {
    // Slide?
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    // Get Actions def
    this.dataSource.rowActionTriggered(actionDef, rowItem);
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  public masterSelectToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.getData().forEach(row => this.selection.select(row));
  }

  public buildRowValue(row: any, columnDef: TableColumnDef) {
    let propertyValue = this.findPropertyValue(columnDef.id, row);
    const additionalProperties = [];
    if (columnDef.additionalIds) {
      columnDef.additionalIds.forEach(propertyName => additionalProperties.push(this.findPropertyValue(propertyName, row)));
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

    if (columnDef.formatter) {
      if (additionalProperties.length > 0) {
        propertyValue = columnDef.formatter(propertyValue, row, ...additionalProperties);
      } else {
        propertyValue = columnDef.formatter(propertyValue, row);
      }
    }
    // Return the property
    return propertyValue;
  }

  public handleSortChanged() {
    // Reset paginator
    this.paginator.pageIndex = 0;
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  public handlePageChanged() {
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  public loadData() {
    // Load data source
    this.dataSource.loadData();
  }

  public showHideDetailsClicked(row) {
    // Already Expanded
    if (!row.isExpanded) {
      // Already loaded?
      if (this.tableDef.rowDetails.enabled && !row[this.tableDef.rowDetails.detailsField]) {
        if (!this.tableDef.rowDetails.isDetailComponent) {
          // No: Load details from data source
          this.dataSource.getRowDetails(row).subscribe((details) => {
            // Set details
            row[this.tableDef.rowDetails.detailsField] = details;
            // No: Expand it!
            row.isExpanded = true;
          });
        } else{
// find the container related to the row
            let index = this.dataSource.getRowIndex(row);
            this.detailComponentContainers.forEach((detailComponentContainer: DetailComponentContainer) => {
              if (detailComponentContainer.containerId === index) {
                detailComponentContainer.setReferenceRow(row, this);
              }
            });
            row.isExpanded = true;
        }
      } else {
        // No: Expand it!
        row.isExpanded = true;
      }
    } else {
      // Fold it
      row.isExpanded = false;
    }
  }

  private findPropertyValue(propertyName, source) {
    let propertyValue = source[propertyName];

    if (propertyName.indexOf('.') > 0) {
      propertyValue = source;
      propertyName.split('.').forEach((key) => {
        propertyValue = propertyValue[key];
      });
    }
    return propertyValue;
  }

/*  public setDetailedDataSource(row){
    this.detailDataSource.setDetailedDataSource(row);
  }*/

  /**
   * isDetailedTableEnable
   */
/*  public isDetailedTableEnable(): Boolean {
    return this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.detailDataTable;
  }*/

  /**
   * set*ReferenceRow
   *row, */
  public setReferenceRow(row, rowDetails) {
    rowDetails.parentRow = row;
    return true;
  }

  /**
   * get
   */
  public getNextDetailComponentId() {
    if (this._detailComponentId === this.dataSource.getData().length) {
      this._detailComponentId = 0;
    }
    return this._detailComponentId++;
  }

}
