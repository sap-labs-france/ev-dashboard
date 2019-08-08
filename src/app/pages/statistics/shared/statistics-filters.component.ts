import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AnalyticsLink } from 'app/common.types';
import { TableFilterDef } from '../../../common.types';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentEnum, ComponentService } from '../../../services/component.service';
import { SitesTableFilter } from '../../../shared/table/filters/sites-table-filter';
import { Constants } from '../../../utils/Constants';

export interface StatisticsButtonGroup {
  name: string;
  title: string;
  inactive: boolean;
}

interface StatisticsFilterDef extends TableFilterDef {
  hidden: boolean;
}

@Component({
  selector: 'app-statistics-filters',
  templateUrl: './statistics-filters.component.html'
})
export class StatisticsFiltersComponent implements OnInit {
  public ongoingRefresh = false;
  public isAdmin: boolean;
  public isOrganizationActive: boolean;
  public selectedYear: number;
  public transactionYears: number[];
  public sacLinks: AnalyticsLink[];
  public sacLinksActive = false;

  @Output() category = new EventEmitter();
  @Output() year = new EventEmitter();
  @Input() allYears ?= false;
  public buttonsOfScopeGroup: StatisticsButtonGroup[] = [
    { name: 'total', title: 'statistics.total', inactive: false },
    { name: 'month', title: 'statistics.graphic_title_month_x_axis', inactive: false },
  ];
  @Output() buttonOfScopeGroup = new EventEmitter();
  @Input() tableFiltersDef?: TableFilterDef[] = [];
  public statFiltersDef: StatisticsFilterDef[] = [];
  @Output() filters = new EventEmitter();
  @Output() update = new EventEmitter();
  @Output() export = new EventEmitter();

  private selectedCategory = 'C';
  private filterParams = {};
  private activeButtonOfScopeGroup: StatisticsButtonGroup;

  constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.isOrganizationActive = this.componentService.isActive(ComponentEnum.ORGANIZATION);
    this.category.emit(this.selectedCategory);

    this.selectedYear = new Date().getFullYear();
    this.year.emit(this.selectedYear);
    // Get the years from the existing transactions
    this.centralServerService.getTransactionYears().subscribe((transactionYears) => {
      this.transactionYears = transactionYears;
      // to be safe always add the current year:
      if (this.transactionYears.indexOf(this.selectedYear) < 0) {
        this.transactionYears.push(this.selectedYear);
      }
      if (this.allYears) {
        this.transactionYears.push(0); // 'all years' corresponds to year = 0
      }
    });

    // Get SAC links
    this.componentService.getSacSettings(true).subscribe((sacSettings) => {
      this.sacLinks = sacSettings.links;
      if (Array.isArray(this.sacLinks) && this.sacLinks.length > 0) {
        this.sacLinksActive = true;
      } else {
        this.sacLinksActive = false;
      }
    });

    this.setActiveButtonOfScopeGroup();

