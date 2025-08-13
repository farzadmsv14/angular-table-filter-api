import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import * as jalaali from 'jalaali-js';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

export interface ColumnConfig {
  field: string;
  title: string;
  type: 'text' | 'boolean' | 'select' | 'date' | 'radio';
  options?: any[];
  filterable?: boolean;
}

@Component({
  selector: 'app-shared-table',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, NgPersianDatepickerModule],
  providers: [],
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.css'],
})
export class SharedTableComponent implements OnInit {
  @Input() columns: ColumnConfig[] = [];
  @Input() useApi = false;
  @Input() apiUrl = '';

  data: any[] = [];
  filteredData: any[] = [];
  filters: { [key: string]: any } = {};
  filterOpen: { [key: string]: boolean } = {};
  pageSize = 10;
  pageIndex = 0;
  datapicker = new FormControl('');
  datapicker2 = new FormControl('');
  @Input() calendarType: 'miladi' | 'jalali' = 'jalali';

  fakeData = [
    { id: '1', name: 'علی', active: true, role: 'مدیر', created: '2025-01-15', gender: 'مرد' },
    { id: '2', name: 'زهرا', active: false, role: 'کاربر', created: '2025-02-20', gender: 'زن' },
    { id: '3', name: 'فرزاد', active: true, role: 'مهمان', created: '2025-03-05', gender: 'مرد' },
    { id: '4', name: 'سارا', active: false, role: 'کاربر', created: '2025-04-10', gender: 'زن' },
    { id: '5', name: 'محمد', active: true, role: 'مدیر', created: '2025-05-12', gender: 'مرد' },
    { id: '6', name: 'فرزاد', active: false, role: 'کاربر', created: '2025-06-08', gender: 'مرد' },
    { id: '7', name: 'حمید', active: true, role: 'مهمان', created: '2025-07-01', gender: 'مرد' },
    { id: '8', name: 'مریم', active: false, role: 'مدیر', created: '2025-08-13', gender: 'زن' },
    { id: '9', name: 'ناصر', active: true, role: 'کاربر', created: '2025-09-20', gender: 'مرد' },
    { id: '10', name: 'نگار', active: false, role: 'مهمان', created: '2025-10-05', gender: 'زن' },
    { id: '11', name: 'فرزاد', active: true, role: 'کاربر', created: '2025-01-01', gender: 'مرد' },
    { id: '12', name: 'نسترن', active: false, role: 'مهمان', created: '2025-02-14', gender: 'زن' },
    { id: '13', name: 'پیمان', active: true, role: 'مدیر', created: '2025-03-20', gender: 'مرد' },
    { id: '14', name: 'شیرین', active: true, role: 'کاربر', created: '2025-04-11', gender: 'زن' },
    { id: '15', name: 'کامران', active: false, role: 'مهمان', created: '2025-05-19', gender: 'مرد' },
    { id: '16', name: 'الهام', active: true, role: 'مدیر', created: '2025-06-30', gender: 'زن' },
    { id: '17', name: 'فرزاد', active: false, role: 'کاربر', created: '2025-07-15', gender: 'مرد' },
    { id: '18', name: 'شبنم', active: true, role: 'مهمان', created: '2025-08-01', gender: 'زن' },
    { id: '19', name: 'بهرام', active: false, role: 'مدیر', created: '2025-09-10', gender: 'مرد' },
    { id: '20', name: 'یاسمین', active: true, role: 'کاربر', created: '2025-10-25', gender: 'زن' },
    { id: '21', name: 'جواد', active: false, role: 'مهمان', created: '2025-01-22', gender: 'مرد' },
    { id: '22', name: 'فرزانه', active: true, role: 'کاربر', created: '2025-02-28', gender: 'زن' },
    { id: '23', name: 'کوروش', active: false, role: 'مدیر', created: '2025-03-07', gender: 'مرد' },
    { id: '24', name: 'پریسا', active: true, role: 'کاربر', created: '2025-04-14', gender: 'زن' },
    { id: '25', name: 'فرزاد', active: false, role: 'مهمان', created: '2025-05-29', gender: 'مرد' },
    { id: '26', name: 'نازنین', active: true, role: 'مدیر', created: '2025-06-04', gender: 'زن' },
    { id: '27', name: 'میلاد', active: false, role: 'کاربر', created: '2025-07-23', gender: 'مرد' },
    { id: '28', name: 'شادی', active: true, role: 'مهمان', created: '2025-08-11', gender: 'زن' },
    { id: '29', name: 'امیر', active: false, role: 'مدیر', created: '2025-09-02', gender: 'مرد' },
    { id: '30', name: 'فرزاد', active: true, role: 'کاربر', created: '2025-10-10', gender: 'مرد' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.useApi && this.apiUrl) {
      this.fetchDataFromApi();
    } else {
      this.data = [...this.fakeData];
      this.applyAll();
    }
  }

  fetchDataFromApi() {
    let params = new HttpParams();
    Object.keys(this.filters).forEach((key) => {
      const val = this.filters[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val);
      }
    });

