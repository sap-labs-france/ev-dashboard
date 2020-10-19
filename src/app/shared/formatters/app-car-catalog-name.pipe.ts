import { Pipe, PipeTransform } from '@angular/core';
import { CarCatalog } from 'app/types/Car';
import { Utils } from 'app/utils/Utils';

@Pipe({ name: 'appCarCatalogName' })
export class AppCarCatalogNamePipe implements PipeTransform {

    public transform(carCatalog: CarCatalog): string {
        return Utils.buildCarCatalogName(carCatalog, false);
    }
}
