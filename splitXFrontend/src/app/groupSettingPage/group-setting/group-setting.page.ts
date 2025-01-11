import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonButtons,
  IonBackButton,
  IonList,
  IonAvatar,
  IonLabel,
  IonButton,
  IonIcon,
  IonListHeader,
  IonBadge,
  NavController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  createOutline,
  exitOutline,
  linkOutline,
  personAddOutline,
  trashOutline,
} from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from 'src/app/services/groups.service';
import { UserSignalService } from 'src/app/services/user-signal.service';
import { GenerateAvatarService } from 'src/app/services/generate-avatar.service';

interface GroupMember {
  name: string;
  avatar?: string; // Optional if not all members have avatars
}
@Component({
  selector: 'app-group-setting',
  templateUrl: './group-setting.page.html',
  styleUrls: ['./group-setting.page.scss'],
  standalone: true,
  imports: [
    IonListHeader,
    IonIcon,
    IonButton,
    IonLabel,
    IonAvatar,
    IonList,
    IonBackButton,
    IonButtons,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class GroupSettingPage implements OnInit {
  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private routes: ActivatedRoute,
    private groupService: GroupsService,
    public userSignal: UserSignalService
  ) {
    addIcons({ createOutline, exitOutline, trashOutline });
  }
  ngOnInit(): void {
    addIcons({
      createOutline,
      trashOutline,
      exitOutline,
      linkOutline,
      personAddOutline,
    });
    this.routes.params.subscribe((params) => {
      this.groupId = params['groupId'];
    });
    this.getGroupMembers();
    this.groupDetails();
    this.ionViewWillEnter();
  }
  ionViewWillEnter() {
    console.log('Method called from account');
    this.userSignal.getUserProfile();
  }
  groupId: string = '';
  groupMembers: GroupMember[] = []; // Initialize as an empty array
  groupName: string = '';

  getGroupMembers() {
    this.groupService.getAllMember({ groupId: this.groupId }).subscribe({
      next: (res: any) => {
        this.groupMembers = res.getMembers as GroupMember[]; // Cast to the correct type
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  groupDetails() {
    this.groupService.getGroupDetails(this.groupId).subscribe({
      next: (res: any) => {
        this.groupName = res.group.groupName;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  async deleteGroup() {
    const alert = await this.alertCtrl.create({
      header: 'Delete Group',
      message: 'Are you sure you want to delete this group?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            console.log('Group deleted');
            this.navCtrl.navigateBack('/home');
          },
        },
      ],
    });
    await alert.present();
  }
  getAvatar(member: { name: string }) {
    // Use the DiceBear API with a specific style
    const diceBearUrl = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(
      member.name
    )}`;
    return { url: diceBearUrl, type: 'image' };
  }
}
