import {Log} from '../../../common.types';
import {logLevels} from '../logs.model';
import {Component, Input, Pipe, PipeTransform} from '@angular/core';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';
import {
  TYPE_DANGER,
  TYPE_DEFAULT,
  TYPE_INFO,
  TYPE_SUCCESS,
  TYPE_WARNING
} from '../../../shared/component/chip/chip.component';

@Component({
  selector: 'app-log-level-chip',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.level | appFormatLog:'class'" [disabled]="true">{{row.level | appFormatLog:'text' | translate}}</mat-chip>
    </mat-chip-list>
  `
})
export class LogLevelComponent extends CellContentTemplateComponent {
  @Input() row: Log;
}

@Pipe({name: 'appFormatLog'})
export class AppFormatLog implements PipeTransform {
  transform(logLevel: string, type: string): string {
    if (type === 'class') {
      return this.buildLogLevelClasses(logLevel);
    }
    if (type === 'text') {
      return this.buildLogLevelText(logLevel);
    }
  }

  buildLogLevelClasses(logLevel: string): string {
    let classNames = 'chip-width-5em ';
    switch (logLevel) {
      case 'E':
        classNames += TYPE_DANGER;
        break;

      case 'W':
        classNames += TYPE_WARNING;
        break;

      case 'I':
        classNames += TYPE_SUCCESS;
        break;

      case 'D':
        classNames += TYPE_INFO;
        break;

      default:
        classNames += TYPE_DEFAULT;
    }
    return classNames;
  }

  buildLogLevelText(logLevel: string): string {
    for (const level of logLevels) {
      if (logLevel === level.key) {
        return level.value;
      }
    }
  }
}
