import { computed, Injectable, signal } from '@angular/core';
import { AuthenticationService } from '../authenticationService/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class UserSignalService {
  constructor(private authService: AuthenticationService) {}

  userPresent = signal<boolean>(false);
  user = signal<any>(undefined);

  async getUserProfile() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.userPresent.set(true);
        this.user.set(res.user);
     
      },
      error: (error) => {
        
      },
    });
    return this.user();
  }
}
