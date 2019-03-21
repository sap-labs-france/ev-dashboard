import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {CommonModule, registerLocaleData} from '@angular/common';
import {CentralServerService} from './services/central-server.service';
import {CentralServerNotificationService} from './services/central-server-notification.service';
import {SpinnerService} from './services/spinner.service';
import {LocaleService} from './services/locale.service';
import {AuthorizationService} from './services/authorization-service';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {LocalStorageService} from './services/local-storage.service';
import {ConfigService} from './services/config.service'
import {MessageService} from './services/message.service';
import {RecaptchaModule} from 'ng-recaptcha';
import {ReleaseNotesComponent} from './release-notes/release-notes.component';
import {RouteGuardService} from './services/route-guard.service';

import localeFr from '@angular/common/locales/fr';
import 'hammerjs';
import 'chartjs-plugin-zoom';
import {
  MAT_DATE_LOCALE,
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
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
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

import {MatDatepickerModule} from '@angular/material/datepicker';
import {AppComponent} from './app.component';
import {SidebarModule} from './sidebar/sidebar.module';
import {FooterModule} from './shared/footer/footer.module';
import {NavbarModule} from './shared/navbar/navbar.module';
import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth/auth-layout.component';

import {AppRouting} from './app.routing';
import {WINDOW_PROVIDERS} from './providers/window.provider';
import {WindowService} from './services/window.service';
import {NotFoundComponent} from './pages/notfound/not-found.component';
import {TenantGuard} from './guard/tenant.guard';
import {ChartModule} from 'angular2-chartjs';
import {AgmCoreModule} from '@agm/core';
import {DashboardService} from './services/dashboard.service';
import {MatDatetimepickerModule, MatNativeDatetimeModule} from '@mat-datetimepicker/core';
import {ComponentService} from './services/component.service';
// import {TooltipDirective} from './shared/directives/tooltip.directive';

import * as $ from 'jquery';
import 'popper.js';
import 'bootstrap';
registerLocaleData(localeFr, 'fr');

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
    MatNativeDatetimeModule,
    MatDatetimepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
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
    MatTooltipModule
  ],
  providers: [{provide: LOCALE_ID, useValue: 'fr'}],
})
export class MaterialModule {
}

// Load translations from "/assets/i18n/[lang].json" ([lang] is the lang
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function getLocalStorage() {
  return (typeof window !== 'undefined') ? window.localStorage : null;
}

export function configFactory(config: ConfigService) {
  return () => config.load();
}

export function localeFactory(
  centralServerService: CentralServerService, translateService: TranslateService) {
  // Default
  let language = translateService.getBrowserLang();
  // Get current user
  const loggedUser = centralServerService.getLoggedUserFromToken()
  if (loggedUser) {
    language = loggedUser['language'];
  }
  return language;
}

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRouting,
    MaterialModule,
    MatNativeDateModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    RecaptchaModule.forRoot(),
    HttpClientModule,
    ChartModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyA4X0viMaongt6MuKkUfcY9dSqZNtg8LZQ'}),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    NotFoundComponent,
    ReleaseNotesComponent,
    // TooltipDirective,
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    WINDOW_PROVIDERS,
    CentralServerService,
    CentralServerNotificationService,
    AuthorizationService,
    ComponentService,
    TenantGuard,
    RouteGuardService,
    SpinnerService,
    LocaleService,
    LocalStorageService,
    MessageService,
    ConfigService,
    TranslateService,
    WindowService,
    DashboardService,
    {provide: APP_INITIALIZER, useFactory: configFactory, deps: [ConfigService], multi: true},
    {provide: MAT_DATE_LOCALE, useFactory: localeFactory, deps: [CentralServerService, TranslateService], multi: true},
    // {provide: RouteReuseStrategy, useClass: CustomRouteStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService) {

    // Default
    let language = this.translateService.getBrowserLang();
    // Get current user
    const loggedUser = this.centralServerService.getLoggedUserFromToken()
    if (loggedUser) {
      language = loggedUser['language'];
    }
    // Supported
    translateService.addLangs(['en', 'fr']);
    // Default EN
    translateService.setDefaultLang('en');
    // Use the browser's langage or default to EN
    translateService.use(language.match(/en|fr/) ? language : 'en');
  }
}
