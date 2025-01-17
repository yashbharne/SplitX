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
  IonLabel,
  IonBackButton,
  IonButton,
  IonItem,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, cameraOutline, checkmark } from 'ionicons/icons';
import { HttpService } from 'src/app/services/httpService/http.service';
import { GroupsService } from 'src/app/services/groupService/groups.service';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    ReactiveFormsModule,
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
  createGroupForm: FormGroup = new FormGroup({
    groupName: new FormControl('', [Validators.required]),
    profilePic: new FormControl(''),
  });
  isPicUploaded: boolean = false;

  constructor(private groupService: GroupsService, private router: Router) {}

  ngOnInit() {
    addIcons({ camera, checkmark });
  }

  onCreatingGroup() {
    const formData = new FormData();

    // Append the group name
    formData.append('groupName', this.createGroupForm.get('groupName')?.value);

    // Append the profile picture if it exists
    const profilePic = this.createGroupForm.get('profilePic')?.value;
    if (profilePic) {
      const base64Image = profilePic.split(',')[1]; // Extract Base64 part
      const file = this.base64ToFile(base64Image, 'profilePic.jpg');
      formData.append('profilePic', file);
    }

    this.groupService.addGroup(formData).subscribe({
      next: (res: any) => {
        console.log(res);
        this.createGroupForm.reset();
        this.router.navigateByUrl('/dashboard/group');
      },
      error: (error) => {
        console.error('Error adding group:', error);
      },
    });
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

  async uploadPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Base64,
      });

      const base64Image = `data:image/jpeg;base64,${image.base64String}`;
      if (base64Image) {
        this.isPicUploaded = true;
      }
      this.createGroupForm.get('profilePic')?.setValue(base64Image);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
}
