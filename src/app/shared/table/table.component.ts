import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { TableColumnDef, TableDef, TableFilterDef, TableActionDef, Filter, User, Variant, VariantResult } from '../../common.types';
import { ConfigService } from '../../services/config.service';
import { CentralServerService } from '../../services/central-server.service';
import { MessageService } from '../../services/message.service';
import { TableDataSource } from './table-data-source';
import { TableFilter } from './filters/table-filter';
import { Utils } from '../../utils/Utils';
import { FormControl } from '@angular/forms';
import { Constants } from '../../utils/Constants';
import * as moment from 'moment';

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
  @Input() dataSource: TableDataSource<any>;
  public columnDefs = [];
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  public tableDef: TableDef;
  public autoRefeshChecked = true;
  public variantPlaceholder = '';
  private selection: SelectionModel<any>;
  private filtersDef: TableFilterDef[] = [];
  private actionsDef: TableActionDef[] = [];
  private actionsRightDef: TableActionDef[] = [];
  private footer = false;
  private filters: TableFilter[] = [];
  public filteredVariants: Variant[];
  public selectedVariant: Variant;
  public loggedUser: User;

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  public variantInputField: FormControl = new FormControl();

  constructor(
      private configService: ConfigService,
      private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private dialog: MatDialog,
      private router: Router,
      private messageService: MessageService,) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
    this.variantPlaceholder = this.translateService.instant('general.variant_placeholder');
    // Logged user
    this.loggedUser = this.centralServerService.getLoggedUser();
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
    // Variants
     this.centralServerService
     .getVariants({
       ViewID: this.dataSource.getViewID(),
       UserID: this.centralServerService.getLoggedUser().id,
       WithGlobal: true
     })
     .subscribe(
       (variantResult: VariantResult) => {
         this.dataSource.setVariants(variantResult.result);
         this.filteredVariants = this.dataSource.getVariants();
       },
       error => {
         console.log(error);
       }
     );
     this.handleChangeVariantInput();
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
      if (!row[this.tableDef.rowDetails.detailsField]) {
        // No: Load details from data source
        this.dataSource.getRowDetails(row).subscribe((details) => {
          // Set details
          row[this.tableDef.rowDetails.detailsField] = details;
          // No: Expand it!
          row.isExpanded = true;
        });
      } else {
        // No: Expand it!
        row.isExpanded = true;
      }
    } else {
      // Fold it
      row.isExpanded = false;
    }
  }

  public isSaveVariantEnabled(value): boolean {
    const validName = /^[a-zA-Z]+[a-zA-Z_0-9]+$/;
    // Not defined
    if (!value || value.name === '' || !validName.test(value.name)) {
      return false;
    }
    // Current variant?
    if (!this.selectedVariant) {
      // Variant with the same name and same user exists?
      const foundVariant = this.dataSource.getVariants().find(variant => {
        return variant.name === value.name && variant.userID === this.loggedUser.id;
      });
      // Disable if exists
      return foundVariant ? false : true;
    }
    // Enable
    return true;
  }

  public displayFnVariant(variant?: Variant): string | undefined {
    return variant ? variant.name : undefined;
  }

  public handleChangeVariantInput() {
    this.variantInputField.valueChanges.subscribe(val => {
      // Clear current selection
      this.selectedVariant = null;
      // Get filtred variants
      if (val === '') {
        this.filteredVariants =  this.dataSource.getVariants();
      } else {
        this.filteredVariants = this.dataSource.getFiltredVariants(val.toString());
      }
    });
  }

  public  handleVariantChanged(variant) {
    // Get variant
    const foundVariant = this.dataSource.getVariants().find(variantDef => {
      return variantDef.id === variant.id;
    });

    // Update filters & clear the remaining
    this.filtersDef.forEach(async filter => {
      const foundFilter = foundVariant.filters.find(filterDef => {
        return filterDef.filterID === filter.httpId;
      });

      if (foundFilter) {
        // Update filter
        switch (filter.type) {
          case Constants.FILTER_TYPE_DIALOG_TABLE:
          const value = await this.dataSource.buildFilterValue(filter, foundFilter.filterContent);
            filter.currentValue = [{ key: foundFilter.filterContent, value: value }];
            break;
          case Constants.FILTER_TYPE_DATE:
            filter.currentValue = Utils.convertToDate(foundFilter.filterContent);
            break;
          case Constants.FILTER_TYPE_DROPDOWN:
            filter.currentValue = foundFilter.filterContent;
            break;
          default:
            break;
        }
      } else {
        // Clear filter
        switch (filter.type) {
          case Constants.FILTER_TYPE_DIALOG_TABLE:
            filter.currentValue = null;
            break;
          case Constants.FILTER_TYPE_DATE:
            filter.currentValue = Utils.convertToDate(moment().startOf('day'));
            break;
          case Constants.FILTER_TYPE_DROPDOWN:
            filter.currentValue = filter.items[0].key;
            break;
          default:
            break;
        }
      }
      // Filter changed (prevent reload)
      // Reload of data should be done once after updating all the filters
      this.dataSource.filterChanged(filter, false);
    });
    // Search?
    if (this.dataSource.isSearchEnabled() && this.searchInput) {
      const searchFilter = foundVariant.filters.find(filterDef => {
        return filterDef.filterID === 'Search'
      });
      // Update/Clear
      this.searchInput.nativeElement.value = searchFilter ? searchFilter.filterContent : '';
    }
    // Keep selected variant
    this.selectedVariant = foundVariant;
    // Reload data
    this.loadData();
  }

  public handleDeleteVariant() {
    // Delete
    this.centralServerService.deleteVariant(this.selectedVariant.id).subscribe(
      (result) => {
        if (result) {
          // Clear variant input field
          this.variantInputField.setValue('');
          // Variant deleted
          this.dataSource.variantDeleted(this.selectedVariant);
          // Clear all filters
          this.filtersDef.forEach(filter => {
            switch(filter.type) {
              case Constants.FILTER_TYPE_DIALOG_TABLE:
              filter.currentValue = null;
                break;
              case Constants.FILTER_TYPE_DATE:
              filter.currentValue = Utils.convertToDate(moment().startOf('day'));
                break;
              case Constants.FILTER_TYPE_DROPDOWN:
              filter.currentValue = filter.items[0].key;
                break;
              default:
                break;
            }
            // Filter changed (prevent reload)
            // Reload of data should be done once after updating all filters
            this.dataSource.filterChanged(filter, false);
          });
          // Search
          if (this.dataSource.isSearchEnabled() && this.searchInput) {
            this.searchInput.nativeElement.value = '';
          }
          // Clear selection
          this.selectedVariant = null;
          // Reload data
          this.loadData();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  public handleSaveVariant() {
    const createdVariant: Variant = { id: '', name: '', viewID: '', userID: '', filters: [] };
    // Build filters
    const filters = this.dataSource.getFilterValues();
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        const filter: Filter = { filterID: key, filterContent: filters[key] };
        createdVariant.filters.push(filter);
      }
    }
    // Create or Update?
    if (!this.selectedVariant) {
      // Create
      createdVariant.name = this.variantInputField.value;
      createdVariant.viewID = this.dataSource.getViewID();
      createdVariant.userID = this.centralServerService.getLoggedUser().id;
      this.centralServerService.createVariant(createdVariant).subscribe(
        variant => {
          if (variant) {
            // Add
            this.dataSource.variantCreated(variant);
            // Keep selection
            this.selectedVariant = variant;
          }
        },
        error => {
          console.log(error);
        }
      );
    } else {
      // Update
      this.selectedVariant.filters = JSON.parse(JSON.stringify(createdVariant.filters));
      this.centralServerService.updateVariant(this.selectedVariant).subscribe(
        result => {
          if (result) {
            // Update
            this.dataSource.variantUpdated(this.selectedVariant);
          }
        },
        error => {
          // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
        }
      );
    }
  }

}
