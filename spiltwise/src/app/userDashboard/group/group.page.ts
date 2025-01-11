import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonFab,
  IonFabButton,
  IonItem,
  IonAvatar,
  IonList,
  IonButtons,
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, peopleOutline, personAddOutline } from 'ionicons/icons';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.page.html',
  styleUrls: ['./group.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonAvatar,
    IonItem,
    IonFabButton,
    IonFab,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonItem,

    IonButton,
    IonContent,
    IonLabel,
    CommonModule,
    IonHeader,
  ],
})
export class GroupPage implements OnInit {
  constructor(private route: Router, private groupService: GroupsService) {
    addIcons({ personAddOutline });
  }
  listOfGroup: any[] = [];

  ngOnInit() {
    addIcons({ add, personAddOutline });
    this.getAllGroups();
  }

  getAllGroups() {
    this.groupService.getGroupsOfUser().subscribe({
      next: (res: any) => {
        console.log(res);
        this.listOfGroup = res.group;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  createGroup() {
    this.route.navigateByUrl('/create-group');
  }
  viewGroup(id: string) {
    this.route.navigateByUrl(`/dashboard/splitgroup/${id}`);
  }
  getAvatar(group: { groupName: string }) {
    console.log(group.groupName);

    // Use Unsplash Source API for random nature images
    return `https://source.unsplash.com/random/80x80/?nature,${encodeURIComponent(
      group.groupName
    )}`;
  }
}
