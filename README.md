# MongoDB Studio

A modern, developer-friendly MongoDB GUI built with React, Tailwind CSS, and Node.js.

## Features
- **Query Editor**: Monaco-based editor with rich autocomplete for MongoDB operators and field names.
- **Results Viewer**: JSON and Table views for query results.
- **Query History**: Persisted history of your executed queries.
- **Dark/Light Mode**: sleek themes for any time of day.
- **Local Backend**: Secure connection handling via a local Express server.

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or a connection string)

## Installation

1.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies**:
    ```bash
    cd server && npm install && cd ..
    ```

## Configuration

The application requires a `.env` file in the `server` directory to manage authentication and database connections.

1.  Create a file named `.env` in the `server` directory.
2.  Add the following variables:

    ```env
    PORT=3001
    
    # Authentication
    AUTH_PASSWORD=your_secure_password
    JWT_SECRET=your_jwt_secret_key

    # Database Connections (Format: DB_URI_<ENV_NAME>)
    DB_URI_LOCAL=mongodb://localhost:27017
    DB_URI_DEV=mongodb://dev-server:27017/dev_db
    DB_URI_PROD=mongodb://prod-server:27017/prod_db
    ```

- **AUTH_PASSWORD**: The password required to log in to the application.
- **JWT_SECRET**: A secret key used to sign JSON Web Tokens.
- **DB_URI_***: Connection strings for different environments. The app will automatically detect variables starting with `DB_URI_` and display them in the environment dropdown.

## Running the Project

The easiest way to run the project is to start both the frontend and backend with a single command:

```bash
npm run dev:all
```

This will start:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001

### Alternative (Separate Terminals)

If you prefer running them separately:

1.  **Backend**:
    ```bash
    npm run dev:server
    ```

2.  **Frontend**:
    ```bash
    npm run dev
    ```

## Usage

1.  Open the frontend in your browser.
2.  Click **Connect** in the top right (or the dialog on start).
3.  Enter your MongoDB connection string (default: `mongodb://localhost:27017`).
4.  Select a database and collection from the sidebar.
5.  Start querying!

    ```javascript
    db.users.find({})
    ```
