# Car Rental System

Web app for renting cars. Customers browse vehicles and make bookings. Staff manage pickups, returns, fleet, and reports.

**Frontend:** React + TypeScript (Vite)  
**Backend:** Spring Boot + H2 database

## Run the app

You need **Java 21+** and **Node.js 18+**.

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

API: http://localhost:8080

If `mvnw` fails, set Java:

```bash
export JAVA_HOME=/usr/lib/jvm/java-26
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Demo logins

Password for all: `password`

| Email | Role |
|-------|------|
| `john.smith@example.com` | Customer |
| `employee@rentacar.com` | Employee |

## Quick demo

1. Log in as customer → pick a car → reserve → confirm payment  
2. Log in as employee → Staff → pickup → return  
3. Staff → Reports → pick dates → generate report  

## Notes

- Payment and GPS are **simulated** (academic project).
- Project docs are in `stages/`.
- Backend tests: `cd backend && ./mvnw test`
