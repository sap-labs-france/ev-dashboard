import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { BaseDropdownFilterComponent } from '../base-dropdown-filter.component';

@Component({
  selector: 'app-error-type-filter',
  templateUrl: '../base-dropdown-filter.component.html'
})
export class ErrorTypeFilterComponent extends BaseDropdownFilterComponent{

  public httpId: FilterHttpIDs;
  public currentValue: KeyValue[];
  public defaultValue: KeyValue[];
  public items: KeyValue[];
  public id: string;
  public label: string;
  public visible: boolean;
  public cssClass: string;
  public name: string;

  constructor(
    private translateService: TranslateService,
    private filtersService: FiltersService,
  ) {
    super();
    this.id = FilterIDs.ERROR_TYPE;
    this.httpId = FilterHttpIDs.ERROR_TYPE;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'errors.title';
    this.label = '';
    this.visible = true;
    this.items = this.filtersService.getFilterItemValue(FilterIDs.ERROR_TYPE);
  }

  public filterUpdated(event: any): void {
    const labels = event.value.map(val => val.value);
    this.label = labels.map(label => this.translateService.instant(label)).join(' , ');
    this.currentValue = event.value;
    this.filtersService.filterUpdated(this.getCurrentValueAsKeyValue());
  }

  protected getCurrentValueAsKeyValue(): KeyValue[] {
    return [{
      key: this.httpId,
      value: this.currentValue.map(val => val.key).join('|')
    }]
  }

  public reset(): void {
    this.currentValue = this.defaultValue;
    this.label = '';
  }


}
