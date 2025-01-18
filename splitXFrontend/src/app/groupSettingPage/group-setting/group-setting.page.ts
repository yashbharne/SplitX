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
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  create,
  createOutline,
  exitOutline,
  linkOutline,
  pencilOutline,
  personAddOutline,
  trashOutline,
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from 'src/app/services/groupService/groups.service';
import { UserSignalService } from 'src/app/services/userSignalService/user-signal.service';
import { GenerateAvatarService } from 'src/app/services/generateAvtar/generate-avatar.service';

interface GroupMember {
  name: string;
  owes: number;
  borrows: number;
}
@Component({
  selector: 'app-group-setting',
  templateUrl: './group-setting.page.html',
  styleUrls: ['./group-setting.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonGrid,
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
    public userSignal: UserSignalService,
    public router: Router
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
      create,
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
        console.log(res);

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
        console.log(res);

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
            this.groupService.deleteGroup(this.groupId).subscribe({
              next: (res: any) => {
                console.log(res);
                this.navCtrl.navigateBack('/dashboard/group');
              },
              error: (error: any) => {
                console.log(error);
              },
            });
            console.log('Group deleted');
          },
        },
      ],
    });
    await alert.present();
  }
  getAvatar(name: string) {
    // Use the DiceBear API with a specific style
    const diceBearUrl = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(
      name
    )}`;
    return { url: diceBearUrl, type: 'image' };
  }
}
