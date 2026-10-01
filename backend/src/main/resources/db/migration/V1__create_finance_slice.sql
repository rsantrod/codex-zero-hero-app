create table accounts (
    id bigint primary key,
    name varchar(120) not null,
    type varchar(40) not null,
    current_balance numeric(12, 2) not null
);

create table transactions (
    id bigint primary key,
    account_id bigint not null references accounts(id),
    transaction_date date not null,
    description varchar(180) not null,
    amount numeric(12, 2) not null,
    category varchar(80) not null
);

create index idx_transactions_recent on transactions (transaction_date desc, id desc);

insert into accounts (id, name, type, current_balance) values
    (1, 'Everyday Checking', 'Checking', 2480.42),
    (2, 'Rainy Day Savings', 'Savings', 9125.00),
    (3, 'Travel Card', 'Credit Card', -384.27);

insert into transactions (id, account_id, transaction_date, description, amount, category) values
    (1001, 1, date '2026-09-30', 'Fictional payroll deposit', 3200.00, 'Income'),
    (1002, 1, date '2026-09-29', 'Neighborhood market', -64.18, 'Groceries'),
    (1003, 3, date '2026-09-28', 'Sample train tickets', -48.50, 'Travel'),
    (1004, 1, date '2026-09-27', 'City utilities', -126.35, 'Utilities'),
    (1005, 2, date '2026-09-26', 'Automatic savings transfer', 500.00, 'Savings'),
    (1006, 3, date '2026-09-25', 'Fictional cafe visit', -12.40, 'Dining'),
    (1007, 1, date '2026-09-24', 'Apartment rent', -1450.00, 'Housing'),
    (1008, 1, date '2026-09-23', 'Bookshop example purchase', -31.99, 'Personal');
