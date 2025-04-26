const uniqid = require("uniqid");

const fs = require("fs");
const path = require('path');
const {sql, poolPromise} = require('../db/conn');


class User {
	constructor() {
    }

	async login (req, res) {
		console.log('Login Module Start');
		const {email, password} = req.body;
		try {
			console.log('Email:', email);
        	console.log('Password:', password);

			const pool = await poolPromise;
			const result = await pool
				.request()
				.input('email', sql.VarChar, email)
				.query('SELECT * FROM [USER] WHERE email = @email');

			console.log("Query Result:", result.recordset);

				if (result.recordset.length === 0) {
					console.log("User not found");
					return res.status(401).json({ operation: 'error', message: 'User not found' });
				  }
				
				const user = result.recordset[0];  
				console.log("User from DB: ", user);
				
			if (password === user.password) {
				req.session.user = {
					user_id: user.user_id,
					user_name: user.user_name,
					email: user.email,
					password: user.password,
					role: user.user_role
				  };
					return res.status(200).json({ message: 'Login successful', user: req.session.user });
				} else {
					return res.status(401).json({ operation: 'error', message: 'Incorrect password' });		
			}
		} 
		catch (error) {
			console.error(error);
			res.status(500).json({ operation: 'error', message: 'Something went wrong' });
		}
	};

	logout = async (req, res) => {
		req.session.destroy(err => {
			if (err) {
				console.error("Logout error:", err);
				return res.status(500).json({ operation: "error", message: 'Logout failed' });
			}
			res.clearCookie('connect.sid'); 
			return res.status(200).json({ operation: "success", message: 'Logged out successfully' });
		});
	};

	getEmployees = async (req, res) => {
		const { search_value = '', sort_column = 'admin', sort_order = 'ASC', start_value = 0 } = req.body;
	
		try {
			const pool = await poolPromise;
			const request = pool.request();
	
			let query = `
				SELECT user_id, user_name, address, email, permissions, timeStamp
				FROM [user]
				WHERE user_role != 'admin'
			`;
	
			if (search_value) {
				query += ` AND (user_name LIKE @search OR address LIKE @search)`;
				request.input('search', sql.VarChar, `%${search_value}%`);
			}
	
			const allowedColumns = ['user_name', 'address', 'email', 'timeStamp'];
			const allowedOrders = ['ASC', 'DESC'];
			if (allowedColumns.includes(sort_column) && allowedOrders.includes(sort_order.toUpperCase())) {
				query += ` ORDER BY ${sort_column} ${sort_order.toUpperCase()}`;
			} else {
				query += ` ORDER BY user_name ASC`; 
			}
	
			query += ` OFFSET @offset ROWS FETCH NEXT 10 ROWS ONLY`;
			request.input('offset', sql.Int, start_value);
	
			// Fetch data
			const employees = await request.query(query);
	
			// Get count (for pagination UI)
			const countResult = await pool.request().query(`
				SELECT COUNT(*) AS val FROM [user] WHERE user_role != 'admin'
			`);
	
			res.status(200).json({
				operation: "success",
				message: search_value ? 'Filtered employees fetched' : 'Employees fetched',
				info: {
					employees: employees.recordset,
					count: countResult.recordset[0].val
				}
			});
		} catch (err) {
			console.error('Error fetching employees:', err);
			res.status(500).json({ operation: "error", message: "Something went wrong", error: err.message });
		}
	};

