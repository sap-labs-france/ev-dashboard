import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { logLevels } from '../../../shared/model/logs.model';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../types/GlobalType';
import { Log } from '../../../types/Log';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.level | appFormatLogLevel : 'class'" [disabled]="true">
        {{ row.level | appFormatLogLevel : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class LogLevelFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: Log;
}

@Pipe({ name: 'appFormatLogLevel' })
export class AppFormatLogLevelPipe implements PipeTransform {
  public transform(logLevel: string, type: string): string {
    if (type === 'class') {
      return this.buildLogLevelClasses(logLevel);
    }
    if (type === 'text') {
      return this.buildLogLevelText(logLevel);
    }
    return '';
  }

  public buildLogLevelClasses(logLevel: string): string {
    let classNames = 'chip-width-8em ';
    switch (logLevel) {
      case 'E':
        classNames += ChipType.DANGER;
        break;

      case 'W':
        classNames += ChipType.WARNING;
        break;

      case 'I':
        classNames += ChipType.SUCCESS;
        break;

      case 'D':
        classNames += ChipType.INFO;
        break;

      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  public buildLogLevelText(logLevel: string): string {
    for (const level of logLevels) {
      if (logLevel === level.key) {
        return level.value;
      }
    }
    return '';
  }
}
