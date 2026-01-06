import { Component, Input, ViewChild } from '@angular/core';
import { SharedTableComponent } from './shared-table/shared-table.component';
import { TableAction } from 'shared-table-filters';
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

  @ViewChild(SharedTableComponent) table!: SharedTableComponent;
  
  statusTable = { 0: 'الکترونیک', 1: 'خانگی', 2: 'پوشاک' };

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
    console.log('ویرایش:', row);
  }

  onDelete(row: any) {
    console.log('حذف:', row);
  }

  onView(row: any) {
    console.log('جزئیات:', row);
  }

  onSelectionChange(selected: any[]) {
    console.log('ردیف‌های انتخاب‌شده:', selected);
  }

  refreshTable() {
    this.table.reloadData();
  }

  columnStyles = {
    fullName: { 'background-color': '#e3f2fd', 'font-weight': 'bold', color: '#1976d2' },
    age: { 'background-color': '#fff3e0', 'text-align': 'center' },
    active: { color: 'green', 'font-weight': 'bold' },
  };
}
