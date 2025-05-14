# Invenio

## Project Overview

This Inventory Management System is a comprehensive and extensible software solution designed to function as a core platform for enterprise resource planning (ERP). It helps organizations efficiently manage their product stock, customers, suppliers, and orders. The system also provides valuable insights through robust statistics and reports, enabling data-driven decision-making. It caters to both the organization-wide perspective and the needs of individual employees within the organization. This system includes Goods Receive and Goods Out functionalities, and is built with future expansion in mind.

## Key Features

* **Multi-Organization System:** The system is designed to be scalable and adaptable to the needs of multiple organizations, allowing for centralized management of inventory across different business entities (if needed).
* **Robust Authentication:** Implements a strong authentication system to secure access to sensitive data and system functionalities. This includes user login, session management, and potentially role-based access control.
* **Business Intelligence:** Provides statistical reports and data visualizations to support business decision-making. These reports may include:
    * Inventory levels and stock valuation
    * Sales trends and customer behavior analysis
    * Supplier performance metrics
    * Expense tracking and profitability analysis
* **User-Friendly Interface:** Offers a pleasant and intuitive user interface (UI) to enhance user experience and minimize the learning curve.
* **Mobile Responsiveness:** The application is designed to be fully mobile-responsive, ensuring accessibility and usability across various devices (desktops, tablets, and smartphones).
* **Core Modules:**
    * <img src="https://unpkg.com/lucide-static@latest/icons/users.svg" width="16" height="16" style="vertical-align: middle;"> **Customer Management:** Maintain a database of customers, including their contact information, addresses, and purchase history.
    * <img src="https://unpkg.com/lucide-static@latest/icons/truck.svg" width="16" height="16" style="vertical-align: middle;"> **Supplier Management:** Track supplier information, including contact details, addresses, and performance.
    * <img src="https://unpkg.com/lucide-static@latest/icons/shopping-cart.svg" width="16" height="16" style="vertical-align: middle;"> **Order Management:** Create, track, and manage customer orders, including order details, due dates, and order status.
    * <img src="https://unpkg.com/lucide-static@latest/icons/tag.svg" width="16" height="16" style="vertical-align: middle;"> **Expense Management:** Record and track business-related expenses, categorize them, and generate expense reports.
    * <img src="https://unpkg.com/lucide-static@latest/icons/boxes.svg" width="16" height="16" style="vertical-align: middle;"> **Product Management:**
        * Maintain a catalog of products, including details such as name, description, category, size, material, and images.
        * Track product stock levels, manage inventory, and receive low-stock alerts.
        * Manage product pricing (both selling and purchase prices).
    * <img src="https://unpkg.com/lucide-static@latest/icons/arrow-down-circle.svg" width="16" height="16" style="vertical-align: middle;"> **Goods Receive:** Manage the process of receiving goods from suppliers, including recording received quantities, supplier information, and delivery dates.
    * <img src="https://unpkg.com/lucide-static@latest/icons/arrow-up-circle.svg" width="16" height="16" style="vertical-align: middle;"> **Goods Out:** Manage the process of goods leaving the inventory, including recording quantities, destination, and purpose of the goods issue.
* **User Roles and Permissions:** Implement a system of user roles and permissions to control access to different parts of the application based on user responsibilities.
* **Extensibility:** The system is designed to be extensible, allowing for the addition of new modules and functionalities. Potential future modules include:
    * <img src="https://unpkg.com/lucide-static@latest/icons/briefcase.svg" width="16" height="16" style="vertical-align: middle;"> Payroll Management
    * <img src="https://unpkg.com/lucide-static@latest/icons/users-2.svg" width="16" height="16" style="vertical-align: middle;"> Human Resources Management
    * <img src="https://unpkg.com/lucide-static@latest/icons/banknote.svg" width="16" height="16" style="vertical-align: middle;"> Financial Accounting
    * <img src="https://unpkg.com/lucide-static@latest/icons/activity.svg" width="16" height="16" style="vertical-align: middle;"> Advanced Data Reporting and Analytics
    * <img src="https://unpkg.com/lucide-static@latest/icons/heart.svg" width="16" height="16" style="vertical-align: middle;"> Customer Relationship Management (CRM)
    * <img src="https://unpkg.com/lucide-static@latest/icons/factory.svg" width="16" height="16" style="vertical-align: middle;"> Manufacturing Resource Planning (MRP)

## Tech Stack

The Inventory Management System is built using a combination of modern web technologies, chosen for their scalability and maintainability, supporting an ERP-like architecture:

