import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

export interface TableAction {
  label: string;
  type?: 'primary' | 'danger' | 'info' | 'success' | 'warning';
  icon?: string;
  callback: (row: any) => void;
}

@Component({
  selector: 'app-shared-table',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, NgPersianDatepickerModule],
  providers: [],
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.css'],
})
export class SharedTableComponent implements OnInit {
  columns: any[] = [];
  @Input() useApi = false;
  @Input() apiUrl = '';
  @Input() showActions = false;
  @Input() actions: TableAction[] = [];
  @Input() enableSelection: boolean = false;
  @Output() selectionChange = new EventEmitter<any[]>();
  selectedRows: any[] = [];

  data: any[] = [];
  filteredData: any[] = [];
  filters: { [key: string]: any } = {};
  filterOpen: { [key: string]: boolean } = {};
  pageSize = 10;
  pageIndex = 0;
  datapicker = new FormControl(new Date());
  datapicker2 = new FormControl(new Date());
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

  toggleSelection(row: any, event: any) {
    if (event.target.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter((r) => r !== row);
    }
    this.selectionChange.emit(this.selectedRows);
  }

  isSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedRows = [...this.data]; // 👈 همه انتخاب
    } else {
      this.selectedRows = []; // 👈 همه لغو
    }
    this.selectionChange.emit(this.selectedRows);
  }

  isAllSelected(): boolean {
    return this.selectedRows.length === this.data.length && this.data.length > 0;
  }

  isIndeterminate(): boolean {
    return this.selectedRows.length > 0 && this.selectedRows.length < this.data.length;
  }

  generateColumns(data: any[]): any[] {
    if (!data || data.length === 0) return [];

    const sample = data[0];
    const columns: any[] = [];

    for (const key of Object.keys(sample)) {
      const values = data.map((d) => d[key]);
      const uniqueValues = Array.from(new Set(values));

      let type: string = 'text';

      if (key === 'id') {
        type = 'string';
      } else if (typeof sample[key] === 'boolean') {
        type = 'boolean';
      } else if (this.isValidDate(sample[key])) {
        type = 'date';
      } else if (uniqueValues.length === 2) {
        type = 'radio';
      } else if (uniqueValues.length > 2 && uniqueValues.length <= 10) {
        type = 'select';
      } else if (!this.isValidDate(sample[key])) {
        type = 'string';
      }

      const column: any = {
        field: key,
        title: key,
        type: type,
        filterable: key !== 'id',
      };

      if (type === 'select' || type === 'radio') {
        column.options = uniqueValues;
      }

      columns.push(column);
    }

    if (this.showActions && this.actions.length > 0) {
      columns.push({
        field: 'actions',
        title: 'عملیات',
        type: 'action',
        filterable: false,
        sortable: false,
      });
    }

    if (this.enableSelection) {
      columns.unshift({
        field: 'checkbox',
        title: '',
        type: 'checkbox',
        filterable: false,
        sortable: false,
      });
    }

    return columns;
  }

  isValidDate(value: any): boolean {
    if (typeof value !== 'string') return false;

    // ۱. تبدیل اعداد فارسی به انگلیسی
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    value = value.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d).toString());

    // ۲. حذف فاصله‌های اضافی
    value = value.trim();

    // ۳. الگوهای مختلف تاریخ
    const formats = [
      { regex: /^\d{4}[-/]\d{2}[-/]\d{2}$/, format: 'YMD' }, // YYYY-MM-DD یا YYYY/MM/DD
      { regex: /^\d{2}[-/]\d{2}[-/]\d{4}$/, format: 'DMY' }, // DD-MM-YYYY یا DD/MM/YYYY
    ];

    for (const { regex, format } of formats) {
      if (regex.test(value)) {
        const parts = value.split(/[-/]/).map(Number);

        let year, month, day;
        if (format === 'YMD') {
          [year, month, day] = parts;
        } else {
          [day, month, year] = parts;
        }

        // بررسی اعتبار تاریخ میلادی
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day) {
          return true;
        }

        if (year >= 1200 && year <= 1500) {
          return this.isValidJalaliDate(year, month, day);
        }
      }
    }

    return false;
  }

  isValidJalaliDate(year: number, month: number, day: number): boolean {
    const isLeap = (year: number) => {
      const a = year - (year > 979 ? 979 : 0);
      const b = a % 33;
      return [1, 5, 9, 13, 17, 22, 26, 30].includes(b);
    };

    if (month < 1 || month > 12) return false;

    const maxDays = month <= 6 ? 31 : month <= 11 ? 30 : isLeap(year) ? 30 : 29;
    return day >= 1 && day <= maxDays;
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.columns = this.generateColumns(this.fakeData);
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

  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  sortData(field: string) {
    if (this.sortField === field) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        // 🔸 حالت سوم → حذف مرتب‌سازی
        this.sortField = null;
        this.sortDirection = null;
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.applyAll();
  }

  applyAll() {
    if (this.useApi) {
      this.columns = this.generateColumns(this.data);
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter((item) => {
        return this.columns.every((col) => {
          if (!col.filterable) return true;

          const from = this.filters[col.field + '_from'];
          const to = this.filters[col.field + '_to'];

          if (col.type === 'date' && (from || to)) {
            const itemDate = this.normalizeDate(item[col.field]);
            const fromDate = from ? this.normalizeDate(from) : null;
            const toDate = to ? this.normalizeDate(to) : null;

            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
            return true;
          }

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

    if (this.sortField && this.sortDirection) {
      this.filteredData.sort((a, b) => {
        let valA: any = a[this.sortField!];
        let valB: any = b[this.sortField!];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (this.columns.find((c) => c.field === this.sortField)?.type === 'date') {
          valA = this.normalizeDate(valA);
          valB = this.normalizeDate(valB);
        }

        if (!isNaN(valA) && !isNaN(valB)) {
          return this.sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return this.sortDirection === 'asc' ? valA.localeCompare(valB, 'fa') : valB.localeCompare(valA, 'fa');
        }

        return this.sortDirection === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
    }

    this.pageIndex = 0;
  }

  onDateRangeChange(field: string, rangeType: 'from' | 'to', value: any) {
    console.log('Selected date:', value);

    let dateValue = '';

    if (value) {
      if (this.calendarType === 'jalali') {
        dateValue = value.shamsi ? value.shamsi.split(' ')[0] : value;
      } else {
        dateValue = value;
      }
      this.filters[`${field}_${rangeType}`] = this.normalizeDate(dateValue);
    } else {
      delete this.filters[`${field}_${rangeType}`];
    }

    if (this.filters[`${field}_from`] && this.filters[`${field}_to`]) {
      this.reloadDataOrFilter();
    } else if (!this.filters[`${field}_from`] && !this.filters[`${field}_to`]) {
      this.reloadDataOrFilter();
    }
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
    delete this.filters[`${field}_from`];
    delete this.filters[`${field}_to`];
    delete this.filters[field];

    if (field === 'created') {
      this.datapicker.reset();
      this.datapicker2.reset();
    }
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

    const parts = gregDateStr.split('-').map(Number);
    if (parts.length !== 3) return '';

    let [y, m, d] = parts;

    if (!y || !m || !d) return '';
    if (m < 1 || m > 12 || d < 1 || d > 31) return '';

    try {
      const { jy, jm, jd } = jalaali.toJalaali(y, m, d);
      return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
    } catch (e) {
      console.warn('خطای تبدیل به جلالی:', gregDateStr, e);
      return '';
    }
  }
}
