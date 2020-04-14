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
      class: 'col-md-6 col-lg-2 col-xl-2',
      label: '',
      defaultValue: items[0],
      items: Object.assign([], items),
      multiple: true,
      exhaustive: true
    };
    // Set
    this.setFilterDef(filterDef);
  }
}

export const items: KeyValue[] = [
  {key: 'true', value: 'issuer.local'},
  {key: 'false', value: 'issuer.foreign'},
];
