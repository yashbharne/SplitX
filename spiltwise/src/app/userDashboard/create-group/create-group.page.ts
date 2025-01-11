import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonLabel,
  IonBackButton,
  IonButton,
  IonItem,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, cameraOutline } from 'ionicons/icons';
import { HttpService } from 'src/app/services/http.service';
import { GroupsService } from 'src/app/services/groups.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
  standalone: true,
  imports: [
    IonInput,

    IonIcon,
    IonButton,
    IonBackButton,
    IonButtons,
    IonHeader,
    CommonModule,
    FormsModule,
    IonToolbar,
    IonLabel,
    IonContent,
  ],
})
export class CreateGroupPage implements OnInit {
  uploadPhoto() {}
  groupName: string = '';

  constructor(private groupService: GroupsService, private router: Router) {}

  ngOnInit() {
    addIcons({ camera });
  }
  onCreatingGroup() {
    console.log(this.groupName);

    this.groupService.addGroup({ groupName: this.groupName }).subscribe({
      next: (res: any) => {
        console.log(res);
        this.router.navigateByUrl('/dashboard/group');
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
