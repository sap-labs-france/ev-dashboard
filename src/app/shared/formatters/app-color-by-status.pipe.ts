import { Pipe, PipeTransform } from '@angular/core';

import { LevelText } from '../../types/GlobalType';
import { InactivityStatus } from '../../types/Transaction';

@Pipe({ name: 'appColorByStatus' })
export class AppColorByStatusPipe implements PipeTransform {
  public transform(status?: InactivityStatus): string {
    let classResult = 'ms-1 ';
    switch (status) {
      case InactivityStatus.INFO:
        classResult += LevelText.INFO;
        break;
      case InactivityStatus.ERROR:
        classResult += LevelText.DANGER;
        break;
      case InactivityStatus.WARNING:
        classResult += LevelText.WARNING;
        break;
    }
    return classResult;
  }
}
