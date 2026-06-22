-- Return inspection fields: pickup/damage notes and extra charges recorded at vehicle return.
alter table reservations add column if not exists pickup_notes varchar(2000);
alter table reservations add column if not exists damage_notes varchar(2000);
alter table reservations add column if not exists extra_charges double precision not null default 0;
