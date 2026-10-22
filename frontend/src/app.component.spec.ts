import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';

const accounts = [
  { id: 1, name: 'Everyday account', type: 'Checking', currentBalance: 1250.5 },
  { id: 2, name: 'Credit card', type: 'Credit', currentBalance: -50.25 }
];

const categories = [
  { name: 'Groceries' },
  { name: 'Transport' }
];

const recentTransactions = [
  {
    id: 10,
    accountId: 1,
    accountName: 'Everyday account',
    date: '2026-10-20',
    description: 'Corner market',
    amount: -24.75,
    category: 'Groceries'
  }
];

describe('AppComponent category filtering', () => {
  let fixture: ComponentFixture<AppComponent>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    fixture = TestBed.createComponent(AppComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('loads and renders accounts, categories, and recent transactions', async () => {
    expect(text()).toContain('Loading accounts...');
    expect(text()).toContain('Loading transactions...');
    expect(categorySelect().disabled).toBe(true);

    completeInitialLoad();
    await renderCompletedRequests();

    expect(text()).toContain('Everyday account');
    expect(text()).toContain('Credit card');
    expect(text()).toContain('1,200.25');
    expect(text()).toContain('Corner market');
    expect(categoryOptions()).toEqual(['All categories', 'Groceries', 'Transport']);
    expect(categorySelect().disabled).toBe(false);
  });

  it('filters and switches transactions while preserving the account summary', async () => {
    completeInitialLoad();
    await renderCompletedRequests();

    chooseCategory('Groceries');

    const groceriesRequest = http.expectOne(
      request => request.url === '/api/transactions/recent' &&
        request.params.get('limit') === '8' &&
        request.params.get('category') === 'Groceries'
    );
    fixture.detectChanges();

    expect(text()).toContain('Loading transactions...');
    expect(text()).not.toContain('Corner market');
    expect(text()).toContain('Everyday account');
    expect(text()).toContain('1,200.25');
    expect(categorySelect().disabled).toBe(true);

    groceriesRequest.flush([
      { ...recentTransactions[0], id: 11, description: 'Weekly shop', amount: -61.2 }
    ]);
    await renderCompletedRequests();

    expect(text()).toContain('Weekly shop');
    expect(text()).not.toContain('Corner market');

    chooseCategory('Transport');
    http.expectOne(
      request => request.url === '/api/transactions/recent' &&
        request.params.get('category') === 'Transport'
    ).flush([]);
    await renderCompletedRequests();

    expect(text()).toContain('No recent transactions in this category.');
    expect(text()).toContain('Everyday account');
    expect(text()).toContain('1,200.25');
  });

  it('shows a transaction error without discarding the account summary', async () => {
    completeInitialLoad();
    await renderCompletedRequests();

    chooseCategory('Groceries');
    http.expectOne(
      request => request.url === '/api/transactions/recent' &&
        request.params.get('category') === 'Groceries'
    ).flush('Backend unavailable', { status: 503, statusText: 'Service Unavailable' });
    await renderCompletedRequests();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.textContent).toContain('Could not load recent transactions.');
    expect(text()).toContain('Everyday account');
    expect(text()).toContain('1,200.25');
    expect(categorySelect().disabled).toBe(false);
  });

  function completeInitialLoad(): void {
    http.expectOne('/api/accounts').flush(accounts);
    http.expectOne('/api/transactions/categories').flush(categories);
    http.expectOne(
      request => request.url === '/api/transactions/recent' &&
        request.params.get('limit') === '8' &&
        !request.params.has('category')
    ).flush(recentTransactions);
  }

  async function renderCompletedRequests(): Promise<void> {
    for (let remainingTurns = 10;
      fixture.componentInstance.loading() || fixture.componentInstance.transactionsLoading();
      remainingTurns -= 1) {
      if (remainingTurns === 0) {
        throw new Error('The component did not finish loading after its pending request completed.');
      }
      await Promise.resolve();
    }
    fixture.detectChanges();
    http.verify();
  }

  function chooseCategory(category: string): void {
    const select = categorySelect();
    select.value = category;
    select.dispatchEvent(new Event('change'));
  }

  function categorySelect(): HTMLSelectElement {
    return fixture.nativeElement.querySelector('#category-filter') as HTMLSelectElement;
  }

  function categoryOptions(): string[] {
    return Array.from(categorySelect().options, option => option.textContent ?? '');
  }

  function text(): string {
    return fixture.nativeElement.textContent ?? '';
  }
});
