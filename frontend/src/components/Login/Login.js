import React, { useState } from 'react';
import './Login.scss';
import { SnackbarProvider } from 'notistack';
import swal from 'sweetalert';
import { Link, useNavigate } from 'react-router-dom';
import { EmailOutlined, SecurityOutlined } from "@mui/icons-material";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitButtonState, setSubmitButtonState] = useState(false);
  const navigate = useNavigate();

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

    let obj = { email, password };
    setSubmitButtonState(true);

    try {
      const response = await fetch('https://invenio-api-production.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
        credentials: 'include'
      });

      const body = await response.json();
      if (response.ok && body.user) {
        localStorage.setItem('user', JSON.stringify(body.user));
        localStorage.setItem('userEmail', JSON.stringify(body.user));

        if (body.user.role === 'Admin') {
          navigate('/dashboard');
        } else if (body.user.role === 'employee') {
          navigate('/products');
        }
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
    <div className="login-page">
      <div className="left-side">
        <img src="/images/login.png" alt="illustration" className="illustration" />
        <h1>Welcome to Invenio</h1>
        <p>Turn data into action with Invenio.</p>
      </div>

      <div className="right-side">
        <SnackbarProvider maxSnack={1} autoHideDuration={4000} />

        <div className="form-box">
          <h2>Sign in to Invenio</h2>
          <p className="subtitle">Start your journey with Invenio today</p>

          <div className="input-div">
            <EmailOutlined />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value.trim())}
            />
          </div>

          <div className="input-div">
            <SecurityOutlined />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value.trim())}
            />
          </div>

          <div className="extras">
            
            <Link to="/forgetpassword">Forgot password?</Link>
          </div>

          <button className="btn primary" disabled={submitButtonState} onClick={login}>
            {!submitButtonState ? "Login" : "Please wait..."}
          </button>


        </div>
      </div>
    </div>
  );
}

export default Login;
