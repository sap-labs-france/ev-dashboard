import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../service/central-server.service';

@Injectable()
export class LocaleService {
  public language: string;

  constructor(
    private translateService: TranslateService,
    private configService: ConfigService,
    private centralServerService: CentralServerService) {
    // Set
    this.updateLanguage();
  }

  updateLanguage() {
    const loggedUser = this.centralServerService.getCurrentUser();
    if (loggedUser) {
      this.language = loggedUser.language;
    } else {
      this.language = this.translateService.getBrowserLang();
    }
  }

  getCurrentFullLocale() {
    switch (this.language) {
      case 'en':
        return 'en_US';
      case 'fr':
        return 'fr_FR';
    }
  }

  getLocales() {
    const locales = [];
    // en, fr...
    const configLocales = this.configService.getLocales();
    // Return
    configLocales.fullSupported.forEach(localeFull => {
      locales.push({
        key: localeFull,
        description: this.getFullLocaleDescription(localeFull)
      });
    });
    return locales;
  }

  getFullLocaleDescription(localeFull) {
    switch (localeFull) {
      case 'en_US':
        return this.translateService.instant('users.locale_desc_english');
      case 'fr_FR':
        return this.translateService.instant('users.locale_desc_french');
    }
  }

  getLocaleByKey(localeKey) {
    // Return the found key
    const locales = this.getLocales().filter(locale => {
      return locale.key === localeKey;
    });
    return (locales && locales.length > 0 ? locales[0] :
      { key: 'U', description: this.translateService.instant('users.locale_unknown', {}) });
  }

  getDateFormat(): string {
    switch (this.language) {
      case 'fr':
        return 'DD/MM/YYYY';
      // 'en' and other language
      default:
        return 'DD/MM/YYYY';
    }
  }

  getHourFormat(): string {
    switch (this.language) {
      case 'fr':
        return '24';
      // 'en' and other language
      default:
        return '12';
    }
  }

  getTimeFormat(): string {
    switch (this.language) {
      case 'fr':
        return 'H:mm';
      // 'en' and other language
      default:
        return 'h:mm A';
    }
  }

  getFirstDayOfWeek() {
    switch (this.language) {
      case 'fr':
        return 1;
      // 'en' and other language
      default:
        return 0;
    }
  }

  getDateTimeFormat(): string {
    return this.getDateFormat() + ' ' + this.getTimeFormat();
  }

  getAllDateTimeProps(): Object {
    return {
      'dateTimeFormat': this.getDateTimeFormat(),
      'hourFormat': this.getHourFormat(),
      'firstDayOfWeek': this.getFirstDayOfWeek()
    };
  }
}
