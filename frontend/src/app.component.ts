import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { recentTransactionQuery } from './transaction-query.js';

interface Account {
  id: number;
  name: string;
  type: string;
  currentBalance: number;
}

interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface Category {
  name: string;
}

@Component({
  selector: 'app-root',
  imports: [DatePipe, DecimalPipe],
  template: `
    <main class="app-shell">
      <header class="page-header">
        <p class="eyebrow">Fictional sample data</p>
        <h1>Personal finance snapshot</h1>
        <p class="intro">
          A first working slice with accounts and recent transactions loaded from the backend.
        </p>
      </header>

      @if (error()) {
        <section class="notice" role="alert">{{ error() }}</section>
      }

      <section class="summary" aria-label="Account summary">
        <div>
          <span class="metric-label">Accounts</span>
          <strong>{{ accounts().length }}</strong>
        </div>
        <div>
          <span class="metric-label">Net balance</span>
          <strong>{{ totalBalance() | number: '1.2-2' }}</strong>
        </div>
      </section>

      <section class="layout">
        <section class="panel" aria-labelledby="accounts-title">
          <div class="panel-heading">
            <h2 id="accounts-title">Accounts</h2>
          </div>

          @if (loading()) {
            <p class="muted">Loading accounts...</p>
          } @else {
            <div class="account-list">
              @for (account of accounts(); track account.id) {
                <article class="account-row">
                  <div>
                    <h3>{{ account.name }}</h3>
                    <p>{{ account.type }}</p>
                  </div>
                  <strong [class.negative]="account.currentBalance < 0">
                    {{ account.currentBalance | number: '1.2-2' }}
                  </strong>
                </article>
              }
            </div>
          }
        </section>

        <section class="panel transactions" aria-labelledby="transactions-title">
          <div class="panel-heading transaction-heading">
            <h2 id="transactions-title">Recent transactions</h2>
            <div class="category-filter">
              <label for="category-filter">Category</label>
              <select
                id="category-filter"
                [value]="selectedCategory()"
                [disabled]="loading() || transactionsLoading()"
                (change)="selectCategory($event)"
              >
                <option value="">All categories</option>
                @for (category of categories(); track category.name) {
                  <option [value]="category.name">{{ category.name }}</option>
                }
              </select>
            </div>
          </div>

          @if (loading() || transactionsLoading()) {
            <p class="muted">Loading transactions...</p>
          } @else if (transactions().length === 0) {
            <p class="muted">No recent transactions in this category.</p>
          } @else {
            <div class="transaction-list">
              @for (transaction of transactions(); track transaction.id) {
                <article class="transaction-row">
                  <time [dateTime]="transaction.date">{{ transaction.date | date: 'MMM d' }}</time>
                  <div class="transaction-main">
                    <h3>{{ transaction.description }}</h3>
                    <p>{{ transaction.accountName }} · {{ transaction.category }}</p>
                  </div>
                  <strong [class.negative]="transaction.amount < 0">
                    {{ transaction.amount | number: '1.2-2' }}
                  </strong>
                </article>
              }
            </div>
          }
        </section>
      </section>
    </main>
  `
})
export class AppComponent {
  private readonly http = inject(HttpClient);

  readonly accounts = signal<Account[]>([]);
  readonly transactions = signal<Transaction[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selectedCategory = signal('');
  readonly loading = signal(true);
  readonly transactionsLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalBalance = computed(() =>
    this.accounts().reduce((total, account) => total + account.currentBalance, 0)
  );

  constructor() {
    Promise.all([
      this.loadAccounts(),
      this.loadCategories(),
      this.loadTransactions()
    ])
      .catch(() => {
        this.error.set('Could not load the finance snapshot. Check that the backend is running on port 8080.');
      })
      .finally(() => this.loading.set(false));
  }

  selectCategory(event: Event): void {
    const category = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(category);
    this.transactionsLoading.set(true);
    this.error.set(null);

    this.loadTransactions(category)
      .catch(() => {
        this.error.set('Could not load recent transactions. Please try another category.');
      })
      .finally(() => this.transactionsLoading.set(false));
  }

  private async loadAccounts(): Promise<void> {
    this.accounts.set(await firstValueFrom(this.http.get<Account[]>('/api/accounts')));
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(await firstValueFrom(this.http.get<Category[]>('/api/transactions/categories')));
  }

  private async loadTransactions(category = ''): Promise<void> {
    this.transactions.set(await firstValueFrom(
      this.http.get<Transaction[]>('/api/transactions/recent', {
        params: recentTransactionQuery(category)
      })
    ));
  }
}
