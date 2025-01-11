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
  IonFabButton,
  IonFooter,
  IonList,
  IonItem,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, receiptOutline, search } from 'ionicons/icons';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    IonItem,
    IonList,
 
    IonFabButton,
    IonFab,
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
  constructor() {}
  friends: any[] = [];
  clearFilter() {}
  addExpense() {}
  addFriends() {
    this.friends.push('kalsh', 'Aditya');
  }

  ngOnInit() {
    addIcons({ personAddOutline, search, receiptOutline });
  }
}
