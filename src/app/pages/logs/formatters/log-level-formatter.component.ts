import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Constants } from 'app/utils/Constants';
import { logLevels } from '../model/logs.model';
import { Log } from 'app/types/Log';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.level | appFormatLogLevel:'class'" [disabled]="true">
        {{row.level | appFormatLogLevel:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class LogLevelFormatterComponent extends CellContentTemplateComponent {
  @Input() row!: Log;
}

@Pipe({name: 'appFormatLogLevel'})
export class AppFormatLogLevelPipe implements PipeTransform {
  transform(logLevel: string, type: string): string {
    if (type === 'class') {
      return this.buildLogLevelClasses(logLevel);
    }
    if (type === 'text') {
      return this.buildLogLevelText(logLevel);
    }
    return '';
  }

  buildLogLevelClasses(logLevel: string): string {
    let classNames = 'chip-width-5em ';
    switch (logLevel) {
      case 'E':
        classNames += Constants.CHIP_TYPE_DANGER;
        break;

      case 'W':
        classNames += Constants.CHIP_TYPE_WARNING;
        break;

      case 'I':
        classNames += Constants.CHIP_TYPE_SUCCESS;
        break;

      case 'D':
        classNames += Constants.CHIP_TYPE_INFO;
        break;

      default:
        classNames += Constants.CHIP_TYPE_DEFAULT;
    }
    return classNames;
  }

  buildLogLevelText(logLevel: string): string {
    for (const level of logLevels) {
      if (logLevel === level.key) {
        return level.value;
      }
    }
    return '';
  }
}
