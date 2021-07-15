import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Constants } from 'utils/Constants';

import { KeyValue } from '../types/GlobalType';
import { UserToken } from '../types/User';
import { Utils } from '../utils/Utils';
import { CentralServerService } from './central-server.service';
import { ConfigService } from './config.service';

export interface Locale {
  language: string;
  currentLocale: string;
  currentLocaleJS: string;
}

@Injectable()
export class LocaleService {
  private locale!: Locale;
  private currentLocaleSubject!: BehaviorSubject<Locale>;

  public constructor(
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
    return Constants.SUPPORTED_LOCALES.map( aLocale => ({
      key: aLocale,
      value: this.getLocaleDescription(aLocale)
    }));
  }

  public getLocaleByKey(localeKey: string): KeyValue {
    // Return the found key
    const locales: KeyValue[] = this.getLocales().filter((locale) => locale.key === localeKey);
    return (!Utils.isEmptyArray(locales) ? locales[0] :
      { key: 'U', value: this.translateService.instant('users.locale_unknown', {}) });
  }

  public getI18nDay(): string {
    return this.translateService.instant('general.day');
  }

  public getI18nHour(): string {
    return this.translateService.instant('general.hour');
  }

  public getI18nMinute(): string {
    return this.translateService.instant('general.minute');
  }

  public getI18nSecond(): string {
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
      language = this.getSupportedLanguage(language);
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

  private getSupportedLanguage(language: string): string {
    switch (language) {
      case 'fr':
      case 'en':
      case 'es':
      case 'de':
      case 'pt':
      case 'it':
        return language;
      default:
        return 'en';
    }
  }

  private getCurrentLocale(language: string): string {
    switch (language) {
      case 'fr':
        return 'fr_FR';
      case 'es':
        return 'es_ES';
      case 'de':
        return 'de_DE';
      case 'pt':
        return 'pt_PT';
      case 'it':
        return 'it_IT';
      case 'en':
      default:
        return 'en_US';
    }
  }

  private getCurrentLocaleJS(language: string): string {
    switch (language) {
      case 'fr':
        return 'fr-FR';
      case 'es':
        return 'es-ES';
      case 'de':
        return 'de-DE';
      case 'pt':
        return 'pt-PT';
      case 'it':
        return 'it-IT';
      case 'en':
      default:
        return 'en-US';
    }
  }

  private getLocaleDescription(localeFull: string): string {
    switch (localeFull) {
      case 'en_US':
        return this.translateService.instant('users.locale_desc_english');
      case 'fr_FR':
        return this.translateService.instant('users.locale_desc_french');
      case 'es_ES':
        return this.translateService.instant('users.locale_desc_spanish');
      case 'de_DE':
        return this.translateService.instant('users.locale_desc_german');
      case 'pt_PT':
        return this.translateService.instant('users.locale_desc_portuguese');
      case 'it_IT':
        return this.translateService.instant('users.locale_desc_italian');
      default:
        return this.translateService.instant('users.locale_invalid');
    }
  }
}
