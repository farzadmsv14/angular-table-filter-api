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
  selector: 'app-shared-table',
  imports: [CommonModule ,FormsModule , HttpClientModule],
  templateUrl: './shared-table.component.html',
  styleUrl: './shared-table.component.css',
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
      { id: '1', name: 'علی', active: true, role: 'مدیر', created: '2025-01-15', gender: 'مرد'},
      { id: '2', name: 'زهرا', active: false, role: 'کاربر', created: '2025-02-20', gender: 'زن'},
      { id: '3', name: 'حسین', active: true, role: 'مهمان', created: '2025-03-05', gender: 'مرد'},
      { id: '4', name: 'سارا', active: false, role: 'کاربر', created: '2025-04-10', gender: 'زن'},
      { id: '5', name: 'محمد', active: true, role: 'مدیر', created: '2025-05-12', gender: 'مرد'},
      { id: '6', name: 'لیلا', active: false, role: 'کاربر', created: '2025-06-08', gender: 'زن'},
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
