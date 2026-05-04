import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateApi } from './translate-api';

@Component({
  selector: 'app-translate',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FloatLabelModule,
    TextareaModule,
    ChipModule,
  ],
  templateUrl: './translate.html',
  styleUrl: './translate.scss',
})
export class Translate {
  text = '';
  result = '';
  sourceLang = '';
  targetLang = '';
  loading = false;
  error = '';
  copied = false;

  constructor(private translateApi: TranslateApi) {}

  translate(): void {
    const value = this.text.trim();

    if (!value) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = '';
    this.sourceLang = '';
    this.targetLang = '';
    this.copied = false;

    this.translateApi.translate(value).subscribe({
      next: (response) => {
        this.result = response.translation;
        this.sourceLang = response.source_lang ?? '';
        this.targetLang = response.target_lang ?? '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Ошибка при выполнении перевода';
        this.loading = false;
      },
    });
  }

  clear(): void {
    this.text = '';
    this.result = '';
    this.sourceLang = '';
    this.targetLang = '';
    this.error = '';
    this.copied = false;
  }

  async copyResult(): Promise<void> {
    if (!this.result) {
      return;
    }

    await navigator.clipboard.writeText(this.result);
    this.copied = true;

    setTimeout(() => {
      this.copied = false;
    }, 1500);
  }
}
