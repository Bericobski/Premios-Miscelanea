import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '../classes/game';

@Pipe({
  name: 'filterGames',
})
export class FilterGamesPipe implements PipeTransform {
  transform(value: Array<Game>, filtro: string): Array<Game> | null {
    
    if (!value) {
      return null;
    }
    
    if (!filtro) {
      return value;
    }
    return value.filter(game => game.title.toLowerCase().includes(filtro.toLowerCase()));
  }
}
