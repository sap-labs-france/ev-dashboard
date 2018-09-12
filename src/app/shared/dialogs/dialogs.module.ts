export class FooterModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../app.module';
import { TranslateModule } from '@ngx-translate/core';
import { SitesDialogComponent } from './sites/sites-dialog-component';
import { TableModule } from '../table/table.module';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TableModule,
    TranslateModule
  ],
  declarations: [
    SitesDialogComponent
  ],
  entryComponents: [
    SitesDialogComponent
  ],
  exports: [
    SitesDialogComponent
  ]
})
export class DialogsModule {
}
