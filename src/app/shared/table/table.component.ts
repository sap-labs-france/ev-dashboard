import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatSort, Sort, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DropdownItem, TableActionDef, TableDef, TableFilterDef, TableColumnDef} from '../../common.types';
import {ConfigService} from '../../services/config.service';
import {TableDataSource} from './table-data-source';
import {DetailComponentContainer} from './detail-component/detail-component-container.component';
import {LocaleService} from '../../services/locale.service';
import {MatDatetimepickerInputEvent} from '@mat-datetimepicker/core';
import { SpinnerService } from 'app/services/spinner.service';

const DEFAULT_POLLING = 10000;

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html'
})
export class TableComponent implements OnInit, AfterViewInit {
  @Input() dataSource: TableDataSource<any>;
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  public autoRefeshChecked = true;
  public ongoingAutoRefresh = false;
  public ongoingManualRefresh = false;
  public sort: MatSort = new MatSort();

  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(
    private configService: ConfigService,
    private translateService: TranslateService,
    protected localService: LocaleService,
    public spinnerService: SpinnerService,
    private dialog: MatDialog) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
    console.log('table.component - constructor');
  }

  ngOnInit() {
    // setInterval(() => {
    //   if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 15) {
    //     // Change
    //     const index = Math.trunc(Math.random() * 15);
    //     console.log(this.dataSource.data[index].message);
    //     const newData = Array.from(this.dataSource.data);
    //     newData[index].message = 'FUCK';
    //     this.dataSource.data.length = 0;
    //     this.dataSource.data.push(...newData);
    //     // Refresh table
    //     this.table.renderRows();
    //   }
    // }, 2000);
    console.log('table.component - ngOnInit');

    // Handle locale (local service available only in component not possible in data-source)
    this.dataSource.setLocale(this.localService.getCurrentFullLocaleForJS());

    // Handle Poll (config service available only in component not possible in data-source)
    if (this.configService.getCentralSystemServer().pollEnabled) {
      this.dataSource.setPollingInterval(this.configService.getCentralSystemServer().pollIntervalSecs ?
        this.configService.getCentralSystemServer().pollIntervalSecs * 1000 : DEFAULT_POLLING);
    }

    // Search?
    if (this.dataSource.tableDef.search) {
      // Yes: Listen to Search change
      this.searchSourceSubject.pipe(
        debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
        distinctUntilChanged()).subscribe(() => {
          // Trigger load data
          this.loadData();
        }
      );
    }

    // Init Sort
    // Find Sorted columns
    const columnDef = this.dataSource.tableColumnDefs.find((column) => column.sorted === true);
    // Found?
    if (columnDef) {
      // Yes: Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    // Set Sort
    this.dataSource.setSort(this.sort);
  }

  ngAfterViewInit() {
    console.log('table.component - ngAfterViewInit');
    // Set the Search input
    this.dataSource.setSearchInput(this.searchInput);
    // Clear the selection
    this.dataSource.selectionModel.clear();
    // Load the data
    this.loadData();
  }

  // /** Whether the number of selected elements matches the total number of rows. */
  // public isAllSelected() {
  //   console.log('table.component - isAllSelected');
  //   return (this.dataSource.selectionModel.selected.length === this.dataSource.data.length);
  // }

  public filterChanged(filterDef: TableFilterDef, event) {
    console.log('table.component - filterChanged');
    // Get Actions def
    this.dataSource.filterChanged(filterDef);
    // Reload data
    this.loadData();
  }

  public sortChanged(tableColumnDef: TableColumnDef) {
    console.log('table.component - handleSortChanged');
    // Check
    if (this.sort.active === tableColumnDef.id) {
      // Reverse
      this.sort.direction = (this.sort.direction === 'asc' ? 'desc' : 'asc');
    } else {
      // New Sort
      this.sort.active = tableColumnDef.id;
      this.sort.direction = tableColumnDef.direction;
    }
    // Load data
    this.loadData();
  }

  // public dateFilterChanged(filterDef: TableFilterDef, event: MatDatetimepickerInputEvent<any>) {
  //   console.log('table.component - dateFilterChanged');
  //   // Date?
  //   if (filterDef.type === 'date') {
  //     // Date is one way binding: update the value manually
  //     filterDef.currentValue = event.value;
  //   }
  //   // Update filter
  //   this.filterChanged(filterDef, event);
  // }

  // toggleSelectionRow(row) {
  //   // Select
  //   this.dataSource.selectionModel.toggle(row);
  //   // Toggle
  //   row.selected = !row.selected;
  // }

  // public resetDialogTableFilter(filterDef: TableFilterDef) {
  //   console.log('table.component - resetDialogTableFilter');
  //   filterDef.currentValue = null;
  //   this.dataSource.filterChanged(filterDef)
  // }

  // public showDialogTableFilter(filterDef: TableFilterDef) {
  //   console.log('table.component - showDialogTableFilter');
  //   // Disable outside click close
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.disableClose = true;
  //   // Set Validate button title to 'Set Filter'
  //   dialogConfig.data = {
  //     validateButtonTitle : 'general.set_filter'
  //   };
  //   // Render the Dialog Container transparent
  //   dialogConfig.panelClass = 'transparent-dialog-container';
  //   // Show
  //   const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
  //   // Add sites
  //   dialogRef.afterClosed().subscribe(data => {
  //     if (data) {
  //       filterDef.currentValue = data;
  //       this.dataSource.filterChanged(filterDef)
  //     }
  //   });
  // }

  public actionTriggered(actionDef: TableActionDef, event?) {
    console.log('table.component - actionTriggered');
    // Slide?
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Reset Filters ?
    if (actionDef.id === 'reset_filters') {
      // Reset all filter fields
      this.dataSource.getTableFiltersDef().forEach((filterDef: TableFilterDef) => {
        switch (filterDef.type) {
          case 'dropdown':
            filterDef.currentValue = null;
            break;
          case 'dialog-table':
            filterDef.currentValue = null;
            break;
          case 'date':
            filterDef.reset();
            break;
        }
      });
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  // public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
  //   console.log('table.component - rowActionTriggered');
  //   // Get Actions def
  //   this.dataSource.rowActionTriggered(actionDef, rowItem, dropdownItem);
  // }

  // // Selects all rows if they are not all selected; otherwise clear selection.
  // public masterSelectToggle() {
  //   console.log('table.component - masterSelectToggle');
  //   this.isAllSelected() ?
  //     this.dataSource.selectionModel.clear() :
  //     this.dataSource.data.forEach(row => {
  //       if (row.isSelectable) {
  //         this.dataSource.selectionModel.select(row);
  //       }
  //     });
  // }

  // public handleSortChanged() {
  //   console.log('table.component - handleSortChanged');
  //   // Clear Selection
  //   this.dataSource.selectionModel.clear();
  //   // Load data
  //   this.loadData();
  // }

  // public trackByObjectId(index: number, item: any): any {
  //   // console.log('table.component - trackByObjectId');
  //   return item.id;
  // }

  public loadData() {
    console.log('table.component - loadData');
    // Load data source
    this.dataSource.loadDataAndFormat(false).subscribe(() => {console.log('Data Loaded')});
  }

  public showHideDetailsClicked(row) {
    console.log('table.component - showHideDetailsClicked');
    // Already Expanded
    if (!row.isExpanded) {
      // Already loaded?
      if (this.dataSource.tableDef.rowDetails.enabled && !row[this.dataSource.tableDef.rowDetails.detailsField]) {
        // Component?
        if (!this.dataSource.tableDef.rowDetails.isDetailComponent) {
          // No: Load details from data source
          this.dataSource.getRowDetails(row).subscribe((details) => {
            // Set details
            row[this.dataSource.tableDef.rowDetails.detailsField] = details;
            // No: Expand it!
            row.isExpanded = true;
          });
        } else {
          // // Yes: Find the container related to the row
          // this.detailComponentContainers.forEach((detailComponentContainer: DetailComponentContainer) => {
          //   if (detailComponentContainer.parentRow === row) {
          //     detailComponentContainer.loadComponent();
          //   }
          // });
          row.isExpanded = true;
        }
      } else {
        // Yes: Expand it!
        row.isExpanded = true;
      }
    } else {
      // Fold it
      row.isExpanded = false;
    }
  }
}
