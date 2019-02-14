import {Log} from '../../../common.types';
import {logLevels} from '../logs.model';
import {Component, Input} from '@angular/core';
import {
  ChipComponent,
  TYPE_DANGER,
  TYPE_DEFAULT,
  TYPE_INFO,
  TYPE_SUCCESS,
  TYPE_WARNING
} from '../../../shared/component/chip/chip.component';

@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../shared/component/chip/chip.component.html'
})
export class LogLevelComponent extends ChipComponent {
  @Input() row: Log;

  loadContent(): void {
    for (const level of logLevels) {
      if (level.key === this.row.level) {
        this.text = level.value
      }
    }
    this.type = 'chip-width-5em ';
    switch (this.row.level) {
      case 'E':
        this.type += TYPE_DANGER;
        break;

      case 'W':
        this.type += TYPE_WARNING;
        break;

      case 'I':
        this.type += TYPE_SUCCESS;
        break;

      case 'D':
        this.type += TYPE_INFO;
        break;

      default:
        this.type += TYPE_DEFAULT;
    }
  }
}
