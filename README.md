# 📦 shared-table-filters

A ready-to-use **Angular table library** with support for **filtering, pagination, and multiple column types** (text, boolean, select, date, radio).  
Supports both **Gregorian and Jalali (Persian) calendars** ✨

---

## 🚀 Installation

Install via npm:

```bash
npm install shared-table-filters


⚠️ Important: You need to install Bootstrap in your project for the default library and style to work properly:


⚡ Usage
1. In HTML


<lib-shared-table
  [useApi]="true"
  [showActions]="true"
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


🔘 Adding Action Buttons (Edit / Delete / View)

You can add a custom "actions" column with buttons like Edit, Delete, or View.

Example
In Parent Component (app.component.ts):





actions = [
  { label: 'edit', class: 'btn btn-sm btn-primary', callback: (row: any) => this.onEdit(row) },
  { label: 'delete', class: 'btn btn-sm btn-danger', callback: (row: any) => this.onDelete(row) },
  { label: 'details', class: 'btn btn-sm btn-info', callback: (row: any) => this.onView(row) }
];

onEdit(row: any) {
  console.log('Edit row:', row);
  // Open modal or navigate
}

onDelete(row: any) {
  console.log('Delete row:', row);
  // Call delete API
}

onView(row: any) {
  console.log('row details:', row);
  // Navigate to detail page
}








🎨 Customization

Apply your own CSS classes to style the table.

Fully customizable column types, filters, and pagination.

You can override default styles or add new ones in your global CSS.
```

Gregorian formats: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, DD/MM/YYYY
Persian (Jalali) formats: YYYY/MM/DD or YYYY-MM-DD