	addEmployee = async (req, res) => {
		const { name, address, email, password } = req.body;

		try {
			const pool = await poolPromise;

			const duplicateCheck = await pool
				.request()
				.input('email', sql.VarChar, email)
				.query('SELECT * FROM [user] WHERE email = @email');

			if (duplicateCheck.recordset.length > 0) {
				return res.send({ operation: "error", message: 'Duplicate user email' });
			}

			const roleResult = await pool
				.request()
				.query("SELECT user_role_permissions, user_role_name FROM user_roles WHERE user_role_name = 'employee'");

			const { user_role_permissions, user_role_name } = roleResult.recordset[0];

			await pool
				.request()
				.input('user_id', sql.VarChar, uniqid())
				.input('user_name', sql.VarChar, name)
				.input('address', sql.VarChar, address)
				.input('email', sql.VarChar, email)
				.input('password', sql.VarChar, password)
				.input('permissions', sql.VarChar, user_role_permissions)
				.input('user_role', sql.VarChar, user_role_name)
				.query(`INSERT INTO [user] (user_id, user_name, address, email, password, permissions, user_role)
						VALUES (@user_id, @user_name, @address, @email, @password, @permissions, @user_role)`);

			res.send({ operation: "success", message: 'Employee added successfully' });
		} catch (error) {
			console.log(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	};

	deleteEmployee = async (req, res) => {
		const { employee_id } = req.body;

		try {
			const pool = await poolPromise;

			await pool
				.request()
				.input('user_id', sql.VarChar, employee_id)
				.query('DELETE FROM [user] WHERE user_id = @user_id');

			res.send({ operation: "success", message: 'Employee deleted successfully' });
		} catch (error) {
			console.log(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	};

	updateEmployee = async (req, res) => {
		const { user_id, name, address, email } = req.body;

		try {
			const pool = await poolPromise;

			const existing = await pool
				.request()
				.input('email', sql.VarChar, email)
				.query('SELECT * FROM [user] WHERE email = @email');

			if (existing.recordset.length > 0 && existing.recordset[0].user_id !== user_id) {
				return res.send({ operation: "error", message: 'Duplicate user email' });
			}

			await pool
				.request()
				.input('user_name', sql.VarChar, name)
				.input('address', sql.VarChar, address)
				.input('email', sql.VarChar, email)
				.input('user_id', sql.VarChar, user_id)
				.query(`UPDATE [user] SET user_name = @user_name, address = @address, email = @email WHERE user_id = @user_id`);

			res.send({ operation: "success", message: 'Employee updated successfully' });
		} catch (error) {
			console.log(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	};
	
	getProfile = async (req, res) => {
		try {
			const { email } = req.body;
			console.log("Fetching Profile for userId:", email);

			if(!email) { return res.status(400).json({message: 'Email is required '});}

			const pool = await poolPromise;
			const result = await pool.request()
				.input('email', sql.VarChar, email)
				.query('SELECT user_id, user_name, email, user_role FROM [user] WHERE email = @email');
	
			console.log("Profile result:", result.recordset[0]); 
	
			if (result.recordset.length === 0) {
				return res.status(404).send({ operation: "error", message: "User not found" });
			}
	
			return res.status(200).json({ operation: "success", data: result.recordset[0] });
	
		} catch (error) {
			console.error("getProfile - error:", error); // 👈 log full error
			res.status(500).send({ operation: "error", message: "Internal Server Error" });
		}
	}

	updateProfile = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;

			new Promise(async (resolve, reject) => {

				let ts = ""
				if (req.body.image_edited) {
					if (req.file) {
						ts = `,image='${req.body.f_name}'`
					}
					else {
						ts = `,image=null`
					}

					await new Promise((res, rej) => {
						let qs = "SELECT image FROM [user] WHERE email = ?"
						db.query(qs, [email], (erra, resulta) => {
							if (erra) {
								console.log(erra)
								rej();
							}

							if (resulta[0].image != null) {
								fs.unlink(path.resolve("./") + `\\public\\profile_images\\${resulta[0].image}`, (errb) => {
									if (errb) {
										console.log(errb)
										rej()
									}
									res()
								})
							} else {
								res()
							}
						})
					})
				}

				let q = "UPDATE [user] SET user_name=?,address=?" + ts + " WHERE email = ?"
				db.query(q, [req.body.name, req.body.address, email], (err, result) => {
					if (err) {
						return reject(err);
					}
					resolve({ operation: "success", message: 'Profile updated successfully' });
				})
			})
				.then((value) => {
					res.send(value);
				})
				.catch((err) => {
					console.log(err);
					res.send({ operation: "error", message: 'Something went wrong' });
				})
		} catch (error) {
			console.log(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	}

	updateProfilePassword = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;

			new Promise(async (resolve, reject) => {
				let q = "SELECT password FROM [user] WHERE email=?"
				db.query(q, [email], (err, result) => {
					if (err) {
						reject(err);
						return;
					}

					let d_password = CryptoJS.AES.decrypt(result[0].password, process.env.CRYPTOJS_SEED).toString(CryptoJS.enc.Utf8);
					let t_password = CryptoJS.AES.decrypt(req.body.old_password, process.env.CRYPTOJS_SEED).toString(CryptoJS.enc.Utf8);
					console.log(d_password, t_password)
					if (d_password == t_password) {
						console.log("here", email)
						let q = "UPDATE [user] SET password=? WHERE email = ?"
						db.query(q, [req.body.new_password, email], (erra, result) => {
							if (erra) {
								return reject(erra);
							}
							resolve({ operation: "success", message: 'Profile password updated successfully' });
						})
					} else {
						reject({ operation: "error", message: 'Old password wrong' });
					}
				})
			})
				.then((value) => {
					res.send(value);
				})
				.catch((err) => {
					console.log(err);
					res.send({ operation: "error", message: 'Something went wrong' });
				})
		} catch (error) {
			console.log(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	}

}
module.exports =  User;
