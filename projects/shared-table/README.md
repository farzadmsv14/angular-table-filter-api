# 📦 shared-table-filters

یک کتابخانه جدول آماده برای Angular با قابلیت **فیلتر، صفحه‌بندی، پشتیبانی از انواع ستون‌ها** (متن، بولین، سلکت، تاریخ، رادیو)  
همراه با پشتیبانی از تاریخ **میلادی و شمسی** ✨

---

## 🚀 نصب

برای نصب از npm استفاده کنید:

```bash
npm install shared-table-filters


⚡ نحوه استفاده
1. اضافه کردن ماژول به پروژه
در فایل app.module.ts:


import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedTableModule } from 'shared-table-filters'; // ← اضافه کردن ماژول

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SharedTableModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}



2. استفاده در HTML

<app-shared-table
  [useApi]="true"
  [apiUrl]="'https://your-api.com/data'"
  [calendarType]="'miladi'"
  >
</app-shared-table>



3. تعریف  در app.component.ts

import { Component } from '@angular/core';
import { ColumnConfig } from 'shared-table-filters';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
}

🎨 سفارشی‌سازی ظاهر
می‌تونید کلاس‌های CSS دلخواهتون رو روی جدول اعمال کنید:
📝 ویژگی‌ها

فیلتر متنی، بولین، سلکت، رادیویی و تاریخ (شمسی + میلادی)

صفحه‌بندی داخلی

پشتیبانی از داده‌های API و داده‌های لوکال

قابلیت سفارشی‌سازی استایل‌ها

طراحی ساده و قابل توسعه
```
