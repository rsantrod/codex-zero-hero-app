export function recentTransactionQuery(category) {
  return category
    ? { limit: 8, category }
    : { limit: 8 };
}
