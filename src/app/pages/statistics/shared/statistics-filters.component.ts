import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { DaterangepickerComponent, DaterangepickerDirective } from 'ngx-daterangepicker-material';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { LocaleService } from '../../../services/locale.service';
import { FilterParams } from '../../../types/GlobalType';
import { SettingLink } from '../../../types/Setting';
import { FilterType, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';

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
  templateUrl: './statistics-filters.component.html',
})
export class StatisticsFiltersComponent implements OnInit {
  public ongoingRefresh = false;
  public isAdmin!: boolean;
  public isOrganizationActive!: boolean;
  public selectedYear!: number;
  public transactionYears!: number[];
  public sacLinks!: SettingLink[];
  public sacLinksActive = false;
  public initDateRange = false;
  public dateRangeValue: any;
  @ViewChild(DaterangepickerComponent) public dateRangePickerComponent: DaterangepickerComponent;

  @ViewChild(DaterangepickerDirective) public picker: DaterangepickerDirective;
  @Output() public category = new EventEmitter();
  @Output() public year = new EventEmitter();
  @Output() public dateFrom = new EventEmitter();
  @Output() public dateTo = new EventEmitter();
  @Output() public dateRange = new EventEmitter();

  @Input() public allYears ?= false;
  public buttonsOfScopeGroup: StatisticsButtonGroup[] = [
    { name: 'month', title: 'statistics.graphic_title_month_x_axis', inactive: false },
    { name: 'total', title: 'statistics.total', inactive: false },
  ];
  @Output() public buttonOfScopeGroup = new EventEmitter();
  @Input() public tableFiltersDef?: TableFilterDef[] = [];
  public statFiltersDef: StatisticsFilterDef[] = [];
  @Output() public filters = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public export = new EventEmitter();

  public selectedCategory = 'C';
  public activeButtonOfScopeGroup!: StatisticsButtonGroup;
  private filterParams = {};
  private language!: string;


  constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private localeService: LocaleService,
    private dialog: MatDialog) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.language = locale.language;
      moment.locale(this.language);
    });
  }
  public openDateRange() {
    this.picker.open();
  }

  public ngOnInit(): void {
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.isOrganizationActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    this.category.emit(this.selectedCategory);

    this.selectedYear = new Date().getFullYear();
    this.year.emit(this.selectedYear);
    // Get the years from the existing transactions
    this.centralServerService.getTransactionYears().subscribe((transactionYears) => {
      this.transactionYears = transactionYears;
      // To be safe always add the current year:
      if (this.transactionYears.indexOf(this.selectedYear) < 0) {
        this.transactionYears.push(this.selectedYear);
      }
      if (this.allYears) {
        this.transactionYears.push(0); // 'all years' corresponds to year = 0
      }
    });
    // Get SAC links
    this.componentService.getSacSettings(true).subscribe((sacSettings) => {
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
        tableFilterDef.multiple = true;
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
    this.setDateFilterYear();
    this.setDateRangeFilterYear(true);
    this.filterParams = this.buildFilterValues();
    this.filters.emit(this.filterParams);
    this.update.emit(true);
  }

  public dateRangeChange(filterDef: StatisticsFilterDef, event): void {
    if (filterDef.type === 'date-range' && event.hasOwnProperty('startDate') && event.hasOwnProperty('endDate')) {
      filterDef.currentValue = event ? event : null;
    } else {
      const dateRange = event.currentTarget.value;
      if (dateRange.split('-').length - 1 !== 1) {
        this.setDateRangeFilterYear(false);
      } else {
        const startDate = moment(dateRange.split('-')[0]);
        const endDate = moment(dateRange.split('-')[1]);
        if (!startDate.isValid() || !endDate.isValid()) {
          this.setDateRangeFilterYear(false);
        } else {
          if (startDate > endDate) {
            this.setDateRangeFilterYear(false);
          } else {
            filterDef.currentValue = {
              startDate,
              endDate
            };
          }
        }
      }
    }
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



  public filterChanged(filter: StatisticsFilterDef): void {
    // Update Filter
    const foundFilter = this.statFiltersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });
    // Update value (if needed!)
    if (foundFilter) {
      foundFilter.currentValue = filter.currentValue;
    }
    if (filter.multiple) {
      this.updateFilterLabel(filter);
    }
  }

  public updateFilterLabel(filter: StatisticsFilterDef) {
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
    if (this.statFiltersDef) {
      // Reset all filter fields
      this.statFiltersDef.forEach((filterDef: StatisticsFilterDef) => {
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

  public resetDialogTableFilter(filterDef: StatisticsFilterDef): void {
    let filterIsChanged = false;
    if (filterDef.type === FilterType.DATE) {
      filterIsChanged = true;
      if (filterDef.reset) {
        filterDef.reset();
      }
    } else if ((filterDef.type === FilterType.DROPDOWN)
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

  public showDialogTableFilter(filterDef: StatisticsFilterDef): void {
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    // Set Validate button title to 'Set Filter'
    dialogConfig.data = {
      validateButtonTitle: 'general.set_filter',
    };
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    if (filterDef.cleared) {
      dialogConfig.data.cleared = true;
      filterDef.cleared = false;
    }
    const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
    // Update value
    dialogRef.afterClosed().subscribe((data) => {
      // dialogRef.afterClosed().pipe(takeWhile(() => this.alive)).subscribe(data => {
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
    if (this.statFiltersDef) {
      this.statFiltersDef.forEach((filterDef: StatisticsFilterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== FilterType.ALL_KEY) {
          // Date
          if (filterDef.type === FilterType.DATE) {
            filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
            // Dialog without multiple selections
          } else if (filterDef.type === FilterType.DIALOG_TABLE && !filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              if (filterDef.currentValue[0].key !== FilterType.ALL_KEY) {
                if (filterDef.currentValue.length > 1) {
                  // Handle multiple key selection as a JSON array
                  const jsonKeys = [];
                  for (const value of filterDef.currentValue) {
                    jsonKeys.push(value.key);
                  }
                  filterJson[filterDef.httpId] = JSON.stringify(jsonKeys);
                } else {
                  filterJson[filterDef.httpId] = filterDef.currentValue[0].key;
                }
              }
            }
            // Dialog with multiple selections
          } else if (filterDef.type === FilterType.DIALOG_TABLE && filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              filterJson[filterDef.httpId] = filterDef.currentValue.map((obj) => obj.key).join('|');
            }
            // Dropdown with multiple selections
          } else if (filterDef.type === FilterType.DROPDOWN && filterDef.multiple) {
            if (filterDef.currentValue.length > 0) {
              filterJson[filterDef.httpId] = filterDef.currentValue.map((obj) => obj.key).join('|');
            }
            // Others
          } else if (filterDef.type === FilterType.DATE_RANGE) {
            if (!filterDef.currentValue.startDate) {
              filterJson['StartDateTime'] = moment().startOf('y').toISOString();
            } else {
              filterJson['StartDateTime'] = filterDef.currentValue.startDate.toISOString();
            }
            if (!filterDef.currentValue.endDate) {
              filterJson['EndDateTime'] = moment().endOf('d').toISOString();
            } else {
              filterJson['EndDateTime'] = filterDef.currentValue.endDate.toISOString();
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
      this.setDateFilterYear();
      this.filterParams = this.buildFilterValues();
      this.filters.emit(this.filterParams);
    }

    this.year.emit(this.selectedYear);

    if (refresh) {
      this.update.emit(true);
    }
  }

  public dateFilterChanged(filterDef: StatisticsFilterDef, event: MatDatetimepickerInputEvent<any>) {
    // Date?
    if (filterDef.type === 'date') {
      filterDef.currentValue = event.value ? event.value.toDate() : null;
    }
    // Update filter
    this.filterChanged(filterDef);

    // set year to -1 to reset filter year
    this.selectedYear = -1;
    // update year and filter
    this.yearChanged();
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
    this.statFiltersDef.forEach((filterDef: StatisticsFilterDef) => {
      if (filterDef.type === FilterType.DATE_RANGE) {
        if (init) {
          this.initDateRange = true;
          filterDef.dateRangeTableFilterDef.locale = {
            daysOfWeek: moment.weekdaysMin(),
            monthNames: moment.monthsShort(),
            firstDay: moment.localeData().firstDayOfWeek()
          };
        }
        if (this.selectedYear === 0) {
          filterDef.currentValue = {
            startDate: moment(new Date(this.transactionYears[0], 0, 1)),
            endDate: moment(),
          };
        } else {
          filterDef.currentValue = {
            startDate: moment(new Date(this.selectedYear, 0, 1)),
            endDate: moment(new Date(this.selectedYear + 1, 0, 1))
          };
        }
      }
    });
  }

  // set Date Filter to corresponding year
  private setDateFilterYear(): void {
    this.statFiltersDef.forEach((filterDef: StatisticsFilterDef) => {
      if (filterDef.type === FilterType.DATE) {
        if (this.selectedYear === 0) {
          if (filterDef.id === 'dateFrom') {
            filterDef.currentValue = new Date(this.transactionYears[0], 0, 1);
          } else if (filterDef.id === 'dateUntil') {
            filterDef.currentValue = new Date();
          }
        } else if (this.selectedYear > 0) {
          if (filterDef.id === 'dateFrom') {
            filterDef.currentValue = new Date(this.selectedYear, 0, 1);
          } else if (filterDef.id === 'dateUntil') {
            filterDef.currentValue = new Date(this.selectedYear + 1, 0, 1);
          }
        }
      }
    });
  }

  private testIfFilterIsInitial(filterDef: StatisticsFilterDef): boolean {
    let filterIsInitial = true;
    if (filterDef.multiple) {
      if ((filterDef.currentValue && Array.isArray(filterDef.currentValue)
        && filterDef.currentValue.length > 0)
        || (filterDef.label && filterDef.label !== '')) {
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