    this.http.get<any[]>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        this.data = res;
        this.applyAll();
      },
      error: (err) => {
        console.error('خطا در دریافت داده از API:', err);
        this.data = [...this.fakeData];
        this.applyAll();
      },
    });
  }

  normalizeDate(dateStr: string): string {
    if (!dateStr) return '';

    let y = 0,
      m = 0,
      d = 0;

    if (this.calendarType === 'jalali') {
      // فرمت شمسی YYYY/MM/DD یا YYYY-MM-DD
      if (/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/.test(dateStr)) {
        const parts = dateStr.split(/[-\/]/).map(Number);
        if (parts.length === 3) {
          y = parts[0];
          m = parts[1];
          d = parts[2];
          if (y >= 1300 && y <= 1500) {
            const { gy, gm, gd } = jalaali.toGregorian(y, m, d);
            y = gy;
            m = gm;
            d = gd;
          }
        } else {
          return '';
        }
      } else {
        return '';
      }
    } else {
      // میلادی فرمت‌های YYYY-MM-DD ، YYYY/MM/DD ، DD-MM-YYYY ، DD/MM/YYYY
      if (/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(dateStr)) {
        const parts = dateStr.split(/[-\/]/).map(Number);
        if (parts.length === 3) {
          y = parts[0];
          m = parts[1];
          d = parts[2];
        } else {
          return '';
        }
      } else if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[-\/]/).map(Number);
        if (parts.length === 3) {
          d = parts[0];
          m = parts[1];
          y = parts[2];
        } else {
          return '';
        }
      } else {
        return '';
      }
    }

    return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }

applyAll() {
  if (this.useApi) {
    this.filteredData = [...this.data];
  } else {
    this.filteredData = this.data.filter((item) => {
      return this.columns.every((col) => {
        if (!col.filterable) return true;

        const from = this.filters[col.field + '_from'];
        const to = this.filters[col.field + '_to'];

        // فیلتر بازه تاریخ
        if (col.type === 'date' && (from || to)) {
          const itemDate = this.normalizeDate(item[col.field]);
          const fromDate = from ? this.normalizeDate(from) : null;
          const toDate = to ? this.normalizeDate(to) : null;

          if (fromDate && itemDate < fromDate) return false;
          if (toDate && itemDate > toDate) return false;
          return true;
        }

        // فیلترهای دیگر
        const filterVal = this.filters[col.field];
        if (filterVal === undefined || filterVal === null || filterVal === '') return true;
        const val = item[col.field];
        if (typeof val === 'boolean') {
          return val === (filterVal === true || filterVal === 'true');
        } else {
          return val?.toString().toLowerCase().includes(filterVal.toString().toLowerCase());
        }
      });
    });
  }
  this.pageIndex = 0;
}
onDateRangeChange(field: string, rangeType: 'from' | 'to', value: any) {
  let dateValue = '';

  if (value) {
    if (this.calendarType === 'jalali') {
      dateValue = value.shamsi ? value.shamsi.split(' ')[0] : value;
    } else {
      dateValue = value;
    }
    // مثال: created_from یا created_to
    this.filters[`${field}_${rangeType}`] = this.normalizeDate(dateValue);
  } else {
    delete this.filters[`${field}_${rangeType}`];
  }

  this.reloadDataOrFilter();
}

  onTextFilterChange(field: string, value: string) {
    if (value) this.filters[field] = value;
    else delete this.filters[field];
    this.reloadDataOrFilter();
  }

  onTextFilterChange2(field: string, value: any) {
    if (value) this.filters[field] = value.shamsi.split(' ')[0];
    else delete this.filters[field];
    this.reloadDataOrFilter();
  }

  onCheckboxFilterChange(field: string, checked: boolean) {
    if (checked) this.filters[field] = true;
    else delete this.filters[field];
    this.reloadDataOrFilter();
  }

  onSelectFilterChange(field: string, value: string) {
    if (value) this.filters[field] = value;
    else delete this.filters[field];
    this.reloadDataOrFilter();
  }

  onRadioFilterChange(field: string, value: string) {
    if (value) this.filters[field] = value;
    else delete this.filters[field];
    this.reloadDataOrFilter();
  }

  reloadDataOrFilter() {
    if (this.useApi && this.apiUrl) {
      this.fetchDataFromApi();
    } else {
      this.applyAll();
    }
  }

  toggleFilter(field: string) {
    this.filterOpen[field] = !this.filterOpen[field];
  }

  clearFilter(field: string) {
    delete this.filters[field];
    this.reloadDataOrFilter();
  }

  nextPage() {
    if ((this.pageIndex + 1) * this.pageSize < this.filteredData.length) {
      this.pageIndex++;
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  get pagedData() {
    return this.filteredData.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);
  }

  ceil(value: number) {
    return Math.ceil(value);
  }

  onCalendarTypeChange(newType: 'jalali' | 'miladi') {
    this.calendarType = newType;

    Object.keys(this.filters).forEach((field) => {
      const col = this.columns.find((c) => c.field === field);
      if (col?.type === 'date') {
        delete this.filters[field];
      }
    });

    this.reloadDataOrFilter();
  }

  toJalali(gregDateStr: string): string {
    if (!gregDateStr) return '';
    const [y, m, d] = gregDateStr.split('-').map(Number);
    const { jy, jm, jd } = jalaali.toJalaali(y, m, d);
    return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
  }
}
