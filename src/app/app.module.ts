import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localeCs from '@angular/common/locales/cs'; // ACHTUNG - cz does not exists ==> cs-CZ
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeEnAU from '@angular/common/locales/en-AU';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localePt from '@angular/common/locales/pt';
import { APP_INITIALIZER, Injectable, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { DatetimeAdapter, MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule, MomentDatetimeAdapter } from '@mat-datetimepicker/moment';
import {
  TranslateDefaultParser,
  TranslateLoader,
  TranslateModule,
  TranslateParser,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ChartModule } from 'angular2-chartjs';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { Observable, Observer } from 'rxjs';
import { UtilsService } from 'services/utils.service';

import pkg from '../../package.json';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserNotSupportedModule } from './browser-not-supported/browser-not-supported.module';
import { DevEnvGuard } from './guard/development.guard';
import { RouteGuardService } from './guard/route-guard';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { WINDOW_PROVIDERS } from './providers/window.provider';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { AuthorizationService } from './services/authorization.service';
import { CentralServerService } from './services/central-server.service';
import { ComponentService } from './services/component.service';
import { ConfigService } from './services/config.service';
import { LocalStorageService } from './services/local-storage.service';
import { LocaleService } from './services/locale.service';
import { MessageService } from './services/message.service';
import { SpinnerService } from './services/spinner.service';
import { StripeService } from './services/stripe.service';
import { WindowService } from './services/window.service';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule } from './shared/navbar/navbar.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { Utils } from './utils/Utils';

registerLocaleData(localeEn);
registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeEs);
registerLocaleData(localePt);
registerLocaleData(localeIt);
registerLocaleData(localeCs);
registerLocaleData(localeEnAU);
@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatMomentDatetimeModule,
    MatDatetimepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
  ],
  providers: [{ provide: DatetimeAdapter, useClass: MomentDatetimeAdapter }],
})
export class MaterialModule {}

// Load translations from "/assets/i18n/[lang].json" ([lang] is the lang
export const httpLoaderFactory = (http: HttpClient) =>
  new TranslateHttpLoader(http, './assets/i18n/', `.json?version=${pkg.version}`);

const initAppFactory =
  (
    centralServerService: CentralServerService,
    configService: ConfigService,
    messageService: MessageService,
    translateService: TranslateService
  ): (() => Observable<void>) =>
    () =>
      new Observable((observer: Observer<void>) => {
      // Load Configuration
        configService.initConfig().subscribe({
          complete: () => {
          // Load User Token
            centralServerService.initUserToken().subscribe({
              complete: () => {
              // Default
                let language = translateService.getBrowserLang();
                // Get current user
                const loggedUser = centralServerService.getLoggedUser();
                if (loggedUser?.language) {
                  language = loggedUser.language;
                }
                // Init Translate service
                translateService.addLangs(['en', 'fr', 'es', 'de', 'pt', 'it', 'cs']);
                translateService.setDefaultLang('en');
                translateService.use(language.match(/en|fr|es|de|pt|it|cs/) ? language : 'en');
                // Init Done
                observer.complete();
              },
              error: (error) => {
                messageService.showErrorMessage(
                  'Error while trying to read the current logged user!'
                );
                console.log(error);
              },
            });
          },
          error: (error) => {
            messageService.showErrorMessage('Error while loading the configuration file!');
            console.log(error);
          },
        });
      });

// To be used where the Material Date Time picker is imported (never called in this module)
export const initMaterialLocaleFactory =
  (
    centralServerService: CentralServerService,
    translateService: TranslateService
  ): (() => string) =>
    () => {
    // Init Material locale
      const loggedUser = centralServerService.getLoggedUser();
      if (loggedUser?.locale) {
      // Locale of the current user (if any)
        return Utils.convertToMomentLocale(loggedUser.locale);
      }
      // Locale of the browser
      const browserLocale = translateService.getBrowserCultureLang();
      return Utils.convertToMomentLocale(browserLocale);
    };

@Injectable()
class CustomTranslateDefaultParser extends TranslateDefaultParser {
  public getValue(target: any, key: string): any {
    let value = super.getValue(target, key);
    if (!Utils.isEmptyArray(value)) {
      value = (value as string[]).join('<br>');
    }
    return value;
  }
}

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    MaterialModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    HttpClientModule,
    ChartModule,
    BrowserNotSupportedModule,
    NgxDaterangepickerMd.forRoot(),
    GoogleMapsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
      parser: {
        provide: TranslateParser,
        useClass: CustomTranslateDefaultParser,
      },
    }),
  ],
  declarations: [AppComponent, AdminLayoutComponent, AuthLayoutComponent, ReleaseNotesComponent],
  exports: [TranslateModule],
  providers: [
    WINDOW_PROVIDERS,
    CentralServerService,
    AuthorizationService,
    ComponentService,
    DevEnvGuard,
    RouteGuardService,
    SpinnerService,
    LocaleService,
    LocalStorageService,
    MessageService,
    ConfigService,
    UtilsService,
    TranslateService,
    WindowService,
    StripeService,
    {
      provide: APP_INITIALIZER,
      useFactory: initAppFactory,
      deps: [CentralServerService, ConfigService, MessageService, TranslateService],
      multi: true,
    },
    { provide: DatetimeAdapter, useClass: MomentDatetimeAdapter },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  public constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService
  ) {
    // Default
    let language = this.translateService.getBrowserLang();
    // Get current user
    const loggedUser = this.centralServerService.getLoggedUser();
    if (loggedUser && loggedUser.language) {
      language = loggedUser.language;
    }
    // Supported
    translateService.addLangs(['en', 'fr', 'es', 'de', 'pt', 'it', 'cs']); // TODO - this seems to have no impact
    // Default EN
    translateService.setDefaultLang('en');
    // Use the browser's language or default to EN
    translateService.use(language.match(/en|fr|es|de|pt|it|cs/) ? language : 'en');
  }
}
