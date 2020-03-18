import { FilterType, TableFilterDef } from 'app/types/Table';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';

export class IssuerFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'issuer',
      httpId: 'Issuer',
      type: FilterType.DROPDOWN,
      name: 'issuer.title',
      class: 'col-sm-4 col-md-3 col-lg-2 col-xl-1',
      label: '',
      currentValue: 'true',
      items: Object.assign([], items),
      multiple: false,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}

export const items: KeyValue[] = [
  {key: 'true', value: 'issuer.local'},
  {key: 'false', value: 'issuer.foreign'},
];
