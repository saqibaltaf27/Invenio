const dotenv = require("dotenv");
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser')

const port = process.env.PORT || 5000;

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())


const corsOption = {
    origin: ['http://localhost:3000'],
	methods: ['GET', 'POST', 'DELETE'], 
	credentials: true,
};
app.use(cors(corsOption));
app.use(express.static('public'));

const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const productsRoutes = require('./routes/products.routes');
const customersRoutes = require('./routes/customers.routes');
const suppliersRoutes = require('./routes/suppliers.routes');
const ordersRoutes = require('./routes/orders.routes');
const expensesRoutes = require('./routes/expenses.routes');

app.get('/', (req, res) => {
	res.send('API is working!');
  });

app.use('/api', userRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', productsRoutes);
app.use('/api', customersRoutes);
app.use('/api', suppliersRoutes);
app.use('/api', ordersRoutes);
app.use('/api', expensesRoutes);

app.listen(port, () => {
	console.log(`App listening on port ${port}!`)
})
