<h1> Inventory Management System </h1>

<div align="center">

<a href="">[![GitHub issues](https://img.shields.io/github/issues/saqibaltaf27/IMS)](https://github.com/saqibaltaf27/IMS/issues)
<a href="">[![GitHub forks](https://img.shields.io/github/forks/saqibaltaf27/IMS)](https://github.com/saqibaltaf27/IMS/network)
<a href="">[![GitHub forks](https://img.shields.io/github/stars/saqibaltaf27/IMS)](https://github.com/saqibaltaf27/IMS/stargazers)
<a href="">[![GitHub forks](https://img.shields.io/github/license/saqibaltaf27/IMS)](https://github.com/saqibaltaf27/IMS)

</div>

<h2> ⭐Project Info </h2>
It is a software where an organization can manage their product stock, customers, suppliers, orders and view different statistics of the inventory. Also an individual employee of that organization can work here for the organization.
<br></br>

<h2> 💡 Features </h2>

- *Multiorganization system*
- *Strong authentication*
- *Shows statistics for business requirements* 
- *Plesant UI & Mobile responsive*

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

<h2>📝 How to Contribute? </h2>

<table>
  <tr>
    <td valign="top"><img src="https://github.com/Rajdip789/Inventory-management-system/blob/main/frontend/public/images/showcase1.png" alter="Landing Page"/></td>
    <td valign="top"><img src="https://github.com/Rajdip789/Inventory-management-system/blob/main/frontend/public/images/showcase2.png" alter="Landing Page"/></td>
  </tr>
</table>



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
