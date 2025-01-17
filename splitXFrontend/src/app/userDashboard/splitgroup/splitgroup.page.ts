import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonButton,
  IonItem,
  IonInput,
  IonList,
  IonListHeader,
  IonText,
  IonButtons,
  IonTabButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackCircle,
  receiptOutline,
  settings,
  closeCircle,
  createOutline,
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from 'src/app/services/groupService/groups.service';
import { GroupExpenseService } from 'src/app/services/groupExpenseService/group-expense.service';
import { SendingReceivingDataService } from 'src/app/services/sendingReceivingDataService/sending-receiving-data.service';
import { UserSignalService } from 'src/app/services/userSignalService/user-signal.service';

@Component({
  selector: 'app-splitgroup',
  templateUrl: './splitgroup.page.html',
  styleUrls: ['./splitgroup.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonListHeader,
    IonList,
    IonInput,
    IonItem,
    IonButton,
    IonLabel,
    IonIcon,
    IonContent,
    IonHeader,
    CommonModule,
    FormsModule,
  ],
})
export class SplitgroupPage implements OnInit {
  toggleAddFriends() {
    throw new Error('Method not implemented.');
  }
  showAddFriends: boolean = false;
  newFriends: string = '';
  constructor(
    private router: Router,
    private routes: ActivatedRoute,
    private group: GroupsService,
    private groupExpense: GroupExpenseService,
    private sendingReceivingData: SendingReceivingDataService,
    public userSignal: UserSignalService
  ) {}

  addmembers: any[] = [];
  groupId: any = '';
  groupDetails: any = {};
  groupMembers: any[] = [];
  expenses: any = '';

  ngOnInit() {
    this.routes.params.subscribe((param) => {
      this.groupId = param['groupId'];
      console.log(this.groupId);
    });
    this.getGroupDetails();
    this.getAllMembers();
    this.getExpenseOfGroup();
    addIcons({
      receiptOutline,
      settings,
      arrowBackCircle,
      closeCircle,
      createOutline,
    });
  }
  onBack() {
    this.router.navigateByUrl('/dashboard/group');
  }
  addExpense() {
    this.router.navigateByUrl(`/add-expense/${this.groupId}`);
  }

  getGroupDetails() {
    this.group.getGroupDetails(this.groupId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.groupDetails = res.group;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  showMembersList = false;
  newFriend = '';

  toggleAddFriendBar() {
    this.showAddFriends = !this.showAddFriends;
    this.showMembersList = false;
  }

  cancelAddFriendBar() {
    this.showAddFriends = false;
    this.newFriend = '';
  }

  addMember() {
    if (this.newFriend.trim()) {
      this.addmembers.push(this.newFriend.trim());
      this.newFriend = '';
    }
  }

  showAddedMembers() {
    this.showAddFriends = false;
    this.showMembersList = true;
  }

  removeMember(index: number) {
    this.addmembers.splice(index, 1);
  }
  submitAddedFriends() {
    console.log(this.addmembers);
    this.group
      .addMember({ groupId: this.groupId, member: this.addmembers })
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.addmembers = [];
          this.getAllMembers();
          this.showAddFriends = false;
          this.newFriend = '';
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
  getAllMembers() {
    this.group.getAllMember({ groupId: this.groupId }).subscribe({
      next: (res: any) => {
        console.log(res);
        this.groupMembers = res.getMembers;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getExpenseOfGroup() {
    this.groupExpense.getExpensesOfGroup(this.groupId).subscribe({
      next: (res: any) => {
        this.expenses = res;
        console.log(res);
      },
      error: (error) => {
        console.log(error.error);
      },
    });
  }
  onGetExpense(expenseId: string) {
    this.router.navigateByUrl(`/expense/${expenseId}`);
  }
  onSetting() {
    console.log('clicked');

    this.router.navigateByUrl(`/group-setting/${this.groupId}`);
  }
  onCalculateBalance() {
    this.router.navigateByUrl(`/group-balance/${this.groupId}`);
  }
  onEditExpense(expense: any) {
    console.log(expense);

    this.sendingReceivingData.setData(expense, 'editExpense');
    this.router.navigateByUrl(`/add-expense/${this.groupId}`);
  }
  getAvatar(name: string) {
    // Use Unsplash Source API for random nature images
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
      name
    )}`;
  }
}
