import { TranslateService } from '@ngx-translate/core';
import { Variant, VariantGroup } from './../../../common.types';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
    private global: string;
    private local: string;

    constructor(private translateService: TranslateService) {
        // Translate
        this.global = translateService.instant('general.global_variant');
        this.local = this.translateService.instant('general.local_variant');
    }

    transform(collection: Array<Variant>, property: string): Array<VariantGroup> {
        // Prevents the application from breaking if the array of objects doesn't exist yet
        if (!collection) {
            return null;
        }

        const groupedCollection = collection.reduce((previous, current) => {
            if (!previous[current[property]]) {
                previous[current[property]] = [current];
            } else {
                previous[current[property]].push(current);
            }

            return previous;
        }, {});

        // This will return an array of objects, each object containing a group of objects
        return Object.keys(groupedCollection).map(key => ({
            name: key === 'null' ? this.global : this.local,
            variants: groupedCollection[key]
        }));
    }
}
