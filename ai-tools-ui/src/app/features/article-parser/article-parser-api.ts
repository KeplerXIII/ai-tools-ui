import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ImageInfo {
  url: string;
  alt: string | null;
  title: string | null;
}

export interface ExtractResponse {
  title: string | null;
  author: string | null;
  date: string | null;
  url: string | null;
  text: string;
  length: number;
  method: string;
  quality: string;
  needs_review: boolean;
  images: ImageInfo[];
  main_image: string | null;
}

export interface EntitiesResponse {
  military_equipment: string[];
  manufacturers: string[];
  contracts: string[];
}

export interface TranslateResponse {
  source_lang: string;
  target_lang: string;
  translation: string;
}

export interface SummaryResponse {
  annotation: string;
}

@Injectable({
  providedIn: 'root',
})
export class ArticleParserApi {
  constructor(private http: HttpClient) {}

  extractByUrl(url: string) {
    return this.http.post<ExtractResponse>('/api/v1/extract/url', {
      url,
    });
  }

  extractEntities(text: string) {
    return this.http.post<EntitiesResponse>('/api/v1/extract/entities', {
      text,
    });
  }

  translateToRussian(text: string) {
    return this.http.post<TranslateResponse>('/api/v1/translate', {
      text,
      target_lang: 'ru',
    });
  }

  summarize(text: string) {
    return this.http.post<SummaryResponse>('/api/v1/extract/summary', {
      text,
    });
  }

  tagText(text: string, maxTags = 12) {
    return this.http.post<{ tags: string[] }>('/api/v1/extract/tags', {
      text,
      max_tags: maxTags,
    });
  }
}