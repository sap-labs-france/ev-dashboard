import {Injectable} from '@angular/core';
import {ConfigService} from './config.service';
import {TranslateService} from '@ngx-translate/core';
import {CentralServerService} from './central-server.service';
import {KeyValue} from '../common.types';

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

  public updateLanguage() {
    const loggedUser = this.centralServerService.getLoggedUserFromToken();
    if (loggedUser) {
      this.language = loggedUser.language;
    } else {
      this.language = this.translateService.getBrowserLang();
    }
  }

  public getCurrentFullLocale() {
    switch (this.language) {
      case 'en':
        return 'en_US';
      case 'fr':
        return 'fr_FR';
    }
  }

  public getCurrentFullLocaleForJS() {
    switch (this.language) {
      case 'en':
        return 'en-US';
      case 'fr':
        return 'fr-FR';
    }
  }

  public getLocales(): KeyValue[] {
    const locales = [];
    // en, fr...
    const configLocales = this.configService.getLocales();
    // Return
    configLocales.fullSupported.forEach(localeFull => {
      locales.push({
        key: localeFull,
        value: this.getFullLocaleDescription(localeFull)
      });
    });
    return locales;
  }

  public getFullLocaleDescription(localeFull) {
    switch (localeFull) {
      case 'en_US':
        return this.translateService.instant('users.locale_desc_english');
      case 'fr_FR':
        return this.translateService.instant('users.locale_desc_french');
    }
  }

  public getLocaleByKey(localeKey) {
    // Return the found key
    const locales = this.getLocales().filter(locale => {
      return locale.key === localeKey;
    });
    return (locales && locales.length > 0 ? locales[0] :
      {key: 'U', description: this.translateService.instant('users.locale_unknown', {})});
  }

  public getDateFormat(): string {
    switch (this.language) {
      case 'fr':
        return 'DD/MM/YYYY';
      // 'en' and other language
      default:
        return 'DD/MM/YYYY';
    }
  }

  public getHourFormat(): string {
    switch (this.language) {
      case 'fr':
        return '24';
      // 'en' and other language
      default:
        return '12';
    }
  }

  public getTimeFormat(): string {
    switch (this.language) {
      case 'fr':
        return 'H:mm';
      // 'en' and other language
      default:
        return 'h:mm A';
    }
  }

  public getFirstDayOfWeek() {
    switch (this.language) {
      case 'fr':
        return 1;
      // 'en' and other language
      default:
        return 0;
    }
  }

  public getDateTimeFormat(): string {
    return this.getDateFormat() + ' ' + this.getTimeFormat();
  }

  public getAllDateTimeProps(): Object {
    return {
      'dateTimeFormat': this.getDateTimeFormat(),
      'hourFormat': this.getHourFormat(),
      'firstDayOfWeek': this.getFirstDayOfWeek()
    };
  }
}
