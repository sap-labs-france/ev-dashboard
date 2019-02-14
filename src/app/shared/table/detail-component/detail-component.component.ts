import { TableDef } from '../../../common.types';
import { Subject } from 'rxjs';

export abstract class DetailComponent {

  abstract setData(row: any, tableDef: TableDef);
  abstract refresh(row: any, autoRefresh?: boolean);
  abstract destroy();

}
