import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonChip,
  IonLabel,
  IonCardContent,
  IonList,
  IonItem,
  IonAvatar,
  IonBadge,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { addIcons } from 'ionicons';
import { cashOutline, personCircleOutline } from 'ionicons/icons';
import { UserSignalService } from '../services/user-signal.service';

interface settlement {
  creditor: {
    _id: string;
    name: string;
  };
  creditorAmount: number;
  member: [
    {
      memberId: {
        _id: string;
        name: string;
      };
      amount: number;
    }
  ];
}

@Component({
  selector: 'app-group-balance',
  templateUrl: './group-balance.page.html',
  styleUrls: ['./group-balance.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonBackButton,
    IonButtons,
    IonAvatar,
    IonItem,
    IonList,
    IonCardContent,
    IonLabel,
    IonChip,

    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class GroupBalancePage implements OnInit {
  groupSettlement: settlement[] = [];

  constructor(
    private routes: ActivatedRoute,
    private groupService: GroupsService,
    public userSignal: UserSignalService
  ) {}
  groupId: string = '';
  ngOnInit() {
    this.routes.params.subscribe((params) => {
      this.groupId = params['groupId'];
    });
    addIcons({ cashOutline, personCircleOutline });
    this.getGroupBalance();
  }
  getGroupBalance() {
    this.groupService.getGroupSettlement(this.groupId).subscribe({
      next: (res: any) => {
        this.groupSettlement = res.settlement;
        console.log(res);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  getAvatar(name: string) {
    // Use the DiceBear API with a specific style
    const diceBearUrl = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(
      name
    )}`;
    return { url: diceBearUrl, type: 'image' };
  }
  onMarkAsPaid(creditorId: string, debtorId: string, amount: number) {
    // console.log(creditorId, debtorId, amount);
    const creditor = creditorId;
    const debtor = debtorId;
    const amountToBePaid = amount;
    const data = {
      creditorId: creditor,

      debtorId: debtor,
      amount: amountToBePaid,
      groupId: this.groupId,
    };
    console.log(data);

    this.groupService.markAsPaid(data).subscribe({
      next: (res: any) => {
        console.log(res);
        this.getGroupBalance();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
