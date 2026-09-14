# 🌾 AgriMarket

A full-stack agricultural marketplace that enables users to buy and sell agricultural products while providing supporting services such as market prices, crop information, weather forecasts, and farming risk insights.

<div align="center">

| **🌐 Live Demo** | **📚 API Documentation** |
|:---:|:---:|
| [**AgriMarket Website**](https://agrimarket-website.netlify.app/) | [**Swagger UI**](https://agrimarket-backend-1-0-0.onrender.com/swagger-ui/index.html) |

</div>

---

## 📌 Overview

AgriMarket is a full-stack agricultural marketplace built with **Java Spring Boot, React, and PostgreSQL**. It supports product and inventory management, ordering, checkout, payments, OTP-based delivery tracking, admin management, market prices, crop information, weather forecasts, farming risk insights, and location services.

The application uses **JWT/OAuth2 authentication, Flyway migrations, Docker containerization, and a GitHub Actions CI/CD pipeline**, with integrations for external agricultural and platform services.

---

## ✨ Key Features

### 🔐 Authentication & Account Management

- User registration and login
- JWT-based authentication
- Refresh token sessions
- Google and GitHub OAuth2 authentication
- Email verification
- Password reset and password management
- Login attempt protection and temporary account lockout
- Role-based authorization

### 🌾 Product Marketplace

- Product listing and management
- Product search
- Product categories
- Product image uploads
- Cloudinary-based image storage

### 📦 Inventory Management

- Inventory tracking
- Stock management
- Stock adjustments

### 🛒 Orders & Checkout

- Product ordering
- Checkout workflow
- Order management
- Order status tracking

### 💳 Payments

- Payment processing workflow
- Payment transaction records
- Mock payment provider
- Refund-related functionality

### 🚚 Delivery

- Delivery management
- Delivery tracking
- OTP-based delivery verification

### 📊 Market Prices

- Agricultural market-price information
- Market-price trends
- External mandi-price integration

### 🌱 Crop Information

- Crop information
- Crop growth stages
- Crop images
- External crop-information integration

### 🌦️ Weather & Farming Risk

- Weather forecasts
- Farming risk calculation
- Weather-based farming insights

### 📍 Location Services

- Location search
- Geocoding
- Reverse geocoding
- State, district, and taluk data

### 👨‍💼 Admin Management

- Admin dashboard
- User management
- Product management and approval
- Inventory management
- Order management
- Payment management

---

## 👥 User Roles

### USER

- Manage profile
- Browse and manage products
- Place and track orders
- Complete checkout and payments
- Access agricultural services

### ADMIN

- Manage users
- Manage products
- Manage inventory
- Manage orders
- Manage payments
- Access administrative dashboard

---

## 🛠️ Tech Stack

### Backend

- **Java 25**
- **Spring Boot**
- **Spring Security**
- **Spring Data JPA**
- **Maven**

### Frontend

- **React**
- **JavaScript**
- **Vite**
- **Tailwind CSS**

### Database

- **PostgreSQL**
- **Flyway**

### Authentication & Security

- **JWT**
- **OAuth2**

### DevOps & Deployment

- **Docker**
- **Docker Compose**
- **GitHub Actions CI/CD**
- **Render**
- **Netlify**

### External Services

- **Cloudinary** — Product image storage
- **Brevo** — Email services
- **MSG91** — SMS and OTP
- **Geoapify** — Location and geocoding
- **Open-Meteo** — Weather data
- **Mandi API** — Agricultural market prices
- **Perenual** — Crop information

---

## 📁 Project Structure

```text
AgriMarket/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── backend/
│   ├── .dockerignore
│   ├── .env.example
│   ├── .gitattributes
│   ├── .mvn/
│   ├── Dockerfile
│   ├── VERSION
│   ├── docker-compose.yml
│   ├── keys/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── src/
│       ├── main/
│       └── test/
├── frontend/
│   ├── public/
│   │   ├── _redirects
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── .gitignore
```
---
## 🔐 Environment Variables

Create environment files for the frontend and backend according to the project configuration.

### Backend Environment Variables

Create a `.env` file inside the `backend/` directory using `.env.example` as a reference.

Configure the required variables for:

```env
DB_URL=your_postgresql_connection_string
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

JWT_PRIVATE_KEY_PATH=path_to_private_key
JWT_PUBLIC_KEY_PATH=path_to_public_key

BREVO_API_KEY=your_brevo_api_key

MSG91_AUTH_KEY=your_msg91_auth_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

GEOAPIFY_API_KEY=your_geoapify_api_key

MANDI_API_URL=your_mandi_api_url
PERENUAL_API_KEY=your_perenual_api_key
```
## ⚙️ Setup & Installation

### Prerequisites

Make sure the following are installed:

- **Java 25**
- **Node.js**
- **Docker**
- **Git**

### Clone the Repository

~~~bash
git clone https://github.com/RevanasiddaNimbal/agriMarket.git
cd agroMarket
~~~

---

### Backend Setup

~~~bash
cd backend

# Copy environment file and fill in your values
cp .env.example .env

# Give execute permission to Maven wrapper (Linux/Mac)
chmod +x mvnw

# Install dependencies and build the project
./mvnw clean install

# Run database migrations (Flyway) — this usually runs automatically on app start,
# but you can trigger it manually if needed
./mvnw flyway:migrate

# Start the backend server
./mvnw spring-boot:run
~~~

By default, the backend runs on:

~~~
http://localhost:8080
~~~

Swagger UI:

~~~
http://localhost:8080/swagger-ui/index.html
~~~

#### Running Backend with Docker (Alternative)

~~~bash
cd backend

# Build and start the backend + PostgreSQL using Docker Compose
docker-compose up --build

# To stop the containers
docker-compose down
~~~

---

### Frontend Setup

~~~bash
cd frontend

# Copy environment file and fill in your values
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
~~~

By default, the frontend runs on:

~~~
http://localhost:5173
~~~

#### Build Frontend for Production

~~~bash
npm run build
~~~

Production-ready static files are generated in the `dist/` folder.

---

### Running Both Together (Local Dev)

**Terminal 1 — Backend**

~~~bash
cd backend
./mvnw spring-boot:run
~~~

**Terminal 2 — Frontend**

~~~bash
cd frontend
npm run dev
~~~

Then visit:

~~~
http://localhost:5173
~~~
---
## 👨‍💻 Developer

**Revanasidda Nimbal** is the developer of AgriMarket.

- GitHub: [**RevanasiddaNimbal**](https://github.com/RevanasiddaNimbal)
- LinkedIn: [**Revanasidda Nimbal**](https://www.linkedin.com/in/revanasidda-nimbal-68a596365/)
- Email: `revanasiddanimbal82@gmail.com`

---

## 🤝 Contributing

Contributions are welcome!

If you would like to contribute to AgriMarket, you are encouraged to:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and test them locally.
4. Commit your changes with a clear commit message.
5. Push your branch to GitHub.
6. Open a Pull Request.

Please make sure your contributions follow the existing project structure and coding conventions.

Suggestions, bug reports, improvements, and new feature ideas are also welcome.

Thank you for helping improve AgriMarket! 🌾
