import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  ArticleParserApi,
  EntitiesResponse,
  ExtractResponse,
} from './article-parser-api';

@Component({
  selector: 'app-article-parser',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './article-parser.html',
  styleUrl: './article-parser.scss',
})
export class ArticleParser {
  url = '';

  article: ExtractResponse | null = null;
  entities: EntitiesResponse | null = null;

  translatedText = '';
  annotation = '';

  loadingArticle = false;
  loadingEntities = false;
  loadingTranslation = false;
  loadingSummary = false;

  error = '';

  constructor(private api: ArticleParserApi) {}

  extractArticle(): void {
    const value = this.url.trim();

    if (!value) {
      return;
    }

    this.error = '';
    this.article = null;
    this.entities = null;
    this.translatedText = '';
    this.annotation = '';

    this.loadingArticle = true;

    this.api.extractByUrl(value).subscribe({
      next: (response) => {
        this.article = response;
        this.loadingArticle = false;
      },
      error: () => {
        this.error = 'Ошибка при извлечении статьи';
        this.loadingArticle = false;
      },
    });
  }

  requestEntities(): void {
    if (!this.article?.text) {
      return;
    }

    this.loadingEntities = true;
    this.error = '';
    this.entities = null;

    this.api.extractEntities(this.article.text).subscribe({
      next: (response) => {
        this.entities = response;
        this.loadingEntities = false;
      },
      error: () => {
        this.error = 'Ошибка при извлечении сущностей';
        this.loadingEntities = false;
      },
    });
  }

  translateArticle(): void {
    if (!this.article?.text) {
      return;
    }

    this.loadingTranslation = true;
    this.error = '';
    this.translatedText = '';
    this.annotation = '';

    this.api.translateToRussian(this.article.text).subscribe({
      next: (response) => {
        this.translatedText = response.translation;
        this.loadingTranslation = false;
      },
      error: () => {
        this.error = 'Ошибка при переводе статьи';
        this.loadingTranslation = false;
      },
    });
  }

  summarizeArticle(): void {
    if (!this.translatedText.trim()) {
      return;
    }

    this.loadingSummary = true;
    this.error = '';
    this.annotation = '';

    this.api.summarize(this.translatedText).subscribe({
      next: (response) => {
        this.annotation = response.annotation;
        this.loadingSummary = false;
      },
      error: () => {
        this.error = 'Ошибка при формировании аннотации';
        this.loadingSummary = false;
      },
    });
  }

  clear(): void {
    this.url = '';
    this.article = null;
    this.entities = null;
    this.translatedText = '';
    this.annotation = '';
    this.error = '';
  }
}