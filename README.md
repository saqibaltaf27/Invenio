<h1> Invenio </h1>

<h2> ⭐Project Overview </h2>
It is a comprehensive and extensible software solution designed to function as a core platform for enterprise resource planning (ERP).  It helps organizations efficiently manage their product stock, customers, suppliers, and orders. The system also provides valuable insights through robust statistics and reports, enabling data-driven decision-making.  It caters to both the organization-wide perspective and the needs of individual employees within the organization. This system includes Goods Receive and Goods Out functionalities, and is built with future expansion in mind.
<br></br>

<h2> 💡Key Features </h2>

- *Multi-Organization System: *The system is designed to be scalable and adaptable to the needs of multiple organizations, allowing for centralized management of inventory across different business entities.
- *Robust Authentication:* Implements a strong authentication system to secure access to sensitive data and system functionalities. This includes user login, session management, and potentially role-based access control.
- *Business Intelligence:*  Provides statistical reports and data visualizations to support business decision-making. These reports may include:
    * Inventory levels and stock valuation
    * Sales trends and customer behavior analysis
    * Supplier performance metrics
    * Expense tracking and profitability analysis

- *User-Friendly Interface:* Offers a pleasant and intuitive user interface (UI) to enhance user experience and minimize the learning curve.
- *Mobile Responsiveness:* The application is designed to be fully mobile-responsive, ensuring accessibility and usability across various devices (desktops, tablets, and smartphones).
- *Plesant UI & Mobile responsive*
- *Plesant UI & Mobile responsive*

* **Core Modules:**
    * **Customer Management:** Maintain a database of customers, including their contact information, addresses, and purchase history.
    * **Supplier Management:** Track supplier information, including contact details, addresses, and performance.
    * **Order Management:** Create, track, and manage customer orders, including order details, due dates, and order status.
    * **Expense Management:** Record and track business-related expenses, categorize them, and generate expense reports.
    * **Product Management:**
        * Maintain a catalog of products, including details such as name, description, category, size, material, and images.
        * Track product stock levels, manage inventory, and receive low-stock alerts.
        * Manage product pricing (both selling and purchase prices).
    * **Goods Receive:** Manage the process of receiving goods from suppliers, including recording received quantities, supplier information, and delivery dates.
    * **Goods Out:** Manage the process of goods leaving the inventory, including recording quantities, destination, and purpose of the goods issue.
* **User Roles and Permissions:** Implement a system of user roles and permissions to control access to different parts of the application based on user responsibilities.
* **Extensibility:** The system is designed to be extensible, allowing for the addition of new modules and functionalities. Potential future modules include:
    * Payroll Management
    * Human Resources Management
    * Financial Accounting
    * Advanced Data Reporting and Analytics
    * Customer Relationship Management (CRM)
    * Manufacturing Resource Planning (MRP)

<h2> 🌐 Tech Stack </h2>

<div align="left">
  
![REACT](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![SASS](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![EXPRESS](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MYSQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![](https://img.shields.io/badge/Xampp-F37623?style=for-the-badge&logo=xampp&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
  
</div>

Installation: Please follow the below links to download/install the software.

- [VS Code](https://code.visualstudio.com/download)
- [Node JS](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/download.html)

Setup Database : Create a new database `inventory`. Then execute the below script to create tables.

```bash
CREATE TABLE `customers` (
  `customer_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `expenses` (
  `expense_id` varchar(255) NOT NULL,
  `expense_ref` varchar(255) NOT NULL,
  `supplier_id` varchar(255) NOT NULL,
  `due_date` date NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `tax` float DEFAULT NULL,
  `grand_total` float NOT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `orders` (
  `order_id` varchar(255) NOT NULL,
  `order_ref` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `due_date` date NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `tax` float DEFAULT NULL,
  `grand_total` float NOT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `products` (
  `product_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `size` varchar(255) DEFAULT NULL,
  `material` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `product_stock` int(11) NOT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `selling_price` float NOT NULL,
  `purchase_price` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `suppliers` (
  `supplier_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user` (
  `user_id` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `permissions` text NOT NULL,
  `user_role` varchar(255) NOT NULL,
  `image` longtext DEFAULT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_roles` (
  `user_role_id` varchar(255) NOT NULL,
  `user_role_name` varchar(255) NOT NULL,
  `user_role_permissions` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `user_roles` (`user_role_id`, `user_role_name`, `user_role_permissions`) VALUES
('123232', 'admin', '[\n  { \"page\": \"dashboard\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"employees\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"products\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"suppliers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"expenses\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"customers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"orders\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"profile\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"settings\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true }\n]'),
('341242', 'employee', '[\n  { \"page\": \"dashboard\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"employees\", \"view\": false, \"create\": false, \"edit\": false, \"delete\": false },\n  { \"page\": \"products\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"suppliers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"expenses\", \"view\": true, \"create\": false, \"edit\": false, \"delete\": false },\n  { \"page\": \"customers\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"orders\", \"view\": true, \"create\": false, \"edit\": false, \"delete\": false },\n  { \"page\": \"profile\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true },\n  { \"page\": \"settings\", \"view\": true, \"create\": true, \"edit\": true, \"delete\": true }\n]');

ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`);
--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`expense_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_role_id`);
```
Install dependencies

```bash
npm install
```
Make all the necessary changes to the project and follow the given commands.

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "Add a message"
```
Push the changes to github.

```bash
git push origin -u your-branch-name
```

<h2 align="center"> Thank you 😊 </h2>
