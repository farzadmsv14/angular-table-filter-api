import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import * as jalaali from 'jalaali-js';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

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
  standalone: true,
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.css'],
})
export class SharedTableComponent implements OnInit {
  columns: any[] = [];
  @Input() useApi = false;
  @Input() apiUrl = '';
  @Input() localData: any[] = [];
  @Input() columnStyles: { [key: string]: any } = {};
  @Input() showActions = false;
  @Input() actions: TableAction[] = [];
  @Input() enableSelection: boolean = false;
  @Input() calendarType: 'miladi' | 'jalali' = 'jalali';
  @Input() hiddenColumns: string[] = [];
  @Input() columnTitles: { [key: string]: string } = {};
  @Input() valueMappings: { [field: string]: { [value: string]: string } } = {};
  @Input() enableSorting = true;
  @Input() enableFiltering = true;
  @Output() selectionChange = new EventEmitter<any[]>();
  selectedRows: any[] = [];
  data: any[] = [];
  filteredData: any[] = [];
  filters: { [key: string]: any } = {};
  filterOpen: { [key: string]: boolean } = {};
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;
  isloading: boolean = false;
  datapicker = new FormControl(new Date());
  datapicker2 = new FormControl(new Date());

  getDisplayValue(row: any, col: any): any {
    const field = col.field;
    const value = row[field];
    if (this.valueMappings[field] && this.valueMappings[field][value] !== undefined) {
      return this.valueMappings[field][value];
    }
    return value;
  }

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
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
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
      if (this.hiddenColumns.includes(key)) continue;

      const values = data.map((d) => d[key]);
      const uniqueValues = Array.from(new Set(values));
      let type: string = 'text';

      if (this.valueMappings[key]) {
        type = 'select';
      } else if (key === 'id') {
        type = 'string';
      } else if (typeof sample[key] === 'boolean') {
        type = 'boolean';
      } else if (this.isValidDate(sample[key])) {
        type = 'date';
      } else if (uniqueValues.length === 2) {
        type = 'radio';
      } else if (uniqueValues.length > 2 && uniqueValues.length <= 5) {
        type = 'select';
      } else {
        type = 'string';
      }

      const column: any = {
        field: key,
        title: this.columnTitles[key] || key,
        type: type,
        filterable: this.enableFiltering && key !== 'id',
      };

      if (this.valueMappings[key]) {
        column.options = Object.entries(this.valueMappings[key]).map(([value, label]) => ({
          value,
          label,
        }));
      } else if (type === 'select' || type === 'radio') {
        column.options = uniqueValues.map((v) => ({ value: v, label: v }));
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

    return columns;
  }

  isValidDate(value: any): boolean {
    if (typeof value !== 'string') return false;

    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    value = value.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d).toString());

    value = value.trim();

    const formats = [
      { regex: /^\d{4}[-/]\d{2}[-/]\d{2}$/, format: 'YMD' },
      { regex: /^\d{2}[-/]\d{2}[-/]\d{4}$/, format: 'DMY' },
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
    if (this.useApi) {
      this.fetchDataFromApi();
    } else {
      if (this.localData && this.localData.length > 0) {
        this.isloading = true;
        this.data = this.localData;
        this.totalCount = this.localData.length;
        this.columns = this.generateColumns(this.data);
        this.applyAll();
      }
    }
  }

  fetchDataFromApi() {
    this.isloading = false;
    let params = new HttpParams().set('pageNumber', this.currentPage.toString()).set('pageSize', this.pageSize.toString());
    Object.keys(this.filters).forEach((key) => {
      const val = this.filters[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val);
      }
    });

    if (this.sortField && this.sortDirection) {
      params = params.set('sortField', this.sortField).set('sortDirection', this.sortDirection);
    }

    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        console.log(res);
        this.isloading = true;
        this.data = res.data;
        this.currentPage = res.currentPage;
        this.pageSize = res.pageSize;
        this.totalCount = res.totalCount;
        this.applyAll();
      },
      error: (err) => {
        console.error('خطا در دریافت داده از API:', err);
      },
    });
  }

  normalizeDate(dateStr: string): string {
    if (!dateStr) return '';

    let y = 0,
      m = 0,
      d = 0;

    if (this.calendarType === 'jalali') {
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
    if (!this.enableSorting) return;

    if (this.sortField === field) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortField = null;
        this.sortDirection = null;
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    if (this.useApi) {
      this.fetchDataFromApi();
    } else {
      this.applyAll();
    }
  }

  applyAll() {
    if (this.useApi) {
      this.columns = this.generateColumns(this.data);
      this.columns.forEach((col) => {
        if (!(col.field in this.filters)) {
          this.filters[col.field] = '';
        }
      });
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

    // if (this.sortField && this.sortDirection) {
    //   this.filteredData.sort((a, b) => {
    //     let valA: any = a[this.sortField!];
    //     let valB: any = b[this.sortField!];

    //     if (valA == null) return 1;
    //     if (valB == null) return -1;

    //     if (this.columns.find((c) => c.field === this.sortField)?.type === 'date') {
    //       valA = this.normalizeDate(valA);
    //       valB = this.normalizeDate(valB);
    //     }

    //     if (!isNaN(valA) && !isNaN(valB)) {
    //       return this.sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    //     }

    //     if (typeof valA === 'string' && typeof valB === 'string') {
    //       return this.sortDirection === 'asc' ? valA.localeCompare(valB, 'fa') : valB.localeCompare(valA, 'fa');
    //     }

    //     return this.sortDirection === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    //   });
    // }
  }

  onDateRangeChange(field: string, rangeType: 'from' | 'to', value: any) {
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

  private filterTimeout: any;

  onTextFilterChange(field: string, value: string) {
    if (!this.enableFiltering) return;

    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      if (value) this.filters[field] = value;
      else delete this.filters[field];
      this.reloadDataOrFilter();
    }, 1500);
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
    if (!this.enableFiltering) return;

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
    if (!this.enableFiltering) return;

    if (this.useApi && this.apiUrl) {
      this.fetchDataFromApi();
    } else if (this.localData && this.localData.length > 0) {
      this.data = this.localData;
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
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.fetchDataFromApi();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchDataFromApi();
    }
  }

  get pagedData() {
    return this.filteredData;
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

  reloadData() {
    if (this.useApi && this.apiUrl) {
      this.fetchDataFromApi();
    } else if (this.localData && this.localData.length > 0) {
      this.data = this.localData;
      this.applyAll();
    }
  }

  trackByColumn(index: number, col: any): string {
    return col.field;
  }

  trackByRow(index: number, row: any): any {
    return row.id ?? index;
  }
}
