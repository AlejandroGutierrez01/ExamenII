import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photoBase64: string | null = null;

  constructor() {}

  public async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 90
      });

      if (photo.base64String) {
        this.photoBase64 = photo.base64String;
      } else {
        throw new Error('No se obtuvo la foto en base64');
      }
    } catch (error) {
      console.error('Error tomando foto', error);
      throw error;
    }
  }
}
