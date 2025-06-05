import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User } from '@angular/fire/auth';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

import { Router } from '@angular/router';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  name = '';

  constructor(
    private auth: Auth,
    private storage: Storage,
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private router: Router,
    public photoService: PhotoService
  ) {}

  async register() {
    if (!this.name) {
      return this.showAlert('Por favor ingresa tu nombre');
    }
    if (!this.photoService.photoBase64) {
      return this.showAlert('Por favor toma una foto');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      const photoUrl = await this.uploadPhoto(user);

      // Actualizar perfil en Firebase Auth
      await updateProfile(user, {
        displayName: this.name,
        photoURL: photoUrl
      });

      // Guardar datos en Firestore
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userDocRef, {
        uid: user.uid,
        username: this.name,
        photoURL: photoUrl,
        email: this.email,
        createdAt: new Date()
      });

      this.showAlert('Usuario registrado con éxito');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error(error);
      this.showAlert(error.message || 'Error al registrar usuario');
    }
  }

  async login() {
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.showAlert('Inicio de sesión exitoso');
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.showAlert(error.message || 'Error al iniciar sesión');
    }
  }

  async takePhoto() {
    try {
      await this.photoService.takePhoto();
    } catch {
      this.showAlert('Error al tomar la foto');
    }
  }

  private async uploadPhoto(user: User): Promise<string> {
    if (!this.photoService.photoBase64) throw new Error('No hay foto para subir');

    // Limpiar prefijo si existe
    const base64 = this.photoService.photoBase64.startsWith('data:image')
      ? this.photoService.photoBase64.split(',')[1]
      : this.photoService.photoBase64;

    const storageRef = ref(this.storage, `users/${user.uid}/profile.jpg`);
    try {
      await uploadString(storageRef, base64, 'base64');
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error subiendo la foto:', error);
      throw new Error('Error subiendo la foto');
    }
  }

  private async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Aviso',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
