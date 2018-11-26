import {Log, TableColumnDef} from '../../../common.types';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {
  ChipComponent,
  TYPE_DANGER,
  TYPE_DEFAULT,
  TYPE_INFO,
  TYPE_PRIMARY,
  TYPE_WARNING
} from '../../../shared/component/chip/chip.component';
import {logLevels} from '../logs.model';

export class LogLevelComponent extends ChipComponent implements CellContentTemplateComponent {
  /**
   * setData
   */
  setData(log: Log, columndef: TableColumnDef) {
    for (const level of logLevels) {
      if (level.key === log.level) {
        this.text = level.value
      }
    }

    switch (log.level) {
      case 'E':
        this.type = TYPE_DANGER;
        break;

      case 'W':
        this.type = TYPE_WARNING;
        break;

      case 'I':
        this.type = TYPE_DEFAULT;
        break;

      case 'D':
        this.type = TYPE_INFO;
        break;

      default:
        this.type = TYPE_PRIMARY;
    }
  }
}
