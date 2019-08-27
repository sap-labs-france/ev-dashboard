import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoSupportComponent } from './no-support.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [NoSupportComponent],
  imports: [
    CommonModule,
    TranslateModule
  ]
})
export class NoSupportModule { }
