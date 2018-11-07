import {LocaleService} from '../services/locale.service';

export class Formatters {
  public static createDateTimeFormatter(localeService: LocaleService,
                                        options = {
                                          hour12: false,
                                          year: 'numeric', month: 'numeric', day: 'numeric',
                                          hour: 'numeric', minute: 'numeric', second: 'numeric'
                                        }): any {
    // Create
    return new Intl.DateTimeFormat(
      localeService.getCurrentFullLocaleForJS(), options);
  }

  public static formatDurationInSecs(durationInSecs) {
    return new Date(durationInSecs * 1000).toUTCString().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, '$1h $2m');
  }

  public static formatInactivityInSecs(inactivityInSecs, totalDurationInSecs) {
    if (totalDurationInSecs > 0) {
      return `${Formatters.formatDurationInSecs(inactivityInSecs)} (${Math.floor(inactivityInSecs / totalDurationInSecs * 100)}%)`;
    }
    return '00h00m (0%)'
  }

  public static formatToKiloWatt(value) {
    return Number.parseFloat(`${value / 1000}`).toFixed(2) + ' kW'
  }

  public static formatUser(user): any {
    return `${user.name.toUpperCase()} ${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}`;
  }

  public static formatLogLevel(status, options = {iconClass: ''}): any {
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

  public static formatTextToHTML(value): String {
    // Check
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        // Format
        value[i] = this._formatTextToHTML(value[i]);
      }
    } else {
      // Format
      value = this._formatTextToHTML(value);
    }
    return value;
  }

  private static _formatTextToHTML(value) {
    // JSON?
    if (typeof value === 'object') {
      // Check that every values is parsed
      return this._formatTextToHTML(JSON.stringify(value));
      // String?
    } else if (typeof value === 'string') {
      let parsedValue;
      try {
        // Try to parse it
        parsedValue = JSON.stringify(JSON.parse(value), null, 6);
        // Ok: Format
        parsedValue = parsedValue
          .replace(/\n/g, '<br/>')
          .replace(/\\n\s/g, '<br/>')
          .replace(/\s/g, '&nbsp;');
      } catch (err) {
        // Err: Apply default formatting
        parsedValue = value.replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>');
      }
      // Replace
      return parsedValue;
    } else {
      // Unknown
      return value;
    }
  }
}
