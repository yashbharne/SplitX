import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GenerateAvatarService {
  dicBearUrlMemberProfilePic =
    'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=';
  dicBearUrlGroupProfilePic = 'https://api.dicebear.com/9.x/thumbs/svg?seed=';

  getAvatar(profileName: string, callFrom: string) {
    const diceBearUrl =
      callFrom === 'memberProfile'
        ? `${this.dicBearUrlMemberProfilePic}${encodeURIComponent(profileName)}`
        : `${this.dicBearUrlGroupProfilePic}${encodeURIComponent(profileName)}`;
    return { url: diceBearUrl, type: 'image' };
  }
}
