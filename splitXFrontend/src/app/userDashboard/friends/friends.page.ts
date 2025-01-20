import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
  IonContent,
  IonLabel,
  IonFab,
  IonList,
  IonItem,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personAddOutline,
  personCircle,
  receiptOutline,
  search,
} from 'ionicons/icons';
import { FriendsService } from 'src/app/services/FriendsService/friends.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [
    IonAvatar,

    IonItem,
    IonList,

    IonLabel,
    IonContent,
    IonButtons,
    IonIcon,
    IonButton,
    IonHeader,
    CommonModule,
    FormsModule,
    IonToolbar,
    IonTitle,
  ],
})
export class FriendsPage implements OnInit {
  constructor(private friendService: FriendsService) {}
  friends: any[] = [];
  clearFilter() {}
  addExpense() {}

  ngOnInit() {
    addIcons({ personCircle, search, receiptOutline });
    this.getFriends();
  }

  getFriends() {
    this.friendService.getAllFriendsOfUser().subscribe({
      next: (res: any) => {
        this.friends = res.filteredMembers;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
