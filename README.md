# 📦 shared-table-filters

A ready-to-use **Angular table library** with support for **filtering, pagination, and multiple column types** (text, boolean, select, date, radio).  
Supports both **Gregorian and Jalali (Persian) calendars** ✨

---

## 🚀 Installation

Install via npm:

```bash
npm install shared-table-filters



⚡ Usage
1. In HTML


<lib-shared-table
  [useApi]="true"
  [apiUrl]="'https://your-api.com/data'"
  [calendarType]="'miladi' or 'jalali'">
</lib-shared-table>


useApi: Set to true to fetch data from an API, or false to use local data.

apiUrl: Your API endpoint URL.

calendarType: 'miladi' for Gregorian or 'jalali' for Persian calendar.

2. In app.component.ts


import { Component } from '@angular/core';
import { SharedTableComponent } from 'shared-table-filters';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedTableComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}



🎨 Customization

Apply your own CSS classes to style the table.

Fully customizable column types, filters, and pagination.

You can override default styles or add new ones in your global CSS.
```
