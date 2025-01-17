import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonBackButton,
  IonLabel,
  IonInput,
  IonItem,
  IonInputPasswordToggle,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { cameraOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SafeUrl } from '@angular/platform-browser';
import { AuthenticationService } from 'src/app/services/authenticationService/authentication.service';
import { LoaderService } from 'src/app/services/loaderService/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonButtons,
    IonBackButton,
    IonLabel,
    IonInput,
    IonItem,
    IonInputPasswordToggle,
    IonButton,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IonIcon,
  ],
})
export class SignUpPage implements OnInit {
  signUpForm!: FormGroup;
  userDetails: any[] = [];
  image: string | undefined;
  imageUrl!: SafeUrl;
  constructor(
    private authenticationService: AuthenticationService,
    private loaderService: LoaderService,
    private router: Router
  ) {
    addIcons({ cameraOutline });
  }

  userRegisterData: any = {
    name: '',
    email: '',
    phoneNumber: {
      countryCode: '',
      number: '',
    },
    password: '',
    profilePic: '',
  };

  ngOnInit() {
    addIcons({ cameraOutline });
    this.signUpForm = new FormGroup({
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      countryCode: new FormControl('', [Validators.required]),
      mobileNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'), // Validate 10-digit phone number
      ]),
      imageUrl: new FormControl('', [Validators.required]),
    });
  }

  async uploadImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Base64,
      });

      const base64Image = `data:image/jpeg;base64,${image.base64String}`;

      console.log('base64Image: ', base64Image);

      this.signUpForm.get('imageUrl')?.setValue(base64Image);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  onSubmit() {
    this.loaderService.showLoader('Please Wait');
    if (this.signUpForm.valid) {
      const formData = this.signUpForm.value;

      const base64Image = formData.imageUrl.split(',')[1]; // Extract Base64 part
      const file = this.base64ToFile(base64Image, 'profilePic.jpg');
      console.log('file', file);

      const userFormData = new FormData();
      userFormData.append('name', formData.fullName);
      userFormData.append('email', formData.email);
      userFormData.append('password', formData.password);
      userFormData.append(
        'phoneNumber',
        JSON.stringify({
          countryCode: formData.countryCode,
          number: formData.mobileNumber,
        })
      );
      userFormData.append('profilePic', file);

      this.authenticationService.signUp(userFormData).subscribe({
        next: (res: any) => {
          console.log('User Registered:', res);
          this.signUpForm.reset();
          this.loaderService.hideLoader();
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          console.error('Registration Error:', error);
        },
      });
    }
  }

  base64ToFile(base64: string, filename: string): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: 'image/jpeg' });
  }
}
