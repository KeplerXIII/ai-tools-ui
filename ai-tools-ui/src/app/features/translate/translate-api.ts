import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface TranslateResponse {
  translation: string;
  source_lang?: string;
  target_lang?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TranslateApi {
  private readonly apiUrl = '/api/v1/translate';

  constructor(private http: HttpClient) {}

  translate(text: string) {
    return this.http.post<TranslateResponse>(this.apiUrl, {
      text,
      target_lang: 'ru',
    });
  }
}