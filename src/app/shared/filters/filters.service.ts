import { Injectable } from '@angular/core';

import { BaseFilterDef, DateRangeCurrentValue, FilterHttpIDs, FilterIDs } from '../../types/Filters';
import { KeyValue } from '../../types/GlobalType';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  private filterTypeList: FilterIDs[];
  private filtersValue: BaseFilterDef[];
  private itemValueList: any;

  constructor() {
    this.filterTypeList = [];
    this.filtersValue = [];
    this.itemValueList = {};
  }

  public setFilterValue(baseDetails: BaseFilterDef) {
    const filter = this.filtersValue.find(filter => filter.id === baseDetails.id);
    if(!filter) {
      this.filtersValue.push(baseDetails);
    } else {
      filter.currentValue = baseDetails.currentValue;
    }
    console.log(this.getFilterValues());
  }

  public setFilterList(
    filterTypeList: FilterIDs[],
    itemValueList?: { [key in FilterIDs]?: any}
  ) {
    Object.assign(this.itemValueList, itemValueList);
    this.filterTypeList = filterTypeList;
  }

  public getFilterList(): any[] {
    return this.filterTypeList;
  }

  public getFilterItemValue(key: FilterIDs): any {
    return this.itemValueList[key];
  }

  public getFilterValues(keys?: FilterIDs[]): any {
    const setFilterValue = {}
    keys = keys ? keys : this.filterTypeList;
    for(const key of keys) {
      const filter = this.filtersValue.find(filter => filter.id === key)
      if(filter && filter.currentValue) {
        if(filter.httpId !== FilterHttpIDs.ALTERNATE) {
          const currentValue = filter.currentValue as string[] | KeyValue[];
          if(currentValue.length > 0) {
            setFilterValue[filter.httpId] = currentValue;
          }
        } else {
          const currentValue = filter.currentValue as DateRangeCurrentValue;
          setFilterValue[filter.startDateTimeHttpId] = currentValue.startDate.toDate();
          setFilterValue[filter.endDateTimeHttpId] = currentValue.endDate.toDate();
        }
      }
    }
    return setFilterValue;
  }

}