    // Provided filters
    if (this.tableFiltersDef) {
      for (const tableFilterDef of this.tableFiltersDef) {
        switch (tableFilterDef.id) {
          case 'sites':
          case 'siteAreas':
            if (this.isOrganizationActive) {
              this.statFiltersDef.push({ ...tableFilterDef, hidden: false });
            }
            break;
          case 'user':
            if (this.isAdmin) {
              this.statFiltersDef.push({ ...tableFilterDef, hidden: false });
            }
            break;
          default:
            this.statFiltersDef.push({ ...tableFilterDef, hidden: false });
        }
      }
    }
    // if (this.statFiltersDef) {
    //   // Site filter
    //   const foundSitesFilter = this.statFiltersDef.find((filterDef: StatisticsFilterDef) => {
    //     return (filterDef.id === 'sites' && filterDef.hidden === false);
    //   });
    //   // If Site ID filter is used and user has admin rights, restrict the selection to the first Site ID
    //   if (foundSitesFilter && this.isAdmin) {
    //     // Get the sites
    //     this.centralServerService.getSites([]).subscribe((sites) => {
    //       if (sites && sites.result.length > 0) {
    //         const firstSite = sites.result[0];
    //         const tableFilterDef = new SitesTableFilter().getFilterDef();
    //         tableFilterDef.currentValue = [{ key: firstSite.id, value: firstSite.name, objectRef: firstSite }];
    //         this.filterChanged({ ...tableFilterDef, hidden: false });
    //       }
    //       this.filterParams = this.buildFilterValues();
    //       this.filters.emit(this.filterParams);
    //       this.update.emit(true);
    //     });
    //   } else {
    //     this.filterParams = this.buildFilterValues();
    //     this.filters.emit(this.filterParams);
    //     this.update.emit(true);
    //   }
    // } else {
    this.filterParams = this.buildFilterValues();
    this.filters.emit(this.filterParams);
    this.update.emit(true);
    //    }
  }

  public filterChanged(filter: StatisticsFilterDef): void {
    // Update Filter
    const foundFilter = this.statFiltersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });
    // Update value (if needed!)
    foundFilter.currentValue = filter.currentValue;
  }

  public resetFilters(): void {
    let filterWasChanged = false;
    // Handle year
    const oldYear = this.selectedYear;
    this.selectedYear = new Date().getFullYear();
    if (oldYear !== this.selectedYear) {
      filterWasChanged = true;
      this.yearChanged(false);
    }
    // Handle filters
    if (this.statFiltersDef) {
      // Reset all filter fields
      this.statFiltersDef.forEach((filterDef: StatisticsFilterDef) => {
        switch (filterDef.type) {
          case 'dropdown':
            if (filterDef.currentValue && filterDef.currentValue !== null) {
              filterWasChanged = true;
            }
            filterDef.currentValue = null;
            break;
          case 'dialog-table':
            if (filterDef.currentValue && filterDef.currentValue !== null) {
              filterWasChanged = true;
            }
            filterDef.currentValue = null;
            break;
          case 'date':
            filterWasChanged = true;
            filterDef.reset();
            break;
        }
      });
    }
    // Changed?
    if (filterWasChanged) {
      // Set & Reload all
      this.filterParams = this.buildFilterValues();
      this.filters.emit(this.filterParams);
      this.update.emit(true);
    }
  }

  public resetDialogTableFilter(filterDef: StatisticsFilterDef): void {
    let filterWasChanged = false;
    if (filterDef.type === 'date') {
      filterWasChanged = true;
      filterDef.reset();
    } else {
      if (filterDef.currentValue && filterDef.currentValue !== null) {
        filterWasChanged = true;
      }
      filterDef.currentValue = null;
    }
    this.filterChanged(filterDef);
    if (filterWasChanged) {
      this.filterParams = this.buildFilterValues();
      this.filters.emit(this.filterParams);
      this.update.emit(true);
    }
  }

  public showDialogTableFilter(filterDef: StatisticsFilterDef): void {
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    // Set Validate button title to 'Set Filter'
    dialogConfig.data = {
      validateButtonTitle: 'general.set_filter'
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
        }
        this.filterChanged(filterDef);
        if (filterWasChanged) {
          this.filterParams = this.buildFilterValues();
          this.filters.emit(this.filterParams);
          this.update.emit(true);
        }
      }
    });
  }

  public buildFilterValues(): Object {
    const filterJson = {};
    // Parse filters
    if (this.statFiltersDef) {
      this.statFiltersDef.forEach((filterDef: StatisticsFilterDef) => {
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
    this.category.emit(this.selectedCategory);
    this.update.emit(true);
  }

  yearChanged(refresh = true): void {
    if (this.allYears) {
      if (this.selectedYear > 0) {
        this.buttonsOfScopeGroup[1].inactive = false;
      } else {
        this.buttonsOfScopeGroup[1].inactive = true;
      }
      const index = this.buttonsOfScopeGroup.findIndex((button) => button.name === this.activeButtonOfScopeGroup.name);
      if (index >= 0 && this.buttonsOfScopeGroup[index].inactive) {
        this.setActiveButtonOfScopeGroup();
      }
    }

    this.year.emit(this.selectedYear);

    if (refresh) {
      this.update.emit(true);
    }
  }

  refresh(): void {
    this.update.emit(true);
  }

  setActiveButtonOfScopeGroup(): void {
    // Button group for Scope: always active
    // set to first active button:
    const firstActiveButton = this.buttonsOfScopeGroup.find((button) => button.inactive === false);
    if (firstActiveButton && (firstActiveButton !== this.activeButtonOfScopeGroup)) {
      this.activeButtonOfScopeGroup = firstActiveButton;
      this.buttonOfScopeGroup.emit(this.activeButtonOfScopeGroup.name);
    }
  }

  buttonOfScopeGroupChanged(buttonName: string): void {
    const index = this.buttonsOfScopeGroup.findIndex((element) => element.name === buttonName);
    if (index >= 0 &&
      this.activeButtonOfScopeGroup.name !== buttonName &&
      this.buttonsOfScopeGroup[index].inactive === false) {
      this.activeButtonOfScopeGroup = this.buttonsOfScopeGroup[index];
      this.buttonOfScopeGroup.emit(this.activeButtonOfScopeGroup.name);
      this.update.emit(false);
    }
  }

  exportData(): void {
    this.export.emit();
  }

}
