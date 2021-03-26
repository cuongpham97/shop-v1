import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tracePath'
})
export class TraceCategoryPathPipe implements PipeTransform {
  transform(category: any): unknown {
    if (!category) return '';

    const { name, ancestors } = category;

    return ancestors.map(i => i.name || '???').concat(name).join(' > ');
  }
}
