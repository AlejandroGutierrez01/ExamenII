// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://.supabase.co'
const supabaseKey = '---'
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {this.supabase = createClient(supabaseUrl, supabaseKey)}

  async uploadImage(base64: string, filePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('imagenes-noticias')
      .upload(filePath, base64, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = this.supabase
      .storage
      .from('imagenes-noticias')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async addPost(post: {
    content: string;
    image_url: string;
    user_name: string;
    user_photo: string;
  }) {
    const { error } = await this.supabase
      .from('Noticias')
      .insert([post]);

    if (error) throw error;
  }

  async getPosts() {
    const { data, error } = await this.supabase
      .from('Noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
