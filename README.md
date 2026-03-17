# Getting Started with Job Application Tracker

A Next.js application for managing job applications efficiently, built with SQLite Cloud for persistent storage and Zod for schema validation.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [pnpm](https://pnpm.io/) (used in this project, though npm or yarn can also work)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/W0509891/next-js
    cd next-js
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

## Environment Configuration

Create an account at [SQLite Cloud](https://sqlitecloud.io/)

Once you have an account, you can find your connection string at the bottom left of the page.

Create a `.env` file in the root directory (you can use `.env.example` if available as a template) and add your SQLite Cloud connection strings:

```env
SQLITECLOUD_URL=your_sqlite_cloud_connection_string
```

> **Note:** Ensure you replace the placeholder values with your actual SQLite Cloud credentials.

## Running the Application

### Development Mode

To start the development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Production Mode

To build and start the application for production:

1.  **Build the project:**
    ```bash
    pnpm build
    ```

2.  **Start the production server:**
    ```bash
    pnpm start
    ```

## Features

- **Dashboard:** Overview of your application status.
- **Job Management:** Create, Read, Update, and Delete (CRUD) job applications.
- **API Integration:** Backend routes for handling job data at `/api/jobs`.
- **Validation:** Robust data validation using Zod schemas.
- **Styling:** Modern UI built with Tailwind CSS.

## Project Structure

- `src/app`: Next.js App Router components and pages.
- `src/components`: Reusable UI components like `Navbar` and `Form`.
- `src/schemas`: Zod schemas for data validation.
- `src/app/lib`: Database initialization and connection logic.
