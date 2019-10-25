import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KeyValue, User, UserToken } from '../common.types';
import { CentralServerService } from './central-server.service';
import { ConfigService } from './config.service';

@Injectable()
export class LocaleService {
  public language: string;

  constructor(
    private translateService: TranslateService,
    private configService: ConfigService,
    private centralServerService: CentralServerService) {
    // Set

    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      this.updateLanguage(user);
    });
  }

  public updateLanguage(loggedUser: User|UserToken) {
    if (loggedUser && loggedUser.language) {
      this.language = loggedUser.language;
    } else {
      this.language = this.translateService.getBrowserLang();
    }
  }

  public getCurrentLocale() {
    switch (this.language) {
      case 'en':
        return 'en_US';
      case 'fr':
        return 'fr_FR';
    }
  }

  public getCurrentLocaleJS() {
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
    configLocales.fullSupported.forEach((localeFull) => {
      locales.push({
        key: localeFull,
        value: this.getLocaleDescription(localeFull),
      });
    });
    return locales;
  }

  public getLocaleByKey(localeKey) {
    // Return the found key
    const locales = this.getLocales().filter((locale) => {
      return locale.key === localeKey;
    });
    return (locales && locales.length > 0 ? locales[0] :
      {key: 'U', description: this.translateService.instant('users.locale_unknown', {})});
  }

  public getI18nDay() {
    return this.translateService.instant('general.day');
  }

  public getI18nHour() {
    return this.translateService.instant('general.hour');
  }

  public getI18nMinute() {
    return this.translateService.instant('general.minute');
  }

  public getI18nSecond() {
    return this.translateService.instant('general.second');
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

  public getAllDateTimeProps(): object {
    return {
      dateTimeFormat: this.getDateTimeFormat(),
      hourFormat: this.getHourFormat(),
      firstDayOfWeek: this.getFirstDayOfWeek(),
    };
  }

  private getLocaleDescription(localeFull) {
    switch (localeFull) {
      case 'en_US':
        return this.translateService.instant('users.locale_desc_english');
      case 'fr_FR':
        return this.translateService.instant('users.locale_desc_french');
    }
  }
}
