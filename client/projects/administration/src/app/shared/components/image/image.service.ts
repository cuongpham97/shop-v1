import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  
  constructor(private http: HttpClient) { }

  _prepareUpload(data) {
    return {
      name: data.name,
      image: data.image,
      description: data.description
    };
  }

  uploadImage(data) {
    return this.http.post('/images', data, { reportProgress: true, observe: 'events' });
  }
}
