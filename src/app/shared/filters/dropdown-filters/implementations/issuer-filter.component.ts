import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { FiltersService } from '../../filters.service';
import { BaseDropdownFilterComponent } from '../base-dropdown-filter.component';

@Component({
  selector: 'app-issuer-filter',
  templateUrl: '../base-dropdown-filter.component.html'
})
export class IssuerFilterComponent extends BaseDropdownFilterComponent{

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
    this.id = FilterIDs.ISSUER;
    this.httpId = FilterHttpIDs.ISSUER;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'issuer.title';
    this.label = '';
    this.visible = true;
    this.items = [
      { key: 'true', value: 'issuer.local' },
      { key: 'false', value: 'issuer.foreign' },
    ];
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
