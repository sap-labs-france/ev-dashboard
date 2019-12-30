import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from 'app/utils/Constants';
import { InactivityStatus } from 'app/common.types';

@Pipe({ name: 'appColorByStatus' })
export class AppColorByStatusPipe implements PipeTransform {

  transform(status?: InactivityStatus): string {
    let classResult = 'ml-1 ';
    switch (status) {
      case InactivityStatus.INFO:
        classResult += Constants.LEVEL_TEXT_INFO;
        break;
      case InactivityStatus.ERROR:
        classResult += Constants.LEVEL_TEXT_DANGER;
        break;
      case InactivityStatus.WARNING:
        classResult += Constants.LEVEL_TEXT_WARNING;
        break;
    }
    return classResult;
  }
}
