alter table users add column password_hash varchar(255);

update users
set password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
where password_hash is null;

create unique index ux_users_email on users(email);
