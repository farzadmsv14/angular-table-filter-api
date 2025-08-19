import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedTableComponent } from './shared-table/shared-table.component';
// import { SharedTableComponent } from 'shared-table';

export interface ColumnConfig {
  id: string;
  name: string;
  active: boolean;
  role: string;
  created: Date;
  gender: gen;
}

export enum gen {
  'مرد' = 1,
  'زن' = 2,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  calendarType: any = 'jalali';
  // calendarType: any = 'miladi';

  // columns: any[] = [
  //   { field: 'id', title: 'شناسه', type: 'text', filterable: false },
  //   { field: 'name', title: 'نام', type: 'text', filterable: true },
  //   { field: 'active', title: 'فعال', type: 'boolean', filterable: true },
  //   { field: 'role', title: 'نقش', type: 'select', options: ['کاربر', 'مدیر', 'مهمان'], filterable: true },
  //   { field: 'created', title: 'تاریخ ایجاد', type: 'date', filterable: true },
  //   { field: 'gender', title: 'جنسیت', type: 'radio', options: ['مرد', 'زن'], filterable: true },
  // ];
}
