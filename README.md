# 📝 Blog Management System (Node.js)

A full-featured **Blog Management System** built using Node.js that allows users to create, manage, and interact with blogs. This project includes **authentication, admin panel, comments, likes, pagination, email verification, and REST APIs with JWT authentication**.

---

## 🚀 Features

### 👤 User Features

* User Signup & Login with validation
* Email verification on signup
* Reset password via email
* Upload profile photo
* Create, edit, delete blogs
* Upload images in blog
* Like and comment on blogs
* View all blogs in card layout
* Pagination for blogs
* Search blogs by title
* Session management & JWT authentication

---

### 💬 Blog Features

* Create, update, delete blog
* Image upload with preview
* Like functionality
* Comment system (store & view comments)
* View top blogs
* Card-based UI

---

### 🔐 Authentication & Security

* Session-based authentication
* JWT Authentication (User & Admin)
* Input validation (Frontend + Backend)
* Protected routes
* Email authentication & password reset

---

### 🛠️ Admin Panel

* Admin login with validation
* View all users in table format
* Sort users by Name & DOB
* Filter users by DOB & Created Date
* Search users by username
* Enable / Disable users
* Delete users
* View all blogs
* Delete blogs
* View users who liked a blog
* Set pagination limit
* View total users & total blogs
* View top 10 users and blogs

---

### 📊 Additional Features

* Pagination (User & Blog)
* Toaster notifications
* 404 error page
* Pop-up confirmation (delete actions)
* Responsive UI with improved CSS
* Postman API collection
* REST APIs for:

  * Authentication
  * User
  * Admin

---

## 🛠️ Tech Stack

**Backend:**

* Node.js
* Express.js

**Frontend:**

* HTML, CSS, JavaScript
* EJS / Template Engine *(update if different)*

**Database:**

* MongoDB

**Authentication:**

* Session-based auth
* JWT Authentication

**Other Tools:**

* Nodemailer (Email service)
* Multer (Image upload)
* Postman (API testing)

---

## 📂 Project Structure

```bash
Blog_Management_Deploye/
│── models/
│── routes/
│── controllers/
│── views/
│── public/
│── middleware/
│── config/
│── utils/
│── package.json
│── app.js / server.js
```

---

## ⚙️ Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/LadvaVishal/Blog_Management_Deploye.git
```

2. Navigate to project:

```bash
cd Blog_Management_Deploye
```

3. Install dependencies:

```bash
npm install
```

4. Create `.env` file:

```env
PORT=3000
DB_URL=your_database_url
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
SESSION_SECRET=your_session_secret
```

5. Run the project:

```bash
npm start
```

---

## 🌐 API Endpoints (Postman)

### 🔑 Authentication APIs

* Register User
* Login User
* Email Verification
* Reset Password

### 👤 User APIs

* Get User Details
* Update Profile
* Upload Profile Photo

### 🛡️ Admin APIs

* Get All Users
* Delete User
* Enable/Disable User
* View Blogs

---

## 📸 Screenshots

*Add screenshots of your UI here*

---

## 📌 Key Functionalities Implemented

* MVC Architecture
* Data Dictionary & Schema Design
* CRUD Operations
* Advanced Filtering & Sorting
* Search Functionality
* Pagination System
* Email Services Integration
* Role-based Access Control

---

## ❗ Validation

* Frontend + Backend validation implemented for:

  * Login
  * Signup
  * Add/Edit Blog

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Vishal Ladva**
🔗 GitHub: https://github.com/LadvaVishal

---

## ⭐ Support

If you found this project useful, please give it a ⭐ on GitHub!
