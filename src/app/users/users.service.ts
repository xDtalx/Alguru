import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {User} from './user.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root'})
export class UsersService
{
  constructor(private http: HttpClient)
  {
  }

  getUsers()
  {
    this.http
      .get<any>('http://localhost:3000/api/users')
      .pipe(map(usersData =>
        {
          return usersData.map(user =>
            {
              return {
                id: user._id,
                username: user.username,
                hashedPassword: user.hashedPassword
              }
            });
        }))
      .subscribe(transUsers =>
        {
          console.log(transUsers);
        });
  }

  createUser(username: string, password: string)
  {
    const user: User =
    {
      id: null,
      username: username,
      hashedPassword: password
    }

    this.addUser(user);
  }

  addUser(user: User)
  {
    this.http.post<{ message: string, userId: string }>('http://localhost:3000/api/users', user)
      .subscribe(responseData =>
      {
        console.log(responseData);
      });
  }

  deleteUser(id: string)
  {
    this.http.delete('http://localhost:3000/api/users/' + id)
    .subscribe(() =>
    {
      console.log('User deleted');
    });
  }
}
