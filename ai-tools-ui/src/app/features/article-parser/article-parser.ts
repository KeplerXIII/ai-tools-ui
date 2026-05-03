import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SkeletonModule } from 'primeng/skeleton';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChipModule } from 'primeng/chip';
import { ImageModule } from 'primeng/image';
import { ArticleParserApi } from './article-parser-api';
import { ArticleParserState } from './article-parser-state';
import { PrimaryButtonComponent } from '../../shared/ui/primary-button/primary-button.component';
import {
  ButtonVariant,
  OutlineButtonComponent,
} from '../../shared/ui/outline-button/outline-button.component';
import { ArticleParserUrlFormComponent } from './article-parser-url-form/article-parser-url-form';

@Component({
  selector: 'app-article-parser',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FloatLabelModule,
    InputTextModule,
    PrimaryButtonComponent,
    OutlineButtonComponent,
    ArticleParserUrlFormComponent,
    ChipModule,
    ImageModule,
    SkeletonModule,
  ],
  templateUrl: './article-parser.html',
  styleUrl: './article-parser.scss',
})
export class ArticleParser {
  readonly ButtonVariant = ButtonVariant;
  loadingArticle = false;
  loadingEntities = false;
  loadingTranslation = false;
  loadingSummary = false;
  loadingOriginalTags = false;
  loadingTranslatedTags = false;
  entitiesError = '';
  articleError = '';
  originalTagsError = '';
  translationError = '';
  imagePreview: string | null = null;

  openImage(url: string) {
    this.imagePreview = url;
  }

  closeImage() {
    this.imagePreview = null;
  }

  constructor(
    private api: ArticleParserApi,
    public state: ArticleParserState,
  ) {}

  // =========================
  // ОСНОВНОЕ
  // =========================

  extractArticle(): void {
    const value = this.state.url.trim();
    if (!value) return;

    this.articleError = '';
    this.state.error = '';
    this.entitiesError = '';
    this.originalTagsError = '';
    this.translationError = '';
    this.state.article = null;
    this.state.entities = null;
    this.state.translatedText = '';
    this.state.annotation = '';
    this.state.originalTags = [];
    this.state.translatedTags = [];
    this.state.originalTagsText = '';
    this.state.translatedTagsText = '';
    this.state.editMode = false;

    this.loadingArticle = true;

    this.api.extractByUrl(value).subscribe({
      next: (response) => {
        this.state.article = response;
        this.loadingArticle = false;
      },
      error: () => {
        this.articleError = 'Ошибка при извлечении статьи';
        this.loadingArticle = false;
      },
    });
  }

  requestEntities(): void {
    if (!this.state.article?.text) return;

    this.loadingEntities = true;
    this.entitiesError = '';
    this.state.entities = null;

    this.api.extractEntities(this.state.article.text).subscribe({
      next: (response) => {
        this.state.entities = response;
        this.loadingEntities = false;
      },
      error: () => {
        this.entitiesError = 'Ошибка при извлечении сущностей';
        this.loadingEntities = false;
      },
    });
  }

  translateArticle(): void {
    if (!this.state.article?.text) return;

    this.loadingTranslation = true;
    this.translationError = '';
    this.state.error = '';
    this.state.translatedText = '';
    this.state.annotation = '';
    this.state.translatedTags = [];
    this.state.translatedTagsText = '';

    this.api.translateToRussian(this.state.article.text).subscribe({
      next: (response) => {
        this.state.translatedText = response.translation;
        this.loadingTranslation = false;
      },
      error: () => {
        this.translationError = 'Ошибка при переводе статьи';
        this.loadingTranslation = false;
      },
    });
  }

  summarizeArticle(): void {
    if (!this.state.translatedText.trim()) return;

    this.loadingSummary = true;
    this.state.error = '';
    this.state.annotation = '';

    this.api.summarize(this.state.translatedText).subscribe({
      next: (response) => {
        this.state.annotation = response.annotation;
        this.loadingSummary = false;
      },
      error: () => {
        this.state.error = 'Ошибка при формировании аннотации';
        this.loadingSummary = false;
      },
    });
  }

