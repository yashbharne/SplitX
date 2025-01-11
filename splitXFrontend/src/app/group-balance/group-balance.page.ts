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
  IonIcon,
  IonChip,
  IonLabel,
  IonCardContent,
  IonList,
  IonItem,
  IonAvatar,
  IonBadge,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { addIcons } from 'ionicons';
import { cashOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-group-balance',
  templateUrl: './group-balance.page.html',
  styleUrls: ['./group-balance.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonAvatar,
    IonItem,
    IonList,
    IonCardContent,
    IonLabel,
    IonChip,
    IonIcon,
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
  settlement: any = {};

  constructor(
    private routes: ActivatedRoute,
    private groupService: GroupsService
  ) {}
  groupId: string = '';
  ngOnInit() {
    this.routes.params.subscribe((params) => {
      this.groupId = params['groupId'];
    });
    addIcons({ cashOutline, personCircleOutline });
  }
  getGroupBalance() {
    this.groupService.getGroupSettlement(this.groupId).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
