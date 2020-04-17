import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingLink } from 'app/types/Setting';
import { FilterType, TableFilterDef } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';

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

  @Output() category = new EventEmitter();
  @Output() year = new EventEmitter();
  @Output() dateFrom = new EventEmitter();
  @Output() dateTo = new EventEmitter();

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
  private activeButtonOfScopeGroup!: StatisticsButtonGroup;

  constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
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
    this.filterParams = this.buildFilterValues();
    this.filters.emit(this.filterParams);
    this.update.emit(true);
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

  public buildFilterValues(): { [param: string]: string | string[]; } {
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
          } else {
            // Set it
            filterJson[filterDef.httpId] = filterDef.currentValue;
          }
        }
      });
    }
    return filterJson;
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

  refresh(): void {
    this.update.emit(true);
  }

  setActiveButtonOfScopeGroup(): void {
    // Button group for Scope: always active
    // Set first active button
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
