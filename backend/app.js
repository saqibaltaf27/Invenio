const dotenv = require("dotenv");
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const port = process.env.PORT || 5000;

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())


const corsOption = {
    origin: ['https://invenio-three.vercel.app',
  			'https://invenio-git-main-saqib27.vercel.app',
  			'https://invenio-bfd5swfbb-saqib27.vercel.app',
			'http://localhost:3000'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true,
};
app.use(cors(corsOption));
app.use(session({
	secret: 'cfc3042fc6631c2106f65d',
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false,  httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
  }));
  
app.use(express.static('public'));

const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const productsRoutes = require('./routes/products.routes');
const customersRoutes = require('./routes/customers.routes');
const suppliersRoutes = require('./routes/suppliers.routes');
const ordersRoutes = require('./routes/orders.routes');
const GRRoutes = require('./routes/gr.routes');
const ChartRoutes = require('./routes/chart.routes');
const StockOutRoute = require('./routes/stockOut.routes');
const StockReportRoute = require('./routes/StockReport.routes');
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
app.use('/api', GRRoutes);
app.use('/api', ChartRoutes);
app.use('/api', StockOutRoute);
app.use('/api', StockReportRoute);
app.use('/api', expensesRoutes);

app.listen(port, () => {
	console.log(`App listening on port ${port}!`)
});
