insert into users (first_name, last_name, email)
values
    ('John', 'Smith', 'john.smith@example.com'),
    ('Anna', 'Johnson', 'anna.johnson@example.com');

insert into vehicles (
    brand,
    model,
    production_year,
    vehicle_type,
    drive_type,
    price_per_day,
    available,
    image_url,
    description
)
values
    (
        'Toyota',
        'Corolla',
        2022,
        'Sedan',
        'FWD',
        180.0,
        true,
        'https://example.com/toyota-corolla.jpg',
        'Economical sedan for city driving'
    ),
    (
        'BMW',
        'X5',
        2023,
        'SUV',
        'AWD',
        420.0,
        true,
        'https://example.com/bmw-x5.jpg',
        'Comfortable premium-class SUV'
    ),
    (
        'Audi',
        'A4',
        2021,
        'Sedan',
        'FWD',
        250.0,
        true,
        'https://example.com/audi-a4.jpg',
        'Versatile car for both highways and city driving'
    ),
    (
        'Kia',
        'Sportage',
        2022,
        'SUV',
        'FWD',
        230.0,
        true,
        'https://example.com/kia-sportage.jpg',
        'Practical family SUV'
    );

insert into reservations (
    user_id,
    vehicle_id,
    start_date,
    end_date,
    total_price,
    status
)
values
    (
        1,
        1,
        date '2026-06-20',
        date '2026-06-23',
        540.0,
        'PENDING_PAYMENT'
    );
