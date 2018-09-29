import { TableFilter } from './table-filter';
import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { TableFilterDef } from '../../../common.types';
import { ChargersDialogComponent } from '../../dialogs/chargers/chargers-dialog-component';

export class ChargerTableFilter extends TableFilter  {
  constructor(
      protected translateService: TranslateService) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'charger',
      httpId: 'ChargeBoxID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: 'general.all',
      name: 'chargers.title',
      class: 'col-150',
      dialogComponent: ChargersDialogComponent
    };
    // Translate
    filterDef.defaultValue = translateService.instant(filterDef.defaultValue);
    filterDef.name = this.translateService.instant(filterDef.name);
    // Set
    this.setFilterDef(filterDef);
  }
}
