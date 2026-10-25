import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterGames',
})
export class FilterGamesPipe implements PipeTransform {
  // Works for anything with a title: full Game objects (home) and catalog rows (admin).
  transform<T extends { title: string }>(value: Array<T>, filtro: string): Array<T> | null {
    
    if (!value) {
      return null;
    }
    
    if (!filtro) {
      return value;
    }
    return value.filter(game => game.title.toLowerCase().includes(filtro.toLowerCase()));
  }
}
