import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
interface Member {
  memberName: string;
  memberId: string;
  memberAvatar: string;
}

interface Group {
  groupName: string;
  groupId: string;
  groupMembers: Member[];
}

@Injectable({
  providedIn: 'root',
})
export class GroupSignalService {
  constructor() {}
  private groupSubject = new BehaviorSubject<Group | null>(null); 
}
