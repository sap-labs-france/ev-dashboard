export class FooterModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../app.module';
import { TranslateModule } from '@ngx-translate/core';
import { SitesDialogComponent } from './sites/sites-dialog-component';
import { ConfirmationDialogComponent } from './confirmation/confirmation-dialog-component';
import { TableModule } from '../table/table.module';
import { UsersDialogComponent } from './users/users-dialog-component';
import { DialogTableDataComponent } from './dialog-table-data.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TableModule,
    TranslateModule
  ],
  declarations: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent
  ],
  entryComponents: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent
  ],
  exports: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent
  ]
})
export class DialogsModule {
}
