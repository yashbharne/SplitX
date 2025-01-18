import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loader: HTMLIonLoadingElement | null = null;
  private requestsInProgress = 0;

  constructor(private loadingController: LoadingController) {}

  private loaderTimeout: any;

  async showLoader(message: string = 'Please wait...') {
    this.requestsInProgress++;
    console.log('Show loader. Requests in progress:', this.requestsInProgress);

    // Delay showing the loader to avoid flickering
    if (!this.loader && !this.loaderTimeout) {
      this.loaderTimeout = setTimeout(async () => {
        this.loader = await this.loadingController.create({
          message,
          spinner: 'lines',
        });
        await this.loader.present();
        this.loaderTimeout = null;
      }, 300); // Delay of 300ms
    }
  }

  async hideLoader() {
    if (this.requestsInProgress > 0) {
      this.requestsInProgress--;
    }

    console.log('Hide loader. Requests in progress:', this.requestsInProgress);

    if (this.requestsInProgress === 0) {
      clearTimeout(this.loaderTimeout); // Clear timeout if loader not yet shown
      this.loaderTimeout = null;

      if (this.loader) {
        await this.loader.dismiss();
        this.loader = null;
      }
    }
  }
}
