import {Constants} from '../../../utils/Constants';
import {TableFilter} from '../../../shared/table/filters/table-filter';
import {TableFilterDef} from '../../../common.types';
import {KeyValue} from 'app/common.types';

export const errorTypes: KeyValue[] = [
  {key: 'missingSettings', value: 'chargers.errors.missingSettings.title'},
  {key: 'connectionBroken', value: 'chargers.errors.connectionBroken.title'},
  {key: 'missingSiteArea', value: 'chargers.errors.missingSiteArea.title'},
  {key: 'connectorError', value: 'chargers.errors.connectorError.title'}
];

export class ChargerErrorTypeTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'errorType',
      httpId: 'ErrorType',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'chargers.errors.filter_title',
      class: 'col-sm-4 col-md-4 col-lg-3 col-xl-2 ',
      currentValue: Constants.FILTER_ALL_KEY,
      items: Object.assign([], errorTypes)
    };
    filterDef.items.unshift({key: Constants.FILTER_ALL_KEY, value: 'general.all'});
    // Set
    this.setFilterDef(filterDef);
  }
}
