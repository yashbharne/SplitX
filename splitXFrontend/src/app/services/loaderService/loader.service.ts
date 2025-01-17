import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) {}

  async showLoader(message: string = 'Loading...') {
    if (!this.loading) {
      this.loading = await this.loadingController.create({
        message,
        spinner: 'lines-small',
      });
      console.log(this.loading);

      await this.loading.present();
    }
  }

  async hideLoader() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null; 
    }
  }
}
