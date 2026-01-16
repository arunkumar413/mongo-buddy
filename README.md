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
