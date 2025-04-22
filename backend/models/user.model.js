//const db = require('../db/conn.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");
const uniqid = require("uniqid")
const fs = require("fs")
const path = require('path');
const {sql, poolPromise} = require('../db/conn.js');
const saltRounds = 10;

class User {
	constructor() {
	}

	async login (req, res) {
		console.log('Login Module Start');
		const {email, password} = req.body;
		try {
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
					const accessToken = jwt.sign(
						{
							email: email,
							role: "admin",
						},
						'cfc3042fc6631c2106f65dfb810a9ecb5a91f1fa4d385a5c16a7796fe8bb5a5e',
						{ expiresIn: '1h' }
					);

					res.cookie('accessToken', accessToken, {
						httpOnly: true,
						maxAge: 60 * 60 * 1000,
						sameSite: 'none',
						secure: true,
					});

					return res.status(200).json({ operation: 'success', message: 'Login successful' });
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
		res.cookie("accessToken", "", { maxAge: 1, sameSite: 'none', secure: true });
		res.send({ operation: "success", message: 'Logout successfully'});
	  };

	refreshToken = async (req, res) => {
		try {
			let prevToken = req.cookies.accessToken;
			let d = jwt.decode(prevToken, { complete: true });

			let newToken = jwt.sign(
				{
					email: d.payload.email,
					role: d.payload.role
				},
				'cfc3042fc6631c2106f65dfb810a9ecb5a91f1fa4d385a5c16a7796fe8bb5a5e',
				{ expiresIn: '1h' }
			);
			res.cookie('accessToken', newToken, { httpOnly: true, sameSite: 'none', secure: true }); 
			res.send({ operation: "success", message: 'Token refreshed' });
		} catch (error) {
			console.log(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	}

	verifyToken = async (req, res) => {
		let temptoken = req.cookies.accessToken;
		
		jwt.verify(temptoken, 'cfc3042fc6631c2106f65dfb810a9ecb5a91f1fa4d385a5c16a7796fe8bb5a5e', (err, payload) => {
			if (err) {
				res.send({ operation: "error", message: 'Token expired' });
				console.log("jwt token failed from api");
			}
			console.log("token verfied from api")
			res.json({ operation: "success", message: 'Token verified' });
		})
	}

	getPermission = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;

			new Promise((resolve, reject) => {
				let q = "SELECT permissions FROM [user] WHERE email=? AND user_role=?"
				db.query(q, [email, role], (err, result) => {
					if (err) {
						reject(err);
						return;
					}

					if (result.length == 1) {
						console.log(result[0]);
						resolve({ operation: "success", message: '', info: result[0].permissions });
					} else {
						reject({ operation: "error", message: 'Invalid user' });
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

	getEmployees = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;

			new Promise((resolve, reject) => {

				let tsa = ""
				if (req.body.search_value != "") {
					tsa = `AND user_name LIKE "%${req.body.search_value}%" OR address LIKE "%${req.body.search_value}%" OR address LIKE "%${req.body.search_value}%"`
				}

				let tso = ""
				if ((req.body.sort_column != "") && (req.body.sort_order != "")) {
					tso = `ORDER BY ${req.body.sort_column} ${req.body.sort_order}`
				}

				let q = "SELECT user_id, user_name, address, email, permissions, timeStamp FROM [user] WHERE user_role != 'admin' " + tsa + tso + " LIMIT ?, 10"
				db.query(q, [req.body.start_value], (err, result) => {
					if (err) {
						return reject(err);
					}

					if (req.body.search_value != "") {
						return resolve({ operation: "success", message: 'search employees got', info: { employees: result, count: result.length } });
					}

					let q = "SELECT COUNT(*) AS val FROM [user] WHERE user_role != 'admin'"
					db.query(q, (err, result2) => {
						if (err) {
							return reject(err);
						}
						// console.log(result2)
						resolve({ operation: "success", message: '10 employees got', info: { employees: result, count: result2[0].val } });
					})
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

	addEmployee = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;

			new Promise((resolve, reject) => {
				let q1 = "SELECT * FROM [user] WHERE email = ?"
				db.query(q1, [req.body.email], (err1, result1) => {
					if (err1) {
						return reject(err1);
					}

					if (result1.length > 0) {
						resolve({ operation: "error", message: 'Duplicate user email' });
					}
					else {
						let q2 = "SELECT user_role_permissions, user_role_name FROM user_roles WHERE user_role_name = 'employee'"
						db.query(q2, (err2, result2) => {
							if (err2) {
								return reject(err2);
							}

							let q3 = "INSERT INTO [user] (`user_id`, `user_name`, `address`, `email`, `password`, `permissions`, `user_role`) VALUES (?, ?, ?, ?, ?, ?, ?)"
							db.query(q3, [uniqid(), req.body.name, req.body.address, req.body.email, req.body.password, result2[0].user_role_permissions, result2[0].user_role_name], (err3, result3) => {
								if (err3) {
									return reject(err3);
								}
								resolve({ operation: "success", message: 'Employee added successfully' });
							})
						})
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

	deleteEmployee = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;

			new Promise((resolve, reject) => {
				let q = "DELETE FROM [user] WHERE user_id = ?"
				db.query(q, [req.body.employee_id], (err, result) => {
					if (err) {
						return reject(err);
					}
					resolve({ operation: "success", message: 'employee deleted successfully' });
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

	updateEmployee = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;
	
			new Promise((resolve, reject) => {
				let q1 = "SELECT * FROM [user] WHERE email = ?";
				db.query(q1, [req.body.email], (err1, result1) => {
					if (err1) {
						return reject(err1);
					}
	
					if ((result1.length > 0) && (result1[0].user_id != req.body.user_id)) {
						resolve({ operation: "error", message: 'Duplicate user email' });
					} else {
						let q2 = "UPDATE [user] SET user_name=?, address=?, email=? WHERE user_id=?";
						db.query(q2, [req.body.name, req.body.address, req.body.email, req.body.user_id], (err2, result2) => {
							if (err2) {
								return reject(err2);
							}
							resolve({ operation: "success", message: 'Employee updated successfully' });
						});
					}
				});
			})
			.then((value) => {
				res.send(value);
			})
			.catch((err) => {
				console.log(err);
				res.send({ operation: "error", message: 'Something went wrong' });
			});
		} catch (error) {
			console.log(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	}
	

	getProfile = async (req, res) => {
		try {
			let d = jwt.decode(req.cookies.accessToken, { complete: true });
			let email = d.payload.email;
			let role = d.payload.role;

			new Promise((resolve, reject) => {
				let q = "SELECT user_id, user_name, address, email, image FROM [user] WHERE email = ?"
				db.query(q, [email], (err, result) => {
					if (err) {
						return reject(err);
					}

					resolve({ operation: "success", message: 'Employee profile got successfully', info: { profile: result } });
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
module.exports = User;
