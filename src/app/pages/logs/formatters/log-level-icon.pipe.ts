import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'logLevelIcon'})
export class LogLevelIconPipe implements PipeTransform {
  transform(status: string, options = {iconClass: ''}): any {
    let classNames = (options.iconClass ? options.iconClass : '');
    switch (status) {
      case 'I':
        classNames += ' icon-success';
        break;
      case 'W':
        classNames += ' icon-warning';
        break;
      case 'E':
        classNames += ' icon-danger';
        break;
    }
    return `<i class="material-icons card-icon ${classNames}">fiber_manual_record</i>`;
  }
}
