import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private httpService: HttpService) {}

  signUp(data: any): Observable<any> {
    return this.httpService.post('api/user/addUser', data);
  }

  login(data: any): Observable<any> {
    console.log('In service login');

    return this.httpService.post('api/user/login', data);
  }

  logout(callFrom: string): Observable<any> {
    return this.httpService.post('api/user/logout', {}, callFrom);
  }
  getProfile(): Observable<any> {
    return this.httpService.securedGet('api/user/profile');
  }
}
