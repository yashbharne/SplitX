import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  async presentToast(message: string, duration: number = 3000, color: string = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'bottom', // You can change to 'top' or 'middle' if needed
    });
    toast.present();
  }

  async presentToastWithOptions(options: {
    message: string;
    duration?: number;
    color?: string;
    position?: 'top' | 'middle' | 'bottom';
    buttons?: any[];
  }) {
    const toast = await this.toastController.create({
      message: options.message,
      duration: options.duration ?? 3000,
      color: options.color ?? 'dark',
      position: options.position ?? 'bottom',
      buttons: options.buttons,
    });
    toast.present();
  }
}
