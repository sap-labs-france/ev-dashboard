import {Log, TableColumnDef} from '../../../common.types';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {logLevels} from '../logs.model';
import {Component, Input, OnInit} from '@angular/core';
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
export class LogLevelComponent extends ChipComponent implements CellContentTemplateComponent, OnInit {
  @Input() row: Log;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    for (const level of logLevels) {
      if (level.key === this.row.level) {
        this.text = level.value
      }
    }
    this.type = "chip-width-5em ";
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
