import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class IssuerFilter extends TableFilter {
  public constructor(defaultValue = true) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'issuer',
      httpID: 'Issuer',
      type: FilterType.DROPDOWN,
      name: 'issuer.title',
      label: '',
      defaultValue: defaultValue ? Organizations[0] : Organizations[1],
      items: [...Organizations],
      multiple: true,
      exhaustive: true
    };
    if (!defaultValue) {
      filterDef.defaultValue = Organizations[1];
    }
    // Set
    this.setFilterDef(filterDef);
  }
}

export const Organizations: KeyValue[] = [
  { key: 'true', value: 'issuer.local' },
  { key: 'false', value: 'issuer.foreign' },
];
