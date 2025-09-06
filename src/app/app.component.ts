import { Component, Input } from '@angular/core';
import { SharedTableComponent } from './shared-table/shared-table.component';
import { TableAction } from 'shared-table';
// import { SharedTableComponent } from 'shared-table-filters';

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

  tableActions: TableAction[] = [
    {
      label: 'ویرایش',
      type: 'primary',
      icon: 'bi bi-pencil',   
      callback: (row: any) => this.onEdit(row),
    },
    {
      label: 'حذف',
      type: 'danger',
      icon: 'bi bi-trash',
      callback: (row: any) => this.onDelete(row),
    },
    {
      label: 'جزئیات',
      type: 'info',
      icon: 'bi bi-eye',
      callback: (row: any) => this.onView(row),
    },
  ];

  onEdit(row: any) {
    console.log('ویرایش در پرنت:', row);
  }

  onDelete(row: any) {
    console.log('حذف در پرنت:', row);
  }

  onView(row: any) {
    console.log('جزئیات در پرنت:', row);
  }

  onSelectionChange(selected: any[]) {
  console.log('ردیف‌های انتخاب‌شده:', selected);
}
}
