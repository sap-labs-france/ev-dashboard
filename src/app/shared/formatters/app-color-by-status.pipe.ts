import { Pipe, PipeTransform } from '@angular/core';

import { LevelText } from '../../types/GlobalType';
import { InactivityStatus } from '../../types/Transaction';

@Pipe({ name: 'appColorByStatus' })
export class AppColorByStatusPipe implements PipeTransform {

  public transform(status?: InactivityStatus): string {
    switch (status) {
      case InactivityStatus.INFO:
        return LevelText.INFO;
      case InactivityStatus.ERROR:
        return LevelText.DANGER;
      case InactivityStatus.WARNING:
        return LevelText.WARNING;
    }
  }
}
