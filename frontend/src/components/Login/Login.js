import React, { useEffect, useState } from 'react';
import './Login.scss';

import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import swal from 'sweetalert';
import { Link, useNavigate } from 'react-router-dom';
import { EmailOutlined, SecurityOutlined } from "@mui/icons-material";

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitButtonState, setSubmitButtonState] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {}, [])

	const login = async () => {
		if (email === "") {
			swal("Oops!", "Email can't be empty", "error")
			return;
		}
		let regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-z]+)$/;
		if (!regex.test(email)) {
			swal("Oops!", "Please enter valid email", "error")
			return;
		}

		if (password === "") {
			swal("Oops!", "Password can't be empty", "error")
			return;
		}

		let obj = {
			email: email,
			password: password
		};
		
		setSubmitButtonState(true)

		try {
			const response = await fetch('http://localhost:5000/api/login', {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify(obj),
			  credentials: 'include'
			});
	  
			const body = await response.json();
			console.log("Login Response:", body);
	  
			if (response.ok && body.user) {
			  localStorage.setItem('user', JSON.stringify(body.user));
			  navigate('/dashboard');
			} else {
			  swal("Oops!", body.message || 'Login failed', "error");
			}
		  } catch (error) {
			console.error("Login Error:", error);
			swal("Oops!", "Something went wrong. Please try again later.", "error");
		  } finally {
			setSubmitButtonState(false);
		  }
		};

	return (
		<div className='login'>
			<img className="wave" alt='wave bg' src="./images/wave.png" />
			<div className="login-container">
				<div className="img">
					<img alt='background' src="./images/bg.svg" />
				</div>

				<div className="login-content">
					<SnackbarProvider 
						maxSnack={1}
						autoHideDuration={10000}
						variant='success'
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'left',
						}}
						dense='true'
					/>
					<div className='myform'>
						<img alt='profile' src="./images/avatar.svg" />
						<h1 className="title">Welcome Back!</h1>
						<div className="input-div one">
							<div className="i">
								<EmailOutlined/>
							</div>
							<div className="div">
								<input type="email" placeholder='Email Id' name="email" value={email} onClick={() => enqueueSnackbar({style: {variant: 'error', whiteSpace: 'pre-line' }})} onChange={e => setEmail(e.target.value.trim())} />
							</div>
						</div>
						<div className="input-div pass">
							<div className="i">
								<SecurityOutlined/>
							</div>
							<div className="div">
								<input type="password" placeholder='Password' name="Password" value={password} onChange={e => setPassword(e.target.value.trim())} />
							</div>
						</div>
						<div className="d-flex justify-content-between">
							<Link></Link>
							<Link to="/forgetpassword">Forgot Password?</Link>
						</div>
						<button className="btn" disabled={submitButtonState} onClick={() => { login() }}>
							{
								!submitButtonState ?
									<span>Login</span> :
									<span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Please wait<div className="loader"></div></span>
							}
						</button>	
						
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login