* **Frontend:**
    * ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
    * ![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
    * ![Recharts](https://img.shields.io/badge/Recharts-1C8E78?style=for-the-badge&logo=recharts&logoColor=white)
* **Backend:**
    * ![Node.js](https://img.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
    * ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
* **Database:**
    * ![SQL Server](https://img.shields.io/badge/SQLServer-CC290B?style=for-the-badge&logo=sqlserver&logoColor=white)
* **Authentication:**
    * ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20Web%20tokens&logoColor=white)
* **Deployment:**
    * ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
    * ![Railway](https://img.shields.io/badge/Railway-111827?style=for-the-badge&logo=railway&logoColor=white)

## System Architecture (Conceptual)

The system follows a modular, multi-tiered architecture, typical of ERP systems:

1.  **Presentation Tier (Frontend):** The React-based UI, enhanced with Recharts for data visualization. Users interact with this tier, which sends requests to the backend API and displays data. This tier is designed for a rich and interactive user experience.
2.  **Application Tier (Backend):** The Node.js/Express.js application server handles business logic, processes requests from the frontend, interacts with the SQL Server database, and enforces security. This tier is structured to support the core modules and future extensions of the ERP.
3.  **Data Tier:** The SQL Server database stores all application data, designed for efficient data retrieval and management required by an ERP system.

## Installation and Setup

To set up the Inventory Management System, follow these steps:

### Prerequisites

Ensure that the following software is installed on your system:

* <img src="https://unpkg.com/lucide-static@latest/icons/code.svg" width="16" height="16" style="vertical-align: middle;"> [VS Code](https://code.visualstudio.com/download)
* <img src="https://unpkg.com/lucide-static@latest/icons/terminal.svg" width="16" height="16" style="vertical-align: middle;"> [Node.js](https://nodejs.org/)
* <img src="https://unpkg.com/lucide-static@latest/icons/database.svg" width="16" height="16" style="vertical-align: middle;"> [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
* <img src="https://unpkg.com/lucide-static@latest/icons/git-branch.svg" width="16" height="16" style="vertical-align: middle;"> [Git](https://git-scm.com/downloads)

### Database Setup

1.  **Create Database:** Open SQL Server Management Studio (SSMS) and connect to your SQL Server instance.
2.  Create a new database named `inventory`.
3.  **Create Tables:** Execute the following SQL script in a new query window to create the necessary tables:

    ```sql
    CREATE TABLE customers (
      customer_id VARCHAR(255) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE expenses (
      expense_id VARCHAR(255) NOT NULL PRIMARY KEY,
      expense_ref VARCHAR(255) NOT NULL,
      supplier_id VARCHAR(255) NOT NULL,
      due_date DATE NOT NULL,
      items NVARCHAR(MAX) NOT NULL, -- Use NVARCHAR(MAX) for JSON data in SQL Server
      tax FLOAT DEFAULT NULL,
      grand_total FLOAT NOT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE goods_receives (
      gr_id VARCHAR(255) NOT NULL PRIMARY KEY,
      gr_ref VARCHAR(255) NOT NULL,
      supplier_id VARCHAR(255) NOT NULL,
      gr_date DATE NOT NULL,
      invoice_number VARCHAR(255),
      items NVARCHAR(MAX) NOT NULL,  -- Use NVARCHAR(MAX) for JSON
      notes TEXT,
      total_amount FLOAT NOT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE goods_receive_items (
      id INT IDENTITY(1,1) PRIMARY KEY,
      gr_id VARCHAR(255) NOT NULL,
      product_id VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      purchase_price FLOAT NOT NULL,
      FOREIGN KEY (gr_id) REFERENCES goods_receives(gr_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    CREATE TABLE goods_out (
      go_id VARCHAR(255) NOT NULL PRIMARY KEY,
      go_ref VARCHAR(255) NOT NULL,
      receiver_name VARCHAR(255) NOT NULL,
      go_date DATE NOT NULL,
      items NVARCHAR(MAX) NOT NULL, -- Use NVARCHAR(MAX) for JSON
      notes TEXT,
      total_amount FLOAT NOT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE goods_out_items (
      id INT IDENTITY(1,1) PRIMARY KEY,
      go_id VARCHAR(255) NOT NULL,
      product_id VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      selling_price FLOAT NOT NULL,
      FOREIGN KEY (go_id) REFERENCES goods_out(go_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    CREATE TABLE orders (
      order_id VARCHAR(255) NOT NULL PRIMARY KEY,
      order_ref VARCHAR(255) NOT NULL,
      customer_id VARCHAR(255) NOT NULL,
      due_date DATE NOT NULL,
      items NVARCHAR(MAX) NOT NULL, -- Use NVARCHAR(MAX) for JSON
      tax FLOAT DEFAULT NULL,
      grand_total FLOAT NOT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE products (
      product_id VARCHAR(255) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      unit VARCHAR(255) DEFAULT NULL,
      gender VARCHAR(255) NOT NULL,
      size VARCHAR(255) DEFAULT NULL,
      material VARCHAR(255) DEFAULT NULL,
      category VARCHAR(255) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      product_stock INT NOT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE(),
      image NVARCHAR(MAX) DEFAULT NULL,
      selling_price FLOAT NOT NULL,
      purchase_price FLOAT NOT NULL
    );

    CREATE TABLE suppliers (
      supplier_id VARCHAR(255) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE users (
      user_id VARCHAR(255) NOT NULL PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      address VARCHAR(255) DEFAULT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      permissions TEXT NOT NULL,
      user_role VARCHAR(255) NOT NULL,
      image NVARCHAR(MAX) DEFAULT NULL,
      timeStamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE user_roles (
      user_role_id VARCHAR(255) NOT NULL PRIMARY KEY,
      user_role_name VARCHAR(255) NOT NULL,
      user_role_permissions TEXT NOT NULL
    );

    INSERT INTO user_roles (user_role_id, user_role_name, user_role_permissions) VALUES
    ('123232', 'admin', '[
      { \"page\": \"dashboard\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"employees\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"products\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"suppliers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"expenses\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"customers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"orders\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"profile\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"settings\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"goods_receives\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"goods_out\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true }
    ]'),
    ('341242', 'employee', '[
      { \"page\": \"dashboard\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"employees\", \"view\": false, \"create\": false, \"edit\": false, \"delete\": false },
      { \"page\": \"products\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"suppliers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"expenses\", \"view\": true, \"create\": false, \"edit\": false, \"delete\": false },
      { \"page\": \"customers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"orders\", \"view\": true, \"create\": false, \"edit\": false, \"delete\": false },
      { \"page\": \"profile\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"settings\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"goods_receives\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },
      { \"page\": \"goods_out\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true }
    ]');
    ```

4.  **Clone Repository:** Clone the project repository from GitHub to your local machine using Git:

    ```
    git clone <repository_url>
    ```

5.  **Install Dependencies:** Navigate to the project directory in your terminal and install the required Node.js packages using npm:

    ```
    npm install
    ```

6.  **Configuration:**

    * Create a `.env` file in the project root directory.
    * Copy the contents of `.env.example` to `.env` and modify the values to match your environment, especially the database connection details for SQL Server. You'll need to provide the connection string.

7.  **Run the Application:**

    * For the backend, deploy to Railway:
        * Follow the instructions on [Railway's documentation](https://docs.railway.app/) to deploy your Node.js/Express.js application. Make sure to configure the environment variables on Railway to match your SQL Server connection string.
    * For the frontend, deploy to Vercel:
        * Follow the instructions on [Vercel's documentation](https://vercel.com/docs) to deploy your React application.

8.  **Access the Application:**

    * Once the frontend and backend are deployed, you can access the application through the URL provided by Vercel.

## Deployment

The application is deployed to the following platforms:

* **Frontend:** Vercel
    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Vercel_logo.svg" width="20" style="vertical-align: middle;">
* **Backend:** Railway
    <img src="https://avatars.githubusercontent.com/u/57484289?s=200&v=4" width="20" style="vertical-align: middle;">

## Version Control

* <img src="https://unpkg.com/lucide-static@latest/icons/github.svg" width="16" height="16" style="vertical-align: middle;"> **GitHub:** The project's source code is hosted on GitHub, enabling version control, collaboration, and issue tracking. You can find the repository here: [GitHub Repository Link](https://github.com/saqibaltaf27/Invenio)

## Contribution

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Push your changes to your fork.
5.  Submit a pull request.

## License

MIT LicenseCopyright (c) 2025 Muhammad Saqib Altaf Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the "Software"), to dealin the Software without restriction, including without limitation the rightsto use, copy, modify, merge, publish, distribute, sublicense, and/or sellcopies of the Software, and to permit persons to whom the Software isfurnished to do so, subject to the following conditions:The above copyright notice and this permission notice shall be included in allcopies or substantial portions of the Software.THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS ORIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THEAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHERLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THESOFTWARE.
## Thank you!

Thank you for using the Invenio! I hope it helps you streamline your processes.
