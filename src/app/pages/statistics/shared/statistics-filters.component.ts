import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import * as dayjs from 'dayjs';
import { WindowService } from 'services/window.service';
import { ChargingStationTableFilter } from 'shared/table/filters/charging-station-table-filter';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from 'shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from 'shared/table/filters/site-table-filter';
import { UserTableFilter } from 'shared/table/filters/user-table-filter';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { FilterParams } from '../../../types/GlobalType';
import { SettingLink } from '../../../types/Setting';
import { DateTimeRange, FilterType, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';

export interface StatisticsButtonGroup {
  name: string;
  title: string;
  inactive: boolean;
}

@Component({
  selector: 'app-statistics-filters',
  templateUrl: 'statistics-filters.component.html',
})
export class StatisticsFiltersComponent implements OnInit {
  @Input() public allYears ?= false;
  @Output() public category = new EventEmitter();
  @Output() public year = new EventEmitter();
  @Output() public dateFrom = new EventEmitter();
  @Output() public dateTo = new EventEmitter();
  @Output() public dateRange = new EventEmitter();
  @Output() public buttonOfScopeGroup = new EventEmitter();
  @Output() public filters = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public export = new EventEmitter();

  public ongoingRefresh = false;
  public isAdmin!: boolean;
  public selectedYear!: number;
  public transactionYears!: number[];
  public sacLinks!: SettingLink[];
  public sacLinksActive = false;
  public initDateRange = false;
  public dateRangeValue: any;
  public buttonsOfScopeGroup: StatisticsButtonGroup[] = [
    { name: 'month', title: 'statistics.graphic_title_month_x_axis', inactive: false },
    { name: 'total', title: 'statistics.total', inactive: false },
  ];
  public selectedCategory = 'C';
  public activeButtonOfScopeGroup!: StatisticsButtonGroup;
  public tableFiltersDef?: TableFilterDef[] = [];
  public filterAreaVisible = true;

  private filterParams = {};

  public constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    public windowService: WindowService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog
  ) {
    this.windowService.getFilterbarVisibleSubject().subscribe((filterAreaVisible) => {
      this.filterAreaVisible = filterAreaVisible;
    });
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    const issuerFilter = new IssuerFilter().getFilterDef();
    const dateRangeFilter = new DateRangeTableFilter({
      translateService: this.translateService
    }).getFilterDef();
    dateRangeFilter.dateRangeTableFilterDef.timePicker = false;
    this.tableFiltersDef.push(dateRangeFilter);
    const siteFilter = new SiteTableFilter([issuerFilter]).getFilterDef();
    this.tableFiltersDef.push(siteFilter);
    const siteAreaFilter = new SiteAreaTableFilter([issuerFilter, siteFilter]).getFilterDef();
    this.tableFiltersDef.push(siteAreaFilter);
    const chargingStationFilter = new ChargingStationTableFilter([issuerFilter, siteFilter, siteAreaFilter]).getFilterDef();
    this.tableFiltersDef.push(chargingStationFilter);
    const userFilter = new UserTableFilter([issuerFilter, siteFilter]).getFilterDef();
    this.tableFiltersDef.push(userFilter);
    if (!this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      siteFilter.visible = false;
      siteAreaFilter.visible = false;
    }
    if (this.isAdmin) {
      userFilter.visible = true;
    }
  }

  public ngOnInit(): void {
    this.category.emit(this.selectedCategory);
    this.selectedYear = new Date().getFullYear();
    this.year.emit(this.selectedYear);
    // Get the years from the existing transactions
    this.centralServerService.getTransactionYears().subscribe((transactionYears) => {
      this.transactionYears = transactionYears;
      if (!this.transactionYears) {
        this.transactionYears = [];
      }
      // To be safe always add the current year:
      if (this.transactionYears?.indexOf(this.selectedYear) < 0) {
        this.transactionYears.push(this.selectedYear);
      }
      if (this.allYears) {
        this.transactionYears.push(0); // 'all years' corresponds to year = 0
      }
    });
    // Get SAC links
    if (this.componentService.isActive(TenantComponents.ANALYTICS)) {
      this.componentService.getSacSettings().subscribe((sacSettings) => {
        if (this.isAdmin) {
          this.sacLinks = sacSettings.links;
        } else {
          this.sacLinks = [];
          for (const sacLink of sacSettings.links) {
            if (sacLink.role === 'D') {
              this.sacLinks.push(sacLink);
            }
          }
        }
        if (!Utils.isEmptyArray(this.sacLinks)) {
          this.sacLinksActive = true;
        } else {
          this.sacLinksActive = false;
        }
      });
    }
    this.setActiveButtonOfScopeGroup();
    this.setDateRangeFilterYear(true);
    this.filterParams = this.buildFilterValues();
    this.filters.emit(this.filterParams);
    this.update.emit(true);
  }

  public dateTimeRangeChanged(filterDef: TableFilterDef, dateRangeValue: DateTimeRange) {
    filterDef.currentValue = dateRangeValue;
    // Update filter
    this.filterChanged(filterDef);
    if (!this.initDateRange) {
      // set year to -1 to reset filter year
      this.selectedYear = -1;
    } else {
      this.initDateRange = false;
    }
    // update year and filter
    this.yearChanged(true, false);
  }



  public filterChanged(filter: TableFilterDef): void {
    // Update Filter
    const foundFilter = this.tableFiltersDef.find((filterDef) => filterDef.id === filter.id);
    // Update value (if needed!)
    if (foundFilter) {
      foundFilter.currentValue = filter.currentValue;
    }
    if (filter.multiple) {
      this.updateFilterLabel(filter);
    }
  }

  public updateFilterLabel(filter: TableFilterDef) {
    if (Array.isArray(filter.currentValue)) {
      if (filter.currentValue.length > 0) {
        filter.label = this.translateService.instant(filter.currentValue[0].value) +
          (filter.currentValue.length > 1 ? ` (+${filter.currentValue.length - 1})` : '');
      } else {
        filter.label = '';
      }
    }
  }

  public resetFilters(): void {
    let filterIsChanged = false;
    // Handle year
    const oldYear = this.selectedYear;
    this.selectedYear = new Date().getFullYear();
    if (oldYear !== this.selectedYear) {
      filterIsChanged = true;
      this.yearChanged(false);
    }
    // Handle filters
    if (this.tableFiltersDef) {
      // Reset all filter fields
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
        switch (filterDef.type) {
          case FilterType.DROPDOWN:
          case FilterType.DIALOG_TABLE:
            const filterIsInitial = this.testIfFilterIsInitial(filterDef);
            if (!filterIsInitial) {
              filterIsChanged = true;
            }
            if (filterDef.multiple) {
              filterDef.currentValue = [];
              filterDef.label = '';
            } else {
              filterDef.currentValue = null;
            }
            break;
        }
      });
    }
    // Changed?
    if (filterIsChanged) {
      // Set & Reload all
      this.filterParams = this.buildFilterValues();
      this.filters.emit(this.filterParams);
      this.update.emit(true);
    }
  }

  public resetDialogTableFilter(filterDef: TableFilterDef): void {
    let filterIsChanged = false;
    if ((filterDef.type === FilterType.DROPDOWN)
      || (filterDef.type === FilterType.DIALOG_TABLE)) {
      filterIsChanged = !this.testIfFilterIsInitial(filterDef);
      if (filterDef.multiple) {
        filterDef.currentValue = [];
        filterDef.label = '';
      } else {
        filterDef.currentValue = null;
      }
    }
    this.filterChanged(filterDef);
    if (filterIsChanged) {
      this.filterParams = this.buildFilterValues();
      this.filters.emit(this.filterParams);
      this.update.emit(true);
    }
  }

  public showDialogTableFilter(filterDef: TableFilterDef): void {
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {};
    // Rebuild static filters from dependant ones
    Utils.buildDependentFilters(filterDef);
    if (filterDef.dialogComponentData) {
      Object.assign(dialogConfig.data, filterDef.dialogComponentData);
    }
    // Show
    if (filterDef.cleared) {
      dialogConfig.data.cleared = true;
      filterDef.cleared = false;
    }
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
    // Update value
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        let dataIsChanged = false;
        if (this.testIfFilterIsInitial(filterDef)
          || filterDef.currentValue !== data) {
          dataIsChanged = true;
        }
        filterDef.currentValue = data;
        this.filterChanged(filterDef);
        if (dataIsChanged) {
          this.filterParams = this.buildFilterValues();
          this.filters.emit(this.filterParams);
          this.update.emit(true);
        }
      }
    });
  }

  public buildFilterValues(): FilterParams {
    const filterJson = {};
    // Parse filters
    if (this.tableFiltersDef) {
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== FilterType.ALL_KEY) {
          // Dialog without multiple selections
          if (filterDef.type === FilterType.DIALOG_TABLE && !filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              if (filterDef.currentValue[0].key !== FilterType.ALL_KEY) {
                if (filterDef.currentValue.length > 1) {
                  // Handle multiple key selection as a JSON array
                  const jsonKeys = [];
                  for (const value of filterDef.currentValue) {
                    jsonKeys.push(value.key);
                  }
                  filterJson[filterDef.httpID] = JSON.stringify(jsonKeys);
                } else {
                  filterJson[filterDef.httpID] = filterDef.currentValue[0].key;
                }
              }
            }
            // Dialog with multiple selections
          } else if (filterDef.type === FilterType.DIALOG_TABLE && filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              filterJson[filterDef.httpID] = filterDef.currentValue.map((obj) => obj.key).join('|');
            }
            // Dropdown with multiple selections
          } else if (filterDef.type === FilterType.DROPDOWN && filterDef.multiple && filterDef.currentValue.length > 0) {
            filterJson[filterDef.httpID] = filterDef.currentValue.map((obj) => obj.key).join('|');
            // Others
          } else if (filterDef.type === FilterType.DATE_RANGE) {
            if (!filterDef.currentValue.startDate) {
              filterJson[filterDef.dateRangeTableFilterDef?.startDateTimeHttpID] = dayjs().startOf('y').toISOString();
            } else {
              filterJson[filterDef.dateRangeTableFilterDef?.startDateTimeHttpID] = filterDef.currentValue.startDate.toISOString();
            }
            if (!filterDef.currentValue.endDate) {
              filterJson[filterDef.dateRangeTableFilterDef?.endDateTimeHttpID] = dayjs().endOf('d').toISOString();
            } else {
              filterJson[filterDef.dateRangeTableFilterDef?.endDateTimeHttpID] = filterDef.currentValue.endDate.toISOString();
            }
          // Others
          } else {
            // Set it
            filterJson[filterDef.httpID] = filterDef.currentValue;
          }
        }
      });
    }
    return filterJson;
  }

  public categoryChanged(): void {
    this.category.emit(this.selectedCategory);
    this.update.emit(true);
  }

  public yearChanged(refresh = true, setDate = true): void {
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
      if (setDate) {
        this.setDateRangeFilterYear();
      }
      this.filterParams = this.buildFilterValues();
      this.filters.emit(this.filterParams);
    }

    this.year.emit(this.selectedYear);

    if (refresh) {
      this.update.emit(true);
    }
  }

  public refresh(): void {
    this.update.emit(true);
  }

  public setActiveButtonOfScopeGroup(): void {
    // Button group for Scope: always active
    // Set first active button
    const firstActiveButton = this.buttonsOfScopeGroup.find((button) => button.inactive === false);
    if (firstActiveButton && (firstActiveButton !== this.activeButtonOfScopeGroup)) {
      this.activeButtonOfScopeGroup = firstActiveButton;
      this.buttonOfScopeGroup.emit(this.activeButtonOfScopeGroup.name);
    }
  }

  public buttonOfScopeGroupChanged(buttonName: string): void {
    const index = this.buttonsOfScopeGroup.findIndex((element) => element.name === buttonName);
    if (index >= 0 &&
      this.activeButtonOfScopeGroup.name !== buttonName &&
      this.buttonsOfScopeGroup[index].inactive === false) {
      this.activeButtonOfScopeGroup = this.buttonsOfScopeGroup[index];
      this.buttonOfScopeGroup.emit(this.activeButtonOfScopeGroup.name);
      this.update.emit(false);
    }
  }

  public exportData(): void {
    this.export.emit();
  }

  // set Date Filter to corresponding year
  private setDateRangeFilterYear(init = false): void {
    this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
      if (filterDef.type === FilterType.DATE_RANGE) {
        if (init) {
          this.initDateRange = true;
        }
        if (this.selectedYear === 0) {
          filterDef.currentValue = {
            startDate: dayjs(new Date(this.transactionYears[0], 0, 1)),
            endDate: dayjs(),
          };
        } else {
          filterDef.currentValue = {
            startDate: dayjs(new Date(this.selectedYear, 0, 1)),
            endDate: dayjs(new Date(this.selectedYear + 1, 0, 1))
          };
        }
      }
    });
  }

  private testIfFilterIsInitial(filterDef: TableFilterDef): boolean {
    let filterIsInitial = true;
    if (filterDef.multiple) {
      if (!Utils.isEmptyArray(filterDef.currentValue) || (filterDef.label && !Utils.isEmptyString(filterDef.label))) {
        filterIsInitial = false;
      }
    } else {
      if (filterDef.currentValue && filterDef.currentValue !== null) {
        filterIsInitial = false;
      }
    }
    return filterIsInitial;
  }

}
