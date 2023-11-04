import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-stickers',
  templateUrl: 'stickers.component.html',
  styleUrls: ['stickers.component.scss']
})
export class StickersComponent {
  public stickers: string[] = ['VIP', 'ZEN'];
  public newSticker = '';
  public readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public placeholderText = '';

  public constructor(
    public translateService: TranslateService
  ) {
    this.placeholderText = this.translateService.instant('general.add_new_sticker');
  }

  public add(): void {
    if (this.newSticker) {
      console.log(this.newSticker);
      this.stickers.push(this.newSticker);
    }
    console.log(this.stickers);
    this.newSticker = '';
  }

  public remove(sticker: string): void {
    const index = this.stickers.indexOf(sticker);

    if (index >= 0) {
      this.stickers.splice(index, 1);
    }
  }
}
