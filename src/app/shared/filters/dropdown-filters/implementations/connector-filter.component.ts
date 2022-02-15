import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { CONNECTORS } from '../../../model/charging-stations.model';
import { FiltersService } from '../../filters.service';
import { BaseDropdownFilterComponent } from '../base-dropdown-filter.component';

@Component({
  selector: 'app-status-filter',
  templateUrl: '../base-dropdown-filter.component.html'
})
export class ConnectorFilterComponent extends BaseDropdownFilterComponent{

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
    this.id = FilterIDs.CONNECTOR;
    this.httpId = FilterHttpIDs.CONNECTOR;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'chargers.connector';
    this.label = '';
    this.items = [];
    this.visible = true;
    Object.assign(this.items, CONNECTORS);
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
