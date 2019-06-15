import { registerLocaleData, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { AuthorizationService } from './services/authorization-service';
import { CentralServerNotificationService } from './services/central-server-notification.service';
import { CentralServerService } from './services/central-server.service';
import { ConfigService } from './services/config.service';
import { LocalStorageService } from './services/local-storage.service';
import { LocaleService } from './services/locale.service';
import { MessageService } from './services/message.service';
import { RouteGuardService } from './services/route-guard.service';
import { SpinnerService } from './services/spinner.service';

import localeFr from '@angular/common/locales/fr';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, MAT_DATE_LOCALE } from '@angular/material/core';
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
import 'chartjs-plugin-zoom';
import 'hammerjs';
import 'moment/locale/fr';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule } from './shared/navbar/navbar.module';
import { SidebarModule } from './sidebar/sidebar.module';

import { AgmCoreModule } from '@agm/core';
import { DatetimeAdapter, MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule, MomentDatetimeAdapter } from '@mat-datetimepicker/moment';
import { ChartModule } from 'angular2-chartjs';
import 'bootstrap';
import 'popper.js';
import { AppRouting } from './app.routing';
import { DevEnvGuard } from './guard/development.guard';
import { WINDOW_PROVIDERS } from './providers/window.provider';
import { ComponentService } from './services/component.service';
import { DashboardService } from './services/dashboard.service';
import { WindowService } from './services/window.service';
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
  providers: [
    {provide: DatetimeAdapter, useClass: MomentDatetimeAdapter}
  ],
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
  const loggedUser = centralServerService.getLoggedUserFromToken();
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
    ReactiveFormsModule,
    NgxCaptchaModule,
    AppRouting,
    MaterialModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
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
    ReleaseNotesComponent,
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
    DevEnvGuard,
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
    {provide: DatetimeAdapter, useClass: MomentDatetimeAdapter}
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
    const loggedUser = this.centralServerService.getLoggedUserFromToken();
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
