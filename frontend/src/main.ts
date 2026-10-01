import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

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
        <section class="notice" role="alert">
          {{ error() }}
        </section>
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
          <div class="panel-heading">
            <h2 id="transactions-title">Recent transactions</h2>
          </div>

          @if (loading()) {
            <p class="muted">Loading transactions...</p>
          } @else {
            <div class="transaction-list">
              @for (transaction of transactions(); track transaction.id) {
                <article class="transaction-row">
                  <time [dateTime]="transaction.date">
                    {{ transaction.date | date: 'MMM d' }}
                  </time>
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
  `,
  styles: []
})
class AppComponent {
  private readonly http = inject(HttpClient);

  readonly accounts = signal<Account[]>([]);
  readonly transactions = signal<Transaction[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalBalance = computed(() =>
    this.accounts().reduce((total, account) => total + account.currentBalance, 0)
  );

  constructor() {
    Promise.all([
      this.loadAccounts(),
      this.loadTransactions()
    ])
      .catch(() => {
        this.error.set('Could not load the finance snapshot. Check that the backend is running on port 8080.');
      })
      .finally(() => this.loading.set(false));
  }

  private loadAccounts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Account[]>('/api/accounts').subscribe({
        next: accounts => {
          this.accounts.set(accounts);
          resolve();
        },
        error: reject
      });
    });
  }

  private loadTransactions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Transaction[]>('/api/transactions/recent?limit=8').subscribe({
        next: transactions => {
          this.transactions.set(transactions);
          resolve();
        },
        error: reject
      });
    });
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
}).catch(error => console.error(error));
