import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterOutlet } from '@angular/router';

import {
  IonTitle,
  IonToolbar,
  IonHeader,
  IonFooter,
  IonItem,
  IonLabel,
  IonIcon,
  IonContent,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  clipboard,
  clipboardOutline,
  peopleOutline,
  personCircleOutline,
  personOutline,
} from 'ionicons/icons';
import { UserSignalService } from 'src/app/services/user-signal.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonLabel,
    IonFooter,

    RouterOutlet,
    CommonModule,
  ],
})
export class DashboardLayoutComponent implements OnInit {
  activeRoute: string = '';

  constructor(private router: Router, public userSignal: UserSignalService) {
    addIcons({ peopleOutline, personOutline, clipboardOutline });
  }
  imageUrl: string = '';
  count = 0;

  ngOnInit() {
    addIcons({
      peopleOutline,
      personOutline,
      clipboardOutline,
      personCircleOutline,
    });
    this.ionViewWillEnter();
  }
  async ionViewWillEnter() {
    const user: any = await this.userSignal.getUserProfile();
  }

  directToPage(route: string) {
    this.activeRoute = route;
    switch (route) {
      case 'group': {
        this.router.navigateByUrl('/dashboard/group');
        break;
      }
      case 'friends': {
        this.router.navigateByUrl('/dashboard/friends');
        break;
      }
      case 'activity': {
        this.router.navigateByUrl('/dashboard/activity');
        break;
      }
      case 'account': {
        this.router.navigateByUrl('/dashboard/account');
        break;
      }
    }
  }
}
