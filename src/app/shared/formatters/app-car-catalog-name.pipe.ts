import { Pipe, PipeTransform } from '@angular/core';
import { CarCatalog } from 'types/Car';
import { Utils } from 'utils/Utils';

@Pipe({ name: 'appCarCatalogName' })
export class AppCarCatalogNamePipe implements PipeTransform {
  public transform(carCatalog: CarCatalog): string {
    return Utils.buildCarCatalogName(carCatalog, false);
  }
}
