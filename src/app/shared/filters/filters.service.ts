import { Injectable } from '@angular/core';

import { FilterIDs } from '../../types/Filters';
import { KeyValue } from '../../types/GlobalType';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  private filterTypeList: FilterIDs[];
  private initList: any;
  private filtersValue: any;

  constructor() {
    this.filterTypeList = [];
    this.initList = {};
    this.filtersValue = {};
  }

  public setFilterList(
    filterTypeList: FilterIDs[],
    initList?: { [key in FilterIDs]?: any}
  ) {
    Object.assign(this.initList, initList);
    this.filterTypeList = filterTypeList;
  }

  public getFilterList(): any[] {
    return this.filterTypeList;
  }

  public filterUpdated(newValues: KeyValue[]) {
    for(const newValue of newValues){
      if(newValue.value) {
        this.filtersValue[newValue.key] = newValue.value;
      } else if(newValue.key in this.filtersValue) {
        delete this.filtersValue[newValue.key];
      }
    }
    console.log(this.filtersValue);
  }

  public getFilterItemValue(key: FilterIDs): any {
    return this.initList[key];
  }

  public getFilterValues(keys?: FilterIDs[]): any {
    return this.filtersValue;
  }

}
