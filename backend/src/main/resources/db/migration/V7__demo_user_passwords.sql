update users
set password_hash = '$2a$10$lTgb2N428TbpP5ezR87/L.zZgM5oNYvdGhOZeEUtqXoEY2NDR./MK'
where email in (
    'john.smith@example.com',
    'anna.johnson@example.com',
    'employee@rentacar.com'
);
