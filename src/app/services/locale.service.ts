import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { KeyValue, UserToken } from '../common.types';
import { CentralServerService } from './central-server.service';
import { ConfigService } from './config.service';

export interface Locale {
  language: string;
  currentLocale: string;
  currentLocaleJS: string;
}

@Injectable()
export class LocaleService {
  private locale: Locale;
  private currentLocaleSubject: BehaviorSubject<Locale>;

  constructor(
    private translateService: TranslateService,
    private configService: ConfigService,
    private centralServerService: CentralServerService) {
    this.updateLocale(this.translateService.getBrowserLang());

    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      this.updateLanguage(user);
    });
  }

  public getCurrentLocaleSubject(): BehaviorSubject<Locale> {
    return this.currentLocaleSubject;
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

  private updateLanguage(loggedUser: UserToken) {
    let language: string;
    if (loggedUser && loggedUser.language) {
      language = loggedUser.language;
    } else {
      language = this.translateService.getBrowserLang();
    }
    this.updateLocale(language);
  }

  private updateLocale(language: string) {
    if (!this.locale || this.locale.language !== language) {
      this.translateService.use(language);
      this.locale = {
        language,
        currentLocale: this.getCurrentLocale(language),
        currentLocaleJS: this.getCurrentLocaleJS(language),
      };
      if (!this.currentLocaleSubject) {
        this.currentLocaleSubject = new BehaviorSubject<Locale>(this.locale);
      } else {
        this.currentLocaleSubject.next(this.locale);
      }
    }
  }

  private getCurrentLocale(language: string) {
    switch (language) {
      case 'fr':
        return 'fr_FR';
      case 'en':
      default:
        return 'en_US';
    }
  }

  private getCurrentLocaleJS(language: string) {
    switch (language) {
      case 'fr':
        return 'fr-FR';
      case 'en':
      default:
        return 'en-US';
    }
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
