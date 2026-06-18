alter table users add column if not exists role varchar(32) not null default 'USER';

update users set role = 'ADMIN' where id = 1;

create unique index if not exists uk_users_email on users (email);

create index if not exists idx_reservations_user_id on reservations (user_id);

create index if not exists idx_reservations_vehicle_dates
    on reservations (vehicle_id, start_date, end_date);

create index if not exists idx_payments_provider_transaction_id
    on payments (provider_transaction_id);
