alter table users add column role varchar(50) not null default 'CUSTOMER';

insert into users (first_name, last_name, email, password_hash, role)
select
    'Demo',
    'Employee',
    'employee@rentacar.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'EMPLOYEE'
where not exists (
    select 1 from users where email = 'employee@rentacar.com'
);
