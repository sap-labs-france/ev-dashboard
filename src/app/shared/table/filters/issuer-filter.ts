import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class IssuerFilter extends TableFilter {
  public constructor(defaultValue = true) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'issuer',
      httpId: 'Issuer',
      type: FilterType.DROPDOWN,
      name: 'issuer.title',
      class: 'col-md-6 col-lg-2 col-xl-2',
      label: '',
      defaultValue: organisations[0],
      items: Object.assign([], organisations),
      multiple: true,
      exhaustive: true
    };
    if (!defaultValue) {
      filterDef.defaultValue = organisations[1];
    }
    // Set
    this.setFilterDef(filterDef);
  }
}

export const organisations: KeyValue[] = [
  { key: 'true', value: 'issuer.local' },
  { key: 'false', value: 'issuer.foreign' },
];
