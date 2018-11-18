import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef, OnDestroy, ViewEncapsulation} from '@angular/core';
import { MatSort, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { TableColumnDef, TableDef, TableActionDef } from '../../../common.types';
import { ConfigService } from '../../../services/config.service';
import { CentralServerService } from '../../../services/central-server.service';
import { SimpleTableDataSource } from './simple-table-data-source';
import { Utils } from '../../../utils/Utils';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-simple-table',
  styleUrls: ['../table.component.scss'],
  templateUrl: 'simple-table.component.html',

})
export class SimpleTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataSource: SimpleTableDataSource<any>;
  public columnDefs = [];
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  public tableDef: TableDef;
  public autoRefeshChecked = true;
  private selection: SelectionModel<any>;
  private footer = false;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    // Get Table def
    this.tableDef = this.dataSource.getTableDef();
    // Get Selection Model
    this.selection = this.dataSource.getSelectionModel();
    // Get column defs
    this.columnDefs = this.dataSource.getTableColumnDefs();
    // Get columns
    this.columns = this.columnDefs.map( (column) => column.id);
    // Find Sorted columns
    const columnDef = this.columnDefs.find((column) => column.sorted === true);
    // Found?
    if (columnDef) {
      // Yes: Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
  }

  ngAfterViewInit() {
    // Set Sort
    this.dataSource.setSort(this.sort);
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

  public actionTriggered(actionDef: TableActionDef, event) {
    // Slide?
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
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

    // Format?
    if (columnDef.formatter) {
      // Yes
      propertyValue = columnDef.formatter(propertyValue, row, ...additionalProperties);
    }
    // Return the property
    return propertyValue;
  }

  public handleSortChanged() {
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  public loadData() {
    // Load data source
    this.dataSource.loadData();
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
}
