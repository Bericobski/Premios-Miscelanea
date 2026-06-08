import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../classes/user';

@Pipe({
  name: 'filterUsers',
})
export class FilterUsersPipe implements PipeTransform {
  transform(value: Array<User>, filtro: string): Array<User> | null {
    
    if (!value) {
      return null;
    }
    
    if (!filtro) {
      return value;
    }
    
    const filterLower = filtro.toLowerCase();
    return value.filter(user => 
      user.name.toLowerCase().includes(filterLower) ||
      user.nickname.toLowerCase().includes(filterLower) ||
      user.email.toLowerCase().includes(filterLower)
    );
  }
}