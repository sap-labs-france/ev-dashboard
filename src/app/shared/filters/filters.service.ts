import { Injectable } from '@angular/core';
import { BaseFilterDef, FilterHttpIDs } from 'types/Filters';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  private filterTypeList: FilterHttpIDs[];
  private filtersValue: BaseFilterDef[];
  private itemValueList: any;

  constructor() {
    console.log('Setting up service')
    this.filterTypeList = [];
    this.filtersValue = [];
    this.itemValueList = {};
  }

  public setFilterValue(baseDetails: BaseFilterDef) {
    const filter = this.filtersValue.find(filter => filter.httpId === baseDetails.httpId);
    if(!filter) {
      this.filtersValue.push(baseDetails);
    } else {
      filter.currentValue = baseDetails.currentValue;
    }
    console.log('Setting filter key');
  }

  public setFilterList(
    filterTypeList: FilterHttpIDs[],
    itemValueList?: { [key in FilterHttpIDs]?: any}
  ) {
    Object.assign(this.itemValueList, itemValueList);
    this.filterTypeList = filterTypeList;
  }

  public getFilterList(): any[] {
    return this.filterTypeList;
  }

  public getFilterItemValue(key: FilterHttpIDs): any {
    return this.itemValueList[key];
  }

  public setFilterItemValue(key: FilterHttpIDs, item: any) {
    this.itemValueList[key] = item;
  }

  public getFilterValues(keys?: FilterHttpIDs[]): any {
    const setFilterValue = {}
    keys = keys ? keys : this.filterTypeList;
    for(const key of keys) {
      const filter = this.filtersValue.find(filter => filter.httpId === key)
      if(filter && filter.currentValue) {
        setFilterValue[filter.httpId] = filter.currentValue;
      }
    }
    return setFilterValue;
  }

}
