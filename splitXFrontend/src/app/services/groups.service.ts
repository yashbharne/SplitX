import { Injectable, signal } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  constructor(private httpService: HttpService) {}
  addGroup(data: any): Observable<any> {
    console.log(data);

    return this.httpService.securedPost('api/group/addGroup', data);
  }
  getGroupsOfUser(): Observable<any> {
    return this.httpService.securedGet('api/group/getAllGroups');
  }
  getGroupDetails(id: string): Observable<any> {
    return this.httpService.securedGet(`api/group/getGroupDetails/${id}`);
  }
  addMember(data: any): Observable<any> {
    return this.httpService.securedPost(`api/group/addMember`, data);
  }
  getAllMember(data: any): Observable<any> {
    return this.httpService.securedPost(`api/group/getAllMembers`, data);
  }
  getGroupSettlement(groupId: string): Observable<any> {
    return this.httpService.securedGet(
      `api/groupExpense/getGroupBalance/${groupId}`
    );
  }
  markAsPaid(data: any): Observable<any> {
    return this.httpService.securedPost(`api/groupExpense/settleBalance`);
  }
}