  clear(): void {
    this.state.clear();
    this.entitiesError = '';
    this.articleError = '';
    this.originalTagsError = '';
    this.translationError = '';
    this.translationError = '';
  }

  // =========================
  // ТЕГИ
  // =========================

  tagOriginal(): void {
    if (!this.state.article?.text) return;

    this.loadingOriginalTags = true;
    this.originalTagsError = '';

    this.api.tagText(this.state.article.text).subscribe({
      next: (res) => {
        this.state.originalTags = res.tags;
        this.syncTagsToText();
        this.loadingOriginalTags = false;
      },
      error: () => {
        this.originalTagsError = 'Ошибка тегирования оригинала';
        this.loadingOriginalTags = false;
      },
    });
  }

  tagTranslated(): void {
    if (!this.state.translatedText.trim()) return;

    this.loadingTranslatedTags = true;
    this.state.error = '';

    this.api.tagText(this.state.translatedText).subscribe({
      next: (res) => {
        this.state.translatedTags = res.tags;
        this.syncTagsToText();
        this.loadingTranslatedTags = false;
      },
      error: () => {
        this.state.error = 'Ошибка при тегировании перевода';
        this.loadingTranslatedTags = false;
      },
    });
  }

  // =========================
  // РЕДАКТИРОВАНИЕ
  // =========================

  toggleEditMode(): void {
    this.state.editMode = !this.state.editMode;

    if (this.state.editMode) {
      this.syncTagsToText();
    } else {
      this.applyEditedTags();
    }
  }

  applyEditedTags(): void {
    this.state.originalTags = this.textToTags(this.state.originalTagsText);
    this.state.translatedTags = this.textToTags(this.state.translatedTagsText);
  }

  private syncTagsToText(): void {
    this.state.originalTagsText = this.state.originalTags.join('\n');
    this.state.translatedTagsText = this.state.translatedTags.join('\n');
  }

  private textToTags(value: string): string[] {
    return value
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean)
      .filter((x, i, arr) => arr.indexOf(x) === i);
  }

  // =========================
  // СУЩНОСТИ
  // =========================

  updateEntityList(
    field: 'military_equipment' | 'manufacturers' | 'contracts',
    value: string,
  ): void {
    if (!this.state.entities) {
      this.state.entities = {
        military_equipment: [],
        manufacturers: [],
        contracts: [],
      };
    }

    this.state.entities[field] = value
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  // =========================
  // ЗАГЛУШКИ
  // =========================

  sendToMax(): void {
    console.log('sendToMax', {
      article: this.state.article,
      text: this.state.translatedText,
      tags: this.state.translatedTags,
      annotation: this.state.annotation,
    });
  }

  saveToDb(): void {
    console.log('saveToDb', {
      article: this.state.article,
      text: this.state.translatedText,
      tags: this.state.translatedTags,
      annotation: this.state.annotation,
    });
  }

  removeOriginalTag(tag: string): void {
    this.state.originalTags = this.state.originalTags.filter((item) => item !== tag);
    this.syncTagsToText();
  }

  removeTranslatedTag(tag: string): void {
    this.state.translatedTags = this.state.translatedTags.filter((item) => item !== tag);
    this.syncTagsToText();
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  get mainImageUrl(): string {
    return this.state.article?.main_image?.trim() || '';
  }

  onImageLoad(): void {
    console.log('Картинка загрузилась:', this.mainImageUrl);
  }

  onImageError(event: Event): void {
    console.log('Ошибка загрузки картинки:', this.mainImageUrl, event);
  }

  get hasEntitiesBlock(): boolean {
    return (
      this.loadingEntities ||
      !!this.state.entities?.military_equipment?.length ||
      !!this.state.entities?.manufacturers?.length ||
      !!this.state.entities?.contracts?.length ||
      this.state.originalTags.length > 0 ||
      this.state.translatedTags.length > 0
    );
  }
}
