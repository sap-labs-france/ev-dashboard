import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'app/app.module';
import { environment } from 'environments/environment';

if (environment.production) {
  // tslint:disable-next-line: align
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
