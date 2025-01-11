import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupExpenseService {
  constructor(private httpService: HttpService) {}

  addExpense(data: any): Observable<any> {
    return this.httpService.securedPost('api/groupExpense/addExpense', data);
  }

  getExpensesOfGroup(groupId: string): Observable<any> {
    return this.httpService.securedGet(
      `api/groupExpense/getAllGroupExpense/${groupId}`
    );
  }
  getExpense(expenseId:string):Observable<any>{
    return this.httpService.securedGet(`api/groupExpense/getExpense/${expenseId}`);
  }
}
