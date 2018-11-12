import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';

export class TransactionsChargerFilter extends ChargerTableFilter {
  constructor() {
    super();
    const filter = this.getFilterDef();
    filter.httpId = 'ChargeBoxID';
  }
}
