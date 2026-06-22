-- Demo completed reservations and matching payments for Reports tab seed data.
-- Demo passwords for john.smith@example.com, anna.johnson@example.com, and employee@rentacar.com are documented in README.

insert into reservations (
    id,
    user_id,
    vehicle_id,
    start_date,
    end_date,
    total_price,
    status,
    customer_name,
    customer_email,
    insurance_type
)
select
    2,
    1,
    2,
    date '2026-06-01',
    date '2026-06-04',
    1260.0,
    'COMPLETED',
    'John Smith',
    'john.smith@example.com',
    'none'
where not exists (select 1 from reservations where id = 2);

insert into reservations (
    id,
    user_id,
    vehicle_id,
    start_date,
    end_date,
    total_price,
    status,
    customer_name,
    customer_email,
    insurance_type
)
select
    3,
    2,
    3,
    date '2026-06-10',
    date '2026-06-13',
    750.0,
    'COMPLETED',
    'Anna Johnson',
    'anna.johnson@example.com',
    'none'
where not exists (select 1 from reservations where id = 3);

insert into payments (
    reservation_id,
    amount,
    currency,
    status,
    provider_transaction_id,
    payment_url,
    created_at,
    paid_at
)
select
    2,
    1260.0,
    'PLN',
    'PAID',
    'demo-tx-completed-002',
    'http://localhost:8080/mock-payment/demo-tx-completed-002',
    timestamp '2026-06-01 09:00:00',
    timestamp '2026-06-01 09:05:00'
where not exists (select 1 from payments where reservation_id = 2);

insert into payments (
    reservation_id,
    amount,
    currency,
    status,
    provider_transaction_id,
    payment_url,
    created_at,
    paid_at
)
select
    3,
    750.0,
    'PLN',
    'PAID',
    'demo-tx-completed-003',
    'http://localhost:8080/mock-payment/demo-tx-completed-003',
    timestamp '2026-06-10 11:30:00',
    timestamp '2026-06-10 11:35:00'
where not exists (select 1 from payments where reservation_id = 3);
