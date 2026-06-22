# Car Rental System

React + TypeScript frontend and Spring Boot backend — vehicle catalog, bookings, staff pickup/return, reports.

**Stack:** Spring Boot 4 / Java 21, H2 (local dev), React 19 / Vite / Mantine.

## Quick Start

### Prerequisites

- **Java 21+** (backend)
- **Node.js 18+** and npm (frontend)

**JAVA_HOME:** `mvnw` needs a JDK with `javac`. If only JDK 26 provides `javac`:

```bash
export JAVA_HOME=/usr/lib/jvm/java-latest-openjdk   # adjust to your JDK path
./mvnw -Djava.version=26 spring-boot:run
```

### Backend

```bash
cd backend
cp src/main/resources/application-example.properties src/main/resources/application.properties
```

Append H2 settings (file DB — seeds persist in `backend/data/`):

```properties
spring.datasource.url=jdbc:h2:file:./data/carrental;DB_CLOSE_DELAY=-1
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Run:

```bash
./mvnw spring-boot:run
```

- API: `http://localhost:8080`
- H2 console: `http://localhost:8080/h2-console` (user `sa`, empty password)
- Flyway loads seed data and demo users on first start.

PostgreSQL: see `application-postgres.properties`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api` to backend). Optional: `cp .env.example .env` if API is not on `localhost:8080`.

## Demo accounts

Passwords are set in `V7__demo_user_passwords.sql` (plaintext: **`password`**).

| Email | Role | Password |
|-------|------|----------|
| `employee@rentacar.com` | EMPLOYEE | `password` |
| `john.smith@example.com` | CUSTOMER | `password` |
| `anna.johnson@example.com` | CUSTOMER | `password` |

## 5-minute demo script

**1. Customer books (~2 min)**

1. `http://localhost:5173` → **Log in** as `john.smith@example.com`.
2. Pick a vehicle → **Reserve** → dates, contact/licence, optional insurance / **GPS**.
3. Submit → **Confirm payment** (simulated).
4. **Dashboard** → view confirmed reservation.

**2. Employee pickup & return (~2 min)**

1. Log out → log in as `employee@rentacar.com`.
2. **Staff** → **To process** → **Pickup** on the reservation.
3. When ACTIVE → **Return** → optional damage notes / extra charges.

**3. Reports (~1 min)**

1. **Staff** → **Reports** → date range → **Generate report**.

## Simulated integrations

Per project spec (SSD), **payment** and **GPS** are mocked — no real payment provider or GPS hardware. Payment confirm/fail is on the booking UI; GPS is a priced checkbox.

## Useful commands

```bash
cd backend && ./mvnw test          # backend tests
cd frontend && npm run build       # production build
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `mvnw` cannot find `javac` | Set `JAVA_HOME` to a full JDK (see above). |
| Backend port in use | Free port 8080 or change `server.port`. |
| Empty catalog / no users | Ensure Flyway ran; delete `backend/data/carrental.mv.db` and restart. |
| Frontend cannot reach API | Backend running; check `VITE_API_BASE_URL` in `frontend/.env`. |

---

Academic project — see `stages/` for requirements. Swagger UI: `/swagger-ui.html` when backend is up.
