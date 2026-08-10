# 📝 Blogify – Modern Blog Management Platform

Blogify is a full-stack blog application that allows users to discover, create, edit, and manage blog posts through a clean and responsive interface.

The project includes user authentication, a personal dashboard, blog management, profile customization, newsletter subscription, and REST API integration.

## 🚀 Features

### 👤 Authentication

* User Registration
* User Login
* Secure authentication
* Protected dashboard
* Logout functionality

### 🏠 Blog Platform

* Browse published blogs
* View individual blog posts
* Search and filter blogs
* Category-based blog organization
* Responsive blog layout

### ✍️ Blog Management

* Create new blog posts
* Edit existing blogs
* Delete blogs
* Add blog title, content, category, and images
* Manage published content from the dashboard

### 📊 User Dashboard

* Personalized dashboard
* View created blogs
* Manage blog posts
* Edit and delete posts
* Blog statistics

### 👤 Profile Management

* Update profile information
* Edit user details
* Profile customization

### 📩 Newsletter

* Newsletter subscription
* Email-based subscription
* Subscription confirmation

### 📱 Responsive Design

* Desktop-friendly UI
* Mobile-friendly layout
* Responsive navigation
* Modern and clean user interface

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Web Design

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB

### Authentication

* JWT Authentication

### Deployment

* Netlify – Frontend
* Backend API – Node.js/Express deployment

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman

---

## 📂 Project Structure

```text
Blogify/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── edit-blog.html
│   ├── profile.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/blogify.git
```

### 2. Navigate to the Project

```bash
cd blogify
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> Never upload your `.env` file or secret keys to GitHub.

### 5. Start the Backend Server

```bash
npm start
```

For development:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 6. Run the Frontend

Open the frontend using **Live Server** in Visual Studio Code or serve it through your preferred local development server.

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |

### Blogs

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| GET    | `/api/blogs`     | Get all blogs     |
| GET    | `/api/blogs/:id` | Get a single blog |
| POST   | `/api/blogs`     | Create a blog     |
| PUT    | `/api/blogs/:id` | Update a blog     |
| DELETE | `/api/blogs/:id` | Delete a blog     |

### User

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/api/users/profile` | Get user profile    |
| PUT    | `/api/users/profile` | Update user profile |

---

## 🔐 Security

Blogify uses authentication and protected API routes to prevent unauthorized access.

Security practices include:

* JWT-based authentication
* Protected dashboard routes
* Password hashing
* Environment variables for sensitive configuration
* Authorization checks for blog operations
* `.env` excluded from Git

---

## 🎨 UI Pages

Blogify includes the following major pages:

* 🏠 Home
* 🔐 Login
* 📝 Register
* 📚 Blog Details
* 📊 Dashboard
* ✍️ Create Blog
* 🖊️ Edit Blog
* 👤 Profile

---

## 📸 Screenshots

Add screenshots of your project here:

```text
screenshots/
├── home.png
├── login.png
├── dashboard.png
├── create-blog.png
└── profile.png
```

Example:

```markdown
![Blogify Home](screenshots/home.png)
```

---

## 🌐 Live Demo

🔗 **Live Website:**
Add your deployed Blogify URL here.

🔗 **Backend API:**
Add your deployed backend URL here.

---

## 📌 Future Improvements

* [ ] Like and comment system
* [ ] User follow system
* [ ] Rich text editor
* [ ] Image upload
* [ ] Advanced blog search
* [ ] Admin dashboard
* [ ] Social sharing
* [ ] Email notifications
* [ ] Dark mode
* [ ] Blog analytics

---

## 🎯 Project Objective

The main objective of Blogify is to build a practical full-stack web application while implementing real-world concepts such as:

* REST API development
* Authentication and authorization
* CRUD operations
* Database integration
* Responsive UI development
* Frontend-backend communication
* Deployment
* Git and GitHub workflow

---

## 👩‍💻 Author

**Jyoti Prasad**

MCA Student | Full-Stack Web Development Enthusiast

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!

---

## 📄 License

This project is created for educational and portfolio purposes.
