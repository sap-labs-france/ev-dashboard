import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {CentralServerService } from '../../../services/central-server.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TableFilterDef} from '../../../common.types';
import {SitesTableFilter} from '../../../shared/table/filters/site-filter';
import {Constants} from '../../../utils/Constants';

@Component({
  selector: 'app-statistics-filters',
  templateUrl: './statistics-filters.component.html'
})

export class StatisticsFiltersComponent implements OnInit {
  private isAdmin: boolean;
  private ongoingRefresh = false;
  private selectedCategory = 'C';
  private selectedYear: number;
  private transactionYears: number[];
  @Input() tableFiltersDef: TableFilterDef[] = [];
  private filterParams = {};

  @Output() setCategory = new EventEmitter;
  @Output() setYear = new EventEmitter;
  @Output() setFilters = new EventEmitter;
  @Output() refreshAll = new EventEmitter;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();

    this.setCategory.emit(this.selectedCategory);

    this.selectedYear = new Date().getFullYear();
    this.setYear.emit(this.selectedYear);

    this.centralServerService.getTransactionYears().subscribe((transactionYears) => {
      this.transactionYears = transactionYears;
      if (this.transactionYears.indexOf(this.selectedYear) < 0) {
        this.transactionYears.push(this.selectedYear);
      }
    });

    if (this.tableFiltersDef) {
      const foundSitesFilter = this.tableFiltersDef.find((filterDef) => filterDef.id === 'sites');

// If Site ID filter is used and user has admin rights, restrict the selection to the first Site ID
      if (foundSitesFilter && this.isAdmin) {
        this.centralServerService.getSites([])
          .subscribe((sites) => {
            if (sites && sites.result.length > 0) {
              const firstSite = sites.result[0];
              const filterDef = new SitesTableFilter().getFilterDef();
              filterDef.currentValue = [{key: firstSite.id, value: firstSite.name, objectRef: firstSite}];
              this.filterChanged(filterDef);
            }
            this.filterParams = this.buildFilterValues();
            this.setFilters.emit(this.filterParams);

            this.refreshAll.emit();
          });
      } else {
        this.filterParams = this.buildFilterValues();
        this.setFilters.emit(this.filterParams);

        this.refreshAll.emit();
      }
    } else {
      this.filterParams = this.buildFilterValues();
      this.setFilters.emit(this.filterParams);

      this.refreshAll.emit();
    }
  }

  public filterChanged(filter: TableFilterDef) {
    // Update Filter
    const foundFilter = this.tableFiltersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });

    // Update value (if needed!)
    foundFilter.currentValue = filter.currentValue;
  }

  public resetFilters(): void {
    let filterWasChanged = false;

    const oldYear = this.selectedYear;

    this.selectedYear = new Date().getFullYear();
    if (oldYear !== this.selectedYear) {
      filterWasChanged = true;
      this.setYear.emit(this.selectedYear);
    }

    if (this.tableFiltersDef) {
      // Reset all filter fields
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
        switch (filterDef.type) {
          case 'dropdown':
            if (filterDef.currentValue && filterDef.currentValue !== null) { filterWasChanged = true; }
            filterDef.currentValue = null;
            break;
          case 'dialog-table':
            if (filterDef.currentValue && filterDef.currentValue !== null) { filterWasChanged = true; }
            filterDef.currentValue = null;
            break;
          case 'date':
            // to be sure:
            filterWasChanged = true;
            filterDef.reset();
            break;
        }
      });
    }

    if (filterWasChanged) {
      this.filterParams = this.buildFilterValues();
      this.setFilters.emit(this.filterParams);

      this.refreshAll.emit();
    }
  }

  public resetDialogTableFilter(filterDef: TableFilterDef): void {
    let filterWasChanged = false;

    if (filterDef.type === 'date') {
      // to be sure:
      filterWasChanged = true;
      filterDef.reset();
    } else {
      if (filterDef.currentValue && filterDef.currentValue !== null) { filterWasChanged = true; }
      filterDef.currentValue = null;
    }

    this.filterChanged(filterDef);

    if (filterWasChanged) {
      this.filterParams = this.buildFilterValues();
      this.setFilters.emit(this.filterParams);

      this.refreshAll.emit();
    }
  }

  public showDialogTableFilter(filterDef: TableFilterDef): void {
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    // Set Validate button title to 'Set Filter'
    dialogConfig.data = {
      validateButtonTitle : 'general.set_filter'
    };
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
    // Update value
    dialogRef.afterClosed().subscribe(data => {
      let filterWasChanged = false;
      if (data) {
        if (!filterDef.currentValue || filterDef.currentValue !== data) {
          filterWasChanged = true;
          filterDef.currentValue = data;
        };

        this.filterChanged(filterDef);

        if (filterWasChanged) {
          this.filterParams = this.buildFilterValues();
          this.setFilters.emit(this.filterParams);

          this.refreshAll.emit();
        }
      }
    });
  }

  public buildFilterValues(): Object {
    const filterJson = {};
    // Parse filters
    if (this.tableFiltersDef) {
      this.tableFiltersDef.forEach((filterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
          // Date
          if (filterDef.type === 'date') {
            filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
          // Table
          } else if (filterDef.type === Constants.FILTER_TYPE_DIALOG_TABLE) {
            if (filterDef.currentValue.length > 0) {
              if (filterDef.currentValue[0].key !== Constants.FILTER_ALL_KEY) {
                if (filterDef.currentValue.length > 1) {
                  // Handle multiple key selection as a JSON array
                  const jsonKeys = [];
                  for (let index = 0; index < filterDef.currentValue.length; index++) {
                    jsonKeys.push(filterDef.currentValue[index].key);
                  }
                  filterJson[filterDef.httpId] = JSON.stringify(jsonKeys);
                } else {
                  filterJson[filterDef.httpId] = filterDef.currentValue[0].key;
                }
              }
            }
          // Others
          } else {
            // Set it
            filterJson[filterDef.httpId] = filterDef.currentValue;
          }
        }
      });
    }

    return filterJson;
  }

  categoryChanged(): void {
    this.setCategory.emit(this.selectedCategory);

    this.refreshAll.emit();
  }

  yearChanged(): void {
    this.setYear.emit(this.selectedYear);

    this.refreshAll.emit();
  }

  refresh(): void {
    this.refreshAll.emit();
  }
}
