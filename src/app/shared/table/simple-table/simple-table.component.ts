import { Component, OnInit, Input, AfterViewInit, OnDestroy, ViewChildren, QueryList} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { TableColumnDef, TableDef, TableActionDef } from '../../../common.types';
import { ConfigService } from '../../../services/config.service';
import { CentralServerService } from '../../../services/central-server.service';
import { SimpleTableDataSource } from './simple-table-data-source';
import { Utils } from '../../../utils/Utils';
import { DetailComponentContainer } from '../detail-component/detail-component-container.component';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-simple-table',
  styleUrls: ['../table.component.scss'],
  templateUrl: 'simple-table.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
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
  private footer = false;
  private _detailComponentId: number;

  @ViewChildren(DetailComponentContainer) detailComponentContainers: QueryList<DetailComponentContainer>;

  constructor(private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private dialog: MatDialog) {
    this._detailComponentId = 0;
  }

  ngOnInit() {
    // Get Table def
    this.tableDef = this.dataSource.getTableDef();
    // Get column defs
    this.columnDefs = this.dataSource.getTableColumnDefs();
    // Get columns
    this.columns = this.columnDefs.map( (column) => column.id);
    // Find Sorted columns
    const columnDef = this.columnDefs.find((column) => column.sorted === true);
    // Found?
/*    if (columnDef) {
      // Yes: Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }*/
    // Is there specific row actions ?
    if (this.dataSource.hasRowActions()) {
      this.columns = [...this.columns, 'rowActions'];
    }
    // Row Detailed enabled?
    if (this.dataSource.isRowDetailsEnabled()) {
      // Yes: Add Details column
      this.columns = ['details', ...this.columns];
    }
    // Check if detail display columns must be displayed
    this.dataSource.displayRowDetails.subscribe((displayDetails) => {
      if (!displayDetails) {
        // Remove details column
        const indexDetails = this.columns.findIndex((element) => element === 'details');
        if (indexDetails >= 0) {
          this.columns.splice(indexDetails, 1);
        }
      } else {
        // Add details column
        const indexDetails = this.columns.findIndex((element) => element === 'details');
        if (indexDetails === -1) {
          this.columns = ['details', ...this.columns];
        }
      }
    })
  }

  ngAfterViewInit() {
/*    // Set Sort
    this.dataSource.setSort(this.sort);
    // Load the data
    this.loadData();*/
  }

  ngOnDestroy() {
    // Unregister
    this.dataSource.unregisterToDataChange();
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

  public buildRowValue(row: any, columnDef: TableColumnDef) {
    let propertyValue = this.findPropertyValue(columnDef.id, row);
    const additionalProperties = [];

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
    // Load data
    this.loadData();
  }

  public loadData() {
    // Load data source
    this.dataSource.loadData();
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    // Get Actions def
    this.dataSource.rowActionTriggered(actionDef, rowItem);
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

  public showHideDetailsClicked(row) {
    // Already Expanded
    if (!row.isExpanded) {
      // Already loaded?
      if (this.tableDef.rowDetails.enabled && !this.tableDef.rowDetails.detailsField) {
        if (!this.tableDef.rowDetails.isDetailComponent) {
          // No: Load details from data source
          this.dataSource.getRowDetails(row).subscribe((details) => {
            // Set details
            this.tableDef.rowDetails.detailsField = details;
            // No: Expand it!
            row.isExpanded = true;
          });
        } else {
          // find the container related to the row
//          const index = this.dataSource.getRowIndex(row);
          this.detailComponentContainers.forEach((detailComponentContainer: DetailComponentContainer) => {
            if (detailComponentContainer.parentRow === row) {
              detailComponentContainer.loadComponent();
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

  /**
   * get
   */
  public getNextDetailComponentId() {
    if (this._detailComponentId === this.dataSource.getData().length - 1) {
// We are dealing with last entry so we should reset the Id in case we start another loop
      this._detailComponentId = 0;
      return this.dataSource.getData().length - 1;
    }
    return this._detailComponentId++;
  }

}
