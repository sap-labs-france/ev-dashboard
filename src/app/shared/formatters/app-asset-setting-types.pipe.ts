import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appAssetSettingTypes' })
export class AppAssetSettingTypes implements PipeTransform {
  public transform(type: string) {
    if (!type || type === '') {
      return '';
    }
    switch (type) {
      case 'bms':
        return 'settings.asset.connection.type';
      default:
        return type;
    }
  }
}
