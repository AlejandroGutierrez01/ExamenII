import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { PhotoService } from '../services/photo.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  user: any;
  content = '';
  posts: any[] = [];

  constructor(private authService: AuthService,public photoService: PhotoService, private supabase: SupabaseService,private alertCtrl: AlertController ) { }

  async ngOnInit() {
    this.user = await this.authService.currentUser;
    this.loadPosts();
  }

  async loadPosts() {
    try {
      this.posts = await this.supabase.getPosts();
    } catch (err) {
      this.showAlert('Error al cargar publicaciones');
    }
  }

  async takePhoto() {
    try {
      await this.photoService.takePhoto();
    } catch {
      this.showAlert('No se pudo tomar la foto');
    }
  }

  async postNews() {
    if (!this.content.trim()) {
      return this.showAlert('El contenido no puede estar vacío');
    }

    if (!this.photoService.photoBase64) {
      return this.showAlert('Por favor toma una foto');
    }

    const filePath = `post-${Date.now()}.jpg`;

    try {
      const imageUrl = await this.supabase.uploadImage(
        this.photoService.photoBase64,
        filePath
      );

      await this.supabase.addPost({
        content: this.content,
        image_url: imageUrl,
        user_name: this.user.displayName,
        user_photo: this.user.photoURL,
      });

      this.content = '';
      this.photoService.photoBase64 = null;
      await this.loadPosts();
    } catch (err: any) {
      this.showAlert('Error al publicar: ' + err.message);
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
