# **Khatabook - Personal Financial Management System**

Khatabook is a simple and intuitive web-based application that helps users track and manage their *hisabs* (financial records). Whether it's expenses, payments, or general transactions, this tool makes it easy to add, edit, delete, and organize records efficiently.  

---

## **Features**

- **User Authentication**  
   - Secure login and registration system with session management.  

- **Create & Manage Hisabs**  
   - Add, edit, view, and delete financial records effortlessly.  

- **Persistent Data Storage**  
   - Financial records are saved in a MongoDB database and also stored locally as `.txt` files for offline accessibility.  

- **User-Specific Records**  
   - Each user has their own financial records, ensuring privacy and organization.  

- **Dynamic Interface**  
   - Clean, responsive, and user-friendly UI built with EJS templating.  

---

## **Tech Stack**

- **Backend**: Node.js, Express.js  
- **Frontend**: EJS, HTML, CSS  
- **Database**: MongoDB (Mongoose ORM)  
- **Middleware**:  
   - **Morgan**: Logging HTTP requests  
   - **Express-Session**: User authentication and session management  
   - **dotenv**: Environment variable management  

---

