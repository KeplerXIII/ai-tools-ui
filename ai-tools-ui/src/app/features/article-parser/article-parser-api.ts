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

export interface TranslateStreamResponse {
  source_lang: string | null;
  target_lang: string | null;
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

  async translateToRussianStream(
    text: string,
    onChunk: (chunk: string) => void
  ): Promise<TranslateStreamResponse> {
    const response = await fetch('/api/v1/translate/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        target_lang: 'ru',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка перевода: ${response.status}`);
    }

    const sourceLang = response.headers.get('X-Source-Lang');
    const targetLang = response.headers.get('X-Target-Lang');

    if (!response.body) {
      throw new Error('Пустой streaming response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let translation = '';

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      translation += chunk;
      onChunk(chunk);
    }

    return {
      source_lang: sourceLang,
      target_lang: targetLang,
      translation,
    };
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