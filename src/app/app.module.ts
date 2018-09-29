import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CentralServerService } from './services/central-server.service';
import { CentralServerNotificationService } from './services/central-server-notification.service';
import { SpinnerService } from './services/spinner.service';
import { LocaleService } from './services/locale.service';
import { AuthorizationService } from './services/authorization-service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LocalStorageService } from './services/local-storage.service';
import { ConfigService } from './services/config.service';
import { DialogService } from './services/dialog.service';
import { MessageService } from './services/message.service';
import { RecaptchaModule } from 'ng-recaptcha';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { RouteGuardService } from './services/route-guard.service';
import * as $ from 'jquery';

import {
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
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
  MAT_DATE_LOCALE,
} from '@angular/material';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { AppComponent } from './app.component';
import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule } from './shared/navbar/navbar.module';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';

import { AppRouting } from './app.routing';

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
  ]
})
export class MaterialModule { }

// Load translations from "/assets/i18n/[lang].json" ([lang] is the lang
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
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
    HttpModule,
    MaterialModule,
    MatNativeDateModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    RecaptchaModule.forRoot(),
    HttpClientModule,
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
    ReleaseNotesComponent
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    CentralServerService,
    CentralServerNotificationService,
    AuthorizationService,
    RouteGuardService,
    SpinnerService,
    LocaleService,
    LocalStorageService,
    DialogService,
    MessageService,
    ConfigService,
    TranslateService,
    { provide: APP_INITIALIZER, useFactory: configFactory, deps: [ConfigService], multi: true },
    { provide: MAT_DATE_LOCALE, useFactory: localeFactory, deps: [CentralServerService, TranslateService], multi: true },
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
