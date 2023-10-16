import 'moment/locale/en-au';

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
  private static considerBrowserLocaleAlreadyDone: boolean;
  private locale!: Locale;
  private currentLocaleSubject!: BehaviorSubject<Locale>;

  public constructor(
    private translateService: TranslateService,
    private configService: ConfigService,
    private centralServerService: CentralServerService
  ) {
    this.considerBrowserLocale();
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      this.considerUserLocale(user);
    });
  }

  public getLocaleInformation(): Locale {
    return this.locale;
  }

  public getCurrentLocaleSubject(): BehaviorSubject<Locale> {
    return this.currentLocaleSubject;
  }

  public getLocales(): KeyValue[] {
    return Constants.SUPPORTED_LOCALES.map((aLocale) => ({
      key: aLocale,
      value: this.getLocaleDescription(aLocale),
    }));
  }

  public getLocaleByKey(localeKey: string): KeyValue {
    // Return the found key
    const locales: KeyValue[] = this.getLocales().filter((locale) => locale.key === localeKey);
    return !Utils.isEmptyArray(locales)
      ? locales[0]
      : { key: 'U', value: this.translateService.instant('users.locale_unknown', {}) };
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

  private considerUserLocale(loggedUser: UserToken) {
    if (loggedUser && loggedUser.locale) {
      this.updateLocale(loggedUser.locale);
    } else {
      this.considerBrowserLocale();
    }
  }

  private considerBrowserLocale() {
    if (!LocaleService.considerBrowserLocaleAlreadyDone) {
      LocaleService.considerBrowserLocaleAlreadyDone = true;
      const locale = Utils.convertToLocale(this.translateService.getBrowserCultureLang());
      this.updateLocale(locale);
    }
  }

  private updateLocale(locale: string) {
    const normalizedLocale = Utils.normalizeLocaleString(locale);
    if (!this.locale || this.locale.currentLocale !== normalizedLocale) {
      this.locale = this.getSupportedLocale(normalizedLocale);
      this.translateService.use(this.locale.language);
      // Make sure to inform moment that the locale has been changed
      Utils.changeMomentLocaleGlobally(this.locale.currentLocale);
      if (!this.currentLocaleSubject) {
        this.currentLocaleSubject = new BehaviorSubject<Locale>(this.locale);
      } else {
        this.currentLocaleSubject.next(this.locale);
      }
    }
  }

  private getLocaleDescription(locale: string): string {
    if (Constants.SUPPORTED_LOCALES.includes(locale)) {
      return this.translateService.instant(`users.locale_desc_${locale}`);
    } else {
      return this.translateService.instant('users.locale_invalid');
    }
  }

  private getSupportedLocale(locale: string): Locale {
    locale = Utils.normalizeLocaleString(locale);
    let language = Utils.extractLanguage(locale);
    if (!Constants.SUPPORTED_LANGUAGES.includes(language)) {
      language = Constants.DEFAULT_LANGUAGE;
    }
    const currentLocale = locale;
    return {
      language,
      currentLocale,
      currentLocaleJS: Utils.convertToBrowserLocale(locale),
    };
  }
}
