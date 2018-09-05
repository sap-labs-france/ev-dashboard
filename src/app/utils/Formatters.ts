import { LocaleService } from '../services/locale.service';

export class Formatters {
    static createDateTimeFormatter(localeService: LocaleService,
        options = { hour12: false,
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric'}): any {
      // Create
      return new Intl.DateTimeFormat(
        localeService.getCurrentFullLocaleForJS(), options);
    }

    static formatLogLevel(status, options = { iconClass: ''}): any {
      let clasNames = (options.iconClass ? options.iconClass : '');
      switch (status) {
        // Info
        case 'I':
          clasNames += ' icon-success';
          break;
        // Warning
        case 'W':
          clasNames += ' icon-warning';
          break;
        // Error
        case 'E':
          clasNames += ' icon-danger';
          break;
      }
      return `<i class="material-icons card-icon ${clasNames}">fiber_manual_record</i>`;
  }
}
