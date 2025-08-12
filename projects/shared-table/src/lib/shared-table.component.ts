import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ColumnConfig {
  field: string;
  title: string;
  type: 'text' | 'boolean' | 'select' | 'date' | 'radio';
  options?: any[];
  filterable?: boolean;
}

@Component({
  selector: 'lib-shared-table', // تغییر نام selector برای کتابخانه
  standalone: true, // چون داخل کتابخانه میخوای مستقل باشه
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
   
   
<table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse;">

  <thead>
    <tr>
      <th *ngFor="let col of columns" style="position: relative; user-select: none; cursor: pointer;">
        {{ col.title }}
        <button *ngIf="col.filterable" (click)="toggleFilter(col.field)" style="margin-left: 5px; font-size: 12px;">فیلتر</button>
        <div *ngIf="filterOpen[col.field] && col.filterable" style="position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; padding: 8px; z-index: 10; min-width: 150px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
          <!-- فیلتر متن -->
          <ng-container *ngIf="col.type === 'text'">
            <input type="text"
              [value]="filters[col.field] || ''"
              (input)="onTextFilterChange(col.field, ($any($event.target)).value)"
              style="width: 100%; box-sizing: border-box;" />
          </ng-container>
          <!-- فیلتر بولین -->
          <ng-container *ngIf="col.type === 'boolean'">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox"
                [checked]="filters[col.field] === true"
                (change)="onCheckboxFilterChange(col.field, ($any($event.target)).checked)" />
              <span style="margin-right: 5px;">فقط بله</span>
            </label>
          </ng-container>
          <!-- فیلتر انتخابی -->
          <ng-container *ngIf="col.type === 'select'">
            <select
              [value]="filters[col.field] || ''"
              (change)="onSelectFilterChange(col.field, ($any($event.target)).value)"
              style="width: 100%; box-sizing: border-box;">
              <option value="">همه</option>
              <option *ngFor="let opt of col.options" [value]="opt">{{ opt }}</option>
            </select>
          </ng-container>
          <!-- فیلتر رادیویی -->
          <ng-container *ngIf="col.type === 'radio'">
            <div *ngFor="let opt of col.options" style="margin-bottom: 4px;">
              <label style="cursor: pointer;">
                <input type="radio"
                  [name]="'radio-' + col.field"
                  [value]="opt"
                  [checked]="filters[col.field] === opt"
                  (change)="onRadioFilterChange(col.field, opt)" />
                {{ opt }}
              </label>
            </div>
            <div>
              <label style="cursor: pointer;">
                <input type="radio"
                  [name]="'radio-' + col.field"
                  value=""
                  [checked]="!filters[col.field]"
                  (change)="onRadioFilterChange(col.field, '')" />
                حذف فیلتر
              </label>
            </div>
          </ng-container>

          <!-- فیلتر تاریخ -->
          <ng-container *ngIf="col.type === 'date'">
            <input type="date"
              [value]="filters[col.field] || ''"
              (input)="onTextFilterChange(col.field, ($any($event.target)).value)"
              style="width: 100%; box-sizing: border-box;" />
          </ng-container>

          <button (click)="clearFilter(col.field)" style="margin-top: 5px; font-size: 12px;">حذف</button>
        </div>
      </th>
    </tr>
  </thead>

  <tbody>
    <tr *ngFor="let row of pagedData">
      <td *ngFor="let col of columns">
        <!-- نمایش مقدار بر اساس نوع -->
        <ng-container [ngSwitch]="col.type">
          <ng-container *ngSwitchCase="'boolean'">
            {{ row[col.field] ? 'بله' : 'خیر' }}
          </ng-container>
          <ng-container *ngSwitchDefault>
            {{ row[col.field] }}
          </ng-container>
        </ng-container>
      </td>
    </tr>
  </tbody>

</table>

<div style="margin-top: 10px; text-align: center;">
  <button (click)="prevPage()" [disabled]="pageIndex === 0" style="margin-right: 10px;">قبلی</button>
  صفحه {{ pageIndex + 1 }} از {{ ceil(filteredData.length / pageSize) }}
  <button (click)="nextPage()" [disabled]="(pageIndex + 1) * pageSize >= filteredData.length" style="margin-left: 10px;">بعدی</button>
</div>

  `,
  styles: ``
})
export class SharedTableComponent implements OnInit {



  @Input() columns: ColumnConfig[] = [];
  @Input() useApi = false; // استفاده از API یا داده داخلی
  @Input() apiUrl = ''; // آدرس API

  data: any[] = [];
  filteredData: any[] = [];
  filters: { [key: string]: any } = {};
  filterOpen: { [key: string]: boolean } = {};
  pageSize = 5;
  pageIndex = 0;

  fakeData = [
    { id: '1', name: 'علی', active: true, role: 'مدیر', created: '2025-01-15', gender: 'مرد' , بدون: 'بدون' },
    { id: '2', name: 'زهرا', active: false, role: 'کاربر', created: '2025-02-20', gender: 'زن', بدون: 'بدون' },
    { id: '3', name: 'حسین', active: true, role: 'مهمان', created: '2025-03-05', gender: 'مرد' , بدون: 'بدون'},
    { id: '4', name: 'سارا', active: false, role: 'کاربر', created: '2025-04-10', gender: 'زن' , بدون: 'بدون'},
    { id: '5', name: 'محمد', active: true, role: 'مدیر', created: '2025-05-12', gender: 'مرد' , بدون: 'بدون'},
    { id: '6', name: 'لیلا', active: false, role: 'کاربر', created: '2025-06-08', gender: 'زن' , بدون: 'بدون'},
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
    Object.keys(this.filters).forEach(key => {
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
      }
    });
  }

  applyAll() {
    if (this.useApi) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(item => {
        return Object.keys(this.filters).every(field => {
          const filterVal = this.filters[field];
          if (filterVal === undefined || filterVal === null || filterVal === '') return true;
          const val = item[field];

          if (typeof val === 'boolean') {
            return val === (filterVal === true || filterVal === 'true');
          } else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return val === filterVal;
          } else {
            return val?.toString().toLowerCase().includes(filterVal.toString().toLowerCase());
          }
        });
      });
    }
    this.pageIndex = 0;
  }

  onTextFilterChange(field: string, value: string) {
    if (value) this.filters[field] = value;
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
}





