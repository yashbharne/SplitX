import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SendingReceivingDataService {
  constructor() {}
  private data: any;
  callFrom: string = '';

  setData(data: any, callFrom: string) {
    this.data = data;
    this.callFrom = callFrom;
  }

  getData() {
    return this.data;
  }
}
