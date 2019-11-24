import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from 'app/utils/Constants';

@Pipe({ name: 'appColorByLevel' })
export class AppColorByLevelPipe implements PipeTransform {

  transform(level?: string): string {
    let classResult = 'ml-1 ';
    if (level) {
      switch (level) {
        case 'info':
          classResult += Constants.LEVEL_TEXT_INFO;
          break;
        case 'danger':
          classResult += Constants.LEVEL_TEXT_DANGER;
          break;
        case 'warning':
          classResult += Constants.LEVEL_TEXT_WARNING;
          break;
      }
    }
    return classResult;
  }
}
