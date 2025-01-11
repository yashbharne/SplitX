import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  camera,
  cameraOutline,
  createOutline,
  diamondOutline,
  helpCircleOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  notificationsOutline,
  qrCodeOutline,
  searchOutline,
  starOutline,
} from 'ionicons/icons';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { UserSignalService } from 'src/app/services/user-signal.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [
    IonListHeader,
    IonLabel,
    IonItem,
    IonList,
    IonButton,
    IonIcon,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class AccountPage implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    public userSignal: UserSignalService
  ) {
    addIcons({
      searchOutline,
      cameraOutline,
      qrCodeOutline,
      diamondOutline,
      mailOutline,
      notificationsOutline,
      lockClosedOutline,
      starOutline,
      helpCircleOutline,
      logOutOutline,
    });
  }

  username: string = '';
  email: string = '';
  profilePic: string = '';

  ngOnInit() {
    addIcons({
      'log-out-outline': logOutOutline,
      'create-outline': createOutline,
      'qr-code-outline': qrCodeOutline,
      'diamond-outline': diamondOutline,
      'mail-outline': mailOutline,
      'notifications-outline': notificationsOutline,
      'lock-closed-outline': lockClosedOutline,
      'star-outline': starOutline,
      'help-circle-outline': helpCircleOutline,
      'search-outline': searchOutline,
      'camera-outline': cameraOutline,
      camera,
    });
    this.ionViewWillEnter();
  }
  ionViewWillEnter() {
    console.log('Method called from account');
    this.userSignal.getUserProfile();

    
  }
  onLogout() {
    this.authenticationService.logout('logout').subscribe({
      next: (res: any) => {
        console.log(res);
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('access-token');
        this.router.navigateByUrl('/home');
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
