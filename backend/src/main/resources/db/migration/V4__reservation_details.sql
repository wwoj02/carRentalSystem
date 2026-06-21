alter table reservations add column customer_name varchar(255);
alter table reservations add column customer_email varchar(255);
alter table reservations add column customer_phone varchar(255);
alter table reservations add column driving_licence_id varchar(255);
alter table reservations add column insurance_type varchar(50);
alter table reservations add column gps_included boolean not null default false;
alter table reservations add column young_driver boolean not null default false;

update reservations r
set customer_name = (
        select concat(u.first_name, ' ', u.last_name)
        from users u
        where u.id = r.user_id
    ),
    customer_email = (
        select u.email
        from users u
        where u.id = r.user_id
    ),
    insurance_type = 'none';
