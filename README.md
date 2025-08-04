# Todo Application API

This repository contains two backend APIs for a Todo application, built with different technology stacks:

* **ASP.NET Core API** (C# / EF Core / MySQL)
* **Node.js API** (Express / TypeScript / MySQL)

This project is a great example for developers looking to compare and contrast backend development using these popular frameworks.

---

## Features

* **User Authentication:** Secure user registration and login with **JWT authentication**.
* **Todo Management:** Full CRUD (Create, Read, Update, Delete) functionality for managing todos.
* **User-Specific Todos:** Each todo is associated with a specific user, ensuring data separation.
* **Secure Endpoints:** All todo-related endpoints are protected with authorization checks.
* **Database Management:**
    * The **ASP.NET** version uses **EF Core migrations** for database management.
    * The **Node.js** version uses **TypeORM** or **Sequelize** for its Object-Relational Mapping (ORM).

---

## Prerequisites

To run these APIs, you will need the following installed on your machine:

* **MySQL Server** (local or remote)
* **.NET 8 SDK** (for the ASP.NET Core API)
* **Node.js** (v18+) (for the Node.js API)
* **Postman** or any API testing tool (optional but recommended)

---

## Setup Instructions

### ASP.NET Core API Setup

1.  Clone this repository:
    ```bash
    git clone [https://github.com/yourusername/todo-app.git](https://github.com/yourusername/todo-app.git)
    cd todo-app/ASP
    ```

2.  Configure your **MySQL connection string** in `appsettings.json`:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "server=localhost;port=3306;database=todo_asp;user=root;password=yourpassword;"
    }
    ```

3.  Install **EF Core tools** if you haven't already:
    ```bash
    dotnet tool install --global dotnet-ef
    ```

4.  Apply the database migrations:
    ```bash
    dotnet ef database update
    ```

5.  Run the application:
    ```bash
    dotnet run
    ```
    The API will be available at `https://localhost:5001` or `http://localhost:5000`.

### Node.js API Setup

1.  Navigate to the Node.js folder:
    ```bash
    cd ../NodeAPI
    ```

2.  Install the project dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the root of the `NodeAPI` directory and add your MySQL connection details and a JWT secret:
    ```ini
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=todo_node
    JWT_SECRET=your_jwt_secret
    ```

4.  Run database migrations (using TypeORM or Sequelize CLI):
    ```bash
    npm run migrate
    ```

5.  Start the development server:
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3000`.

---

## API Endpoints

The following endpoints are available in both APIs.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user | No |
| **POST** | `/api/auth/login` | Log in and get a JWT token | No |
| **GET** | `/api/todos` | Get a list of todos for the authenticated user | Yes |
| **POST** | `/api/todos` | Create a new todo | Yes |
| **GET** | `/api/todos/{id}` | Get a specific todo by its ID | Yes |
| **PUT** | `/api/todos/{id}` | Update a specific todo by its ID | Yes |
| **DELETE** | `/api/todos/{id}` | Delete a specific todo by its ID | Yes |

### Notes
* All `/todos` endpoints require a JWT token in the `Authorization` header. The header should be formatted as follows: `Authorization: Bearer <token>`.
* Replace `{id}` with the numeric ID of the specific todo you want to interact with.

---

## License

This project is licensed under the **MIT License**.
