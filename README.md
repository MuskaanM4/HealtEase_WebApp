# HealthEase

A healthcare and online pharmacy web app built for Suriname. Customers can browse products, place prescription-based orders, track their orders, and leave testimonials. Pharmacies can manage stock and orders.

Built with HTML, CSS, JavaScript, Node.js, Express, Prisma, and MySQL.

---

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js
- MySQL or MariaDB
- MySQL Workbench for database management
- Git
- A simple static server for the frontend, such as the VS Code Live Server extension

---

## Getting started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd healtease_webapp
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

There is no frontend build step in this project because the frontend is made with static HTML, CSS, and JavaScript files in the project root.

---

## Database setup

Open your MySQL and create the database:

```sql
CREATE DATABASE healthease_db;
```

If you prefer, you can also run the SQL file:

```text
backend/scripts/create_database.sql
```

After the database exists, go to the backend folder and push the Prisma schema:

```bash
cd backend
npx prisma migrate dev --name init
```

Seed the database with demo data:

```bash
npm run seed
```

After seeding, your database will contain demo products, pharmacies, stock, users and reviews.

---

## Environment variables

Create a `.env` file inside the `backend` folder.

You can copy the .env.example example file:

```bash
cp .env.example
```

Use values like this:

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/healthease_db"
JWT_SECRET="dev_secret_key"
PORT=4000
```

Replace `root` and `yourpassword` with your own database credentials.


Create a `uploads` file inside the `backend` folder.
This is for the Prescriptions and ID that are uploaded on the app. 

---

## Running the app

You need:

1. the backend running
2. the frontend opened through a local static server

**Terminal 1 - Backend**

```bash
cd backend
npm run dev
```

**Frontend**

Open the project root with Live Server in VS Code.


| Service  | URL |
|----------|-----|
| Frontend | Usually `http://127.0.0.1:5501` or your Live Server URL |
| Backend  | `http://localhost:4000` |

---

## Demo accounts

After running the seed script, you can log in with:

- Pharmacy: `central@healtease.test` / `pharmacy123`
- Customer: `user@healtease.test` / `user123`

---

## Main features

- Homepage with featured pharmacy experience
- Shop page with product categories and product listings
- Login and registration
- Customer account page with order history
- Checkout flow with prescription and ID upload
- Testimonials page
- Pharmacy dashboard for stock and order management

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript, Bootstrap 5 | Dynamic navbar loading with `fetch()` |
| Backend | Node.js, Express.js |
| ORM | Prisma |
| Database | MySQL |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Security | bcryptjs | 
| File uploads | Multer |
| Environment | dotenv | 

---

## Additional details

### API architecture

- The frontend and backend are separated
- The frontend is a static multi-page application that communicates with the backend through `fetch()`
- The backend exposes REST-style API routes under `/api`
- Authentication is handled with JWT tokens stored in the browser and sent in protected requests
- Prisma is used as the data access layer between the Express API and the MySQL database

### Map integration

- The checkout page uses `Leaflet.js` together with `OpenStreetMap`
- Customers can select or confirm a delivery location on the map
- Pharmacy data is loaded from the backend and used during the checkout flow
- Delivery distance is estimated in the frontend for the UI and validated in the backend with a haversine distance calculation

### Static assets

- The frontend is built as a Multi-Page Application (MPA)
- Pages such as `index.html`, `shop.html`, `checkout.html`, and `login.html` are separate entry points
- The navigation bar is loaded dynamically through a shared script in [shared/load-navbar.js]
- Shared assets in the `shared/` folder help reduce duplication across pages


## API overview

For a backend-specific setup guide, see:

- [backend/README.md]

---

## Important notes

- The frontend currently calls the backend using `http://localhost:4000`
- New orders are currently routed to `Central Pharmacy`
- Delivery orders require customer coordinates
- Delivery is rejected if the customer is more than 15 km away
- Uploaded files are stored in `backend/uploads`

---

## Troubleshooting

**Backend won't connect to the database**

Check your `backend/.env` file and make sure:

- MySQL is running
- the username and password are correct
- the database `healthease_db` exists

**Frontend loads but data does not appear**

Make sure the backend is running on `http://localhost:4000`.

Make sure you ran the `npm run seed` command and used Live Server

**Login fails for demo accounts**

Run the seed script again:

```bash
cd backend
npm run seed
npm run dev
```

**Images or navbar do not load**

Make sure you opened the frontend through a local server like Live Server and not directly as a `file:///` path.

**Order creation fails**

Check that both required files are uploaded:

- prescription
- ID card

and the Terms & Conditions is clicked
