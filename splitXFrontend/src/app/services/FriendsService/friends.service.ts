import { Injectable } from '@angular/core';
import { HttpService } from '../httpService/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  constructor(private httpService: HttpService) {}

  getAllFriendsOfUser(): Observable<any> {
    return this.httpService.securedGet('api/friends/');
  }
}
