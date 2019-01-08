import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';

import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {TableModule} from '../../shared/table/table.module';
import {OrganizationsComponent} from './organizations.component';
import {OrganizationsRoutes} from './organizations.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(OrganizationsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule
  ],
  declarations: [
    OrganizationsComponent
  ],
  entryComponents: [
    OrganizationsComponent
  ],
  providers: [
  ]
})

export class OrganizationsModule {
}
