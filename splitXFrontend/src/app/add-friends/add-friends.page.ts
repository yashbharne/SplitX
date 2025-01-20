import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import {
  IonTitle,
  IonToolbar,
  IonContent,
  IonCard,
  IonInput,
  IonButton,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonHeader,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { GroupsService } from '../services/groupService/groups.service';
import { FriendsService } from '../services/FriendsService/friends.service';

@Component({
  selector: 'app-add-friends',
  templateUrl: './add-friends.page.html',
  standalone: true,
  imports: [
    IonBackButton,
    IonButtons,
    IonHeader,
    IonIcon,
    IonList,
    IonLabel,
    IonItem,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonButton,
    IonInput,
    IonCard,
    IonContent,
    IonToolbar,
    IonTitle,
    CommonModule,
    FormsModule,
  ],
  styleUrls: ['./add-friends.page.scss'],
})
export class AddFriendsPage implements OnInit {
  friendName: string = '';
  friends: string[] = [];
  groupId: string = '';
  alreadyFriendsOfUser: string[] = [];
  suggestionFriend: string[] = [];
  showSuggestion: boolean = false;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private routes: ActivatedRoute,
    private group: GroupsService,
    private friendsService: FriendsService,
    private router: Router
  ) {}
  ngOnInit(): void {
    addIcons({ closeCircle });
    this.routes.params.subscribe(
      (params) => (this.groupId = params['groupId'])
    );
    this.getFriendsOfUser();
  }

  addFriend() {
    if (this.friendName.trim() === '') {
      this.showToast('Please enter a valid name.', 'danger');
      return;
    }
    this.friends.push(this.friendName.trim());
    this.friendName = '';
    this.showToast('Friend added successfully!', 'success');
  }

  removeFriend(index: number) {
    this.friends.splice(index, 1);
    this.showToast('Friend removed!', 'warning');
  }

  async submitFriends() {
    const alert = await this.alertController.create({
      header: 'Confirm Submission',
      message: `You are about to submit ${this.friends.length} friends.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Submit',
          handler: () => {
            this.callApi();
          },
        },
      ],
    });
    await alert.present();
  }

  async callApi() {
    // Replace with your API call logic
    console.log('Submitted friends:', this.friends);
    this.group
      .addMember({ groupId: this.groupId, member: this.friends })
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.showToast('Friends submitted successfully!', 'success');
          this.friends = [];
          this.router.navigateByUrl(`/dashboard/splitgroup/${this.groupId}`);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }

  getFriendsOfUser() {
    this.friendsService.getAllFriendsOfUser().subscribe({
      next: (res: any) => {
        console.log(res.filteredMembers);
        this.alreadyFriendsOfUser = res.filteredMembers;
      },
    });
  }
  onInputChange() {
    this.suggestionFriend = [];
    this.showSuggestion = false;

    if (this.friendName.trim() !== '') {
      this.showSuggestion = true;
      const result = this.alreadyFriendsOfUser.filter((name) =>
        name.startsWith(this.friendName.toLocaleLowerCase())
      );
      this.suggestionFriend = result;
    }
  }
  selectSuggestion(friend: string) {
    this.friendName = friend;
    this.suggestionFriend = [];
    this.showSuggestion = false;
  }
}
