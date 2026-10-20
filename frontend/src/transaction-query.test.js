import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { recentTransactionQuery } from './transaction-query.js';

describe('recentTransactionQuery', () => {
  it('keeps all categories as the default while preserving the recent limit', () => {
    assert.deepEqual(recentTransactionQuery(''), { limit: 8 });
  });

  it('adds the selected category without changing the recent limit', () => {
    assert.deepEqual(recentTransactionQuery('Groceries'), {
      limit: 8,
      category: 'Groceries'
    });
  });
});
