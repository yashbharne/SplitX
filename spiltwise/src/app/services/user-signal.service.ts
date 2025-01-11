import { computed, Injectable, signal } from '@angular/core';
import { AuthenticationService } from './authentication.service';

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
        console.log(this.user());
        
      },
      error: (error) => {
        console.log(error);
      },
    });
    return this.user()
  }
}
