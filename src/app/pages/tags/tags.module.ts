import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import {
  AppFormatTagStatusPipe,
  TagStatusFormatterComponent,
} from './formatters/tag-status-formatter.component';
import { TagsListComponent } from './list/tags-list.component';
import { TagAssignDialogComponent } from './tag-assign/tag-assign-dialog.component';
import { TagAssignComponent } from './tag-assign/tag-assign.component';
import { TagMainComponent } from './tag/main/tag-main.component';
import { TagDialogComponent } from './tag/tag-dialog.component';
import { TagComponent } from './tag/tag.component';
import { TagsComponent } from './tags.component';
import { TagRoutes } from './tags.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TagRoutes),
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    AddressModule,
    TableModule,
    DialogsModule,
    CommonDirectivesModule,
    FormattersModule,
  ],
  declarations: [
    TagStatusFormatterComponent,
    AppFormatTagStatusPipe,
    TagsListComponent,
    TagDialogComponent,
    TagAssignDialogComponent,
    TagComponent,
    TagMainComponent,
    TagAssignComponent,
    TagsComponent,
  ],
  exports: [],
  providers: [],
})
export class TagsModule {}
