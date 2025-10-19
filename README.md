# 🥗 FeedForward – A Food Redistribution Management Platform

> **A smart, community-driven platform to minimize food waste by connecting food donors with NGOs and individuals in need.**

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7+-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success)

---

## 🚀 Overview

Every day, tons of edible food go to waste while many people go hungry.  
**FeedForward** bridges this gap by creating a digital link between donors (restaurants, households, event organizers) and receivers (NGOs, shelters, individuals in need).

It allows users to:
- Donate food through a simple form-based interface.
- View and claim available donations in real time.
- Match nearby NGOs automatically.
- Track the food collection and delivery process.
- Manage donation requests through an admin dashboard.

> A **Spring Boot–based web application** designed to create a transparent, real-time food redistribution ecosystem.  
> FeedForward helps communities reduce waste and feed more people — efficiently and sustainably.

---

## 👥 Target Audience

- **NGOs & Shelters** – Receive and manage surplus food donations.  
- **Restaurants & Event Organizers** – Donate leftover food easily.  
- **Volunteers** – Track, collect, and deliver food safely.  
- **Admins** – Oversee users, donations, and reports.

---

## 🧰 Tech Stack

| Layer | Technologies Used |
|-------|--------------------|
| **Backend** | Java 17, Spring Boot, Spring MVC |
| **Frontend** | HTML5, CSS3, JavaScript, Thymeleaf |
| **Database** | MongoDB |
| **Authentication** | JWT (JSON Web Tokens) |
| **Build Tool** | Maven |
| **IDE / Environment** | Eclipse IDE, VS Code |

---

## ✨ Key Features

✅ **User Management** – Role-based login & registration for donors, NGOs, and volunteers.  
✅ **Donation Posting** – Add details such as quantity, pickup location, and expiry time.  
✅ **Real-Time Dashboard** – View all ongoing and available food donations.  
✅ **Notifications** – NGOs are alerted when nearby donations are available.  
✅ **Admin Panel** – Manage users, food requests, approvals, and reports.  
✅ **Database Integration** – Secure storage and retrieval using MongoDB.  
✅ **RESTful APIs** – API endpoints for seamless mobile/web integrations.  
✅ **Secure Authentication** – Token-based authentication for each role.  

---

## 🏗️ Project Structure
foodRed_final/
├── src/
│ ├── main/
│ │ ├── java/com/foodredistribution/
│ │ │ ├── config/ # Application configuration & JWT setup
│ │ │ ├── controller/ # REST controllers (Admin, Donation, Auth)
│ │ │ ├── model/ # POJO classes (Admin, Donation, Organization)
│ │ │ ├── repository/ # MongoDB repositories (Spring Data)
│ │ │ ├── security/ # Security configuration & filters
│ │ │ └── service/ # Business logic and service layer
│ │ ├── resources/
│ │ │ ├── static/ # Frontend assets (CSS, JS, images)
│ │ │ ├── templates/ # Thymeleaf HTML views
│ │ │ └── application.properties # App config (MongoDB URI, port)
│ └── test/ # Unit & integration tests
├── pom.xml # Maven dependencies and build setup
├── mvnw, mvnw.cmd # Maven wrapper scripts
├── HELP.md # Spring Boot generated help
└── .gitignore # Ignored build and IDE files

---

## ⚙️ Environment Setup

### 🧩 Prerequisites
Ensure you have the following installed:
- [Java JDK 17+](https://adoptium.net/)
- [Maven 3.8+](https://maven.apache.org/)
- [MongoDB 6+](https://www.mongodb.com/try/download/community)
- [Eclipse IDE](https://www.eclipse.org/downloads/) or [VS Code](https://code.visualstudio.com/)
- Git & GitHub CLI (optional for version control)

---

### 🧱 MongoDB Setup
1. Install and start MongoDB locally:
   ```bash
   mongod
2. Default connection used by the app: mongodb://localhost:27017/foodredistributiondb

3. You can change this in: src/main/resources/application.properties
Example:
spring.data.mongodb.uri=mongodb://localhost:27017/foodredistributiondb
server.port=8888
jwt.secret=YourSecretKeyHere

Running the Application (Eclipse)

🧮 Running the Application (Eclipse)

Open Eclipse → File → Import → Maven → Existing Maven Projects

Select folder:
C:\Users\madha\eclipse-workspace\foodRed_final

Wait for Maven dependencies to load.

Open the main class:
com.foodredistribution.FoodRedApplication

Right-click → Run As → Java Application.

The backend starts at:

http://localhost:8888

🌐 API Overview
Method	Endpoint	Description
POST	/api/admin/login	Admin login (JWT authentication)
GET	/api/admin/organizations	Fetch all registered organizations
GET	/api/admin/donations	Retrieve all food donations
GET	/api/admin/requests/pending	Get all pending donation requests
PUT	/api/admin/requests/{id}/approve	Approve a donation request
PUT	/api/admin/requests/{id}/reject	Reject a donation request

For complete API documentation, refer to controller package or future Swagger integration.

🧑‍💻 How It Works

Donor Login/Register → Fill food details & submit donation.

NGOs Get Notifications → View nearby food donations.

Admin Approves/Rejects Requests → Monitors all donation flows.

Volunteers Collect & Deliver Food → Updates status in real time.

🧾 .env Example (Optional Configuration)

If you plan to use an .env file, create one in the project root:

MONGO_URI=mongodb://localhost:27017/foodredistributiondb
SERVER_PORT=8888
JWT_SECRET=YourSecretKey

🚧 Future Enhancements

📱 Mobile app integration (React Native / Flutter).

🌐 Google Maps API for route and distance tracking.

🕒 Donation scheduling & expiry reminders.

📊 Analytics dashboard for admin insights.

🔒 Two-factor authentication for admins and NGOs.

🤝 Contributing

Contributions are welcome! Feel free to fork and enhance!
To contribute:
1. Fork the repository.
2. Create a new branch: git checkout -b feature/new-feature.
3. Commit your changes: git commit -m "Add new feature".
4. Push the branch: git push origin feature/new-feature.
5. Open a Pull Request.

📜 License
This project is licensed under the MIT License.
You’re free to use, modify, and distribute this project with attribution.

🌟 Acknowledgements
Spring Boot – Backend framework.
MongoDB – Database engine.
Thymeleaf – Template rendering engine.
Eclipse IDE– Development environment.

🧡 Support
If you find this project helpful, please ⭐ star the repository — it really helps support the project!

