import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'logLevelIcon'})
export class LogLevelIconPipe implements PipeTransform {
  transform(status: string, options = {iconClass: ''}): any {
    let clasNames = (options.iconClass ? options.iconClass : '');
    switch (status) {
      case 'I':
        clasNames += ' icon-success';
        break;
      case 'W':
        clasNames += ' icon-warning';
        break;
      case 'E':
        clasNames += ' icon-danger';
        break;
    }
    return `<i class="material-icons card-icon ${clasNames}">fiber_manual_record</i>`;
  }
}
