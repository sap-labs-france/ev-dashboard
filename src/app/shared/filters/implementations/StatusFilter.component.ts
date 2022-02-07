import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';

// import { MultiSelectDropdownFilterComponent } from '../structures/multiselect-dropdown-filter.component';

@Component({
  selector: 'app-status-filter',
  template: '<div></div>'
})
export class StatusFilterComponent implements AfterViewInit{

  // @ViewChild(MultiSelectDropdownFilterComponent) multiSelectDropdownFilter: MultiSelectDropdownFilterComponent;

  ngAfterViewInit(){
    this.initFilter();
  }

  private initFilter() {
    // this.multiSelectDropdownFilter.initFilter({
    //   id: 'status',
    //   name: 'tags.status',
    //   currentValue: [],
    //   label: 'Current Status',
    //   cssClass: 'col-md-6 col-lg-2 col-xl-2',
    //   items: [
    //     { key: 'true', value: 'tags.activated' },
    //     { key: 'false', value: 'tags.deactivated' },
    //   ],
    //   multiple: true,
    // })
  }
}
