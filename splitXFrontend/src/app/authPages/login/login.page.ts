import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonLabel,
  IonItem,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authenticationService/authentication.service';
import { UserSignalService } from 'src/app/services/userSignalService/user-signal.service';
import { ToastService } from 'src/app/services/toastService/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonButton,
    IonInput,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    IonInputPasswordToggle,
  ],
})
export class LoginPage implements OnInit {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private userSignal: UserSignalService,
    private toast: ToastService
  ) {}
  loginForm!: FormGroup;
  userDetails: any[] = [];

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onLogin() {
    console.log('In login');

    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.authenticationService.login(formData).subscribe({
        next: (res: any) => {
          this.userSignal.user.set(res.loggedInUser);
          this.userSignal.userPresent.set(true);
          localStorage.setItem('refresh-token', res.refreshToken);
          localStorage.setItem('access-token', res.accessToken);
          this.router.navigateByUrl('/dashboard/group');
          this.loginForm.reset();
        },
        error: (error) => {
          console.log(error);
          this.toast.presentToastWithOptions({
            message: error.error.message,
            duration: 3000,
            color: 'danger',
            position: 'bottom',
          });
        },
      });
    }
  }
  onForgotPassword() {
    console.log('Forgot Password');
  }
}
