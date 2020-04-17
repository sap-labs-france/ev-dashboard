import { Pipe, PipeTransform } from '@angular/core';
import { LevelText } from 'app/types/GlobalType';
import { InactivityStatus } from 'app/types/Transaction';

@Pipe({ name: 'appColorByStatus' })
export class AppColorByStatusPipe implements PipeTransform {

  transform(status?: InactivityStatus): string {
    let classResult = 'ml-1 ';
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
