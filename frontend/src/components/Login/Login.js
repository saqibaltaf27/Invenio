import React, { useState, useEffect } from 'react';
import './Login.css';
import { SnackbarProvider } from 'notistack';
import swal from 'sweetalert';
import { Link, useNavigate } from 'react-router-dom';
import {
  EmailOutlined,
  SecurityOutlined,
  Visibility,
  VisibilityOff,
  PersonOutline,
  BusinessCenter,
  AnalyticsOutlined,
  NotificationsActiveOutlined,
  AutorenewOutlined,
  PhoneIphoneOutlined,
  FlashOnOutlined,
  LockOutlined,
  TrendingUpOutlined,
  StorefrontOutlined,
  AssignmentOutlined
} from "@mui/icons-material";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitButtonState, setSubmitButtonState] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const navigate = useNavigate();

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.email && email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (errors.password && password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  }, [email, password, errors]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email can't be empty";
    } else {
      let regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-z]+)$/;
      if (!regex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    if (!password) {
      newErrors.password = "Password can't be empty";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const login = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    const obj = { email: email.trim(), password };
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
        // Store user data
        localStorage.setItem('user', JSON.stringify(body.user));
        localStorage.setItem('userEmail', body.user.email);
        localStorage.setItem('userRole', body.user.role);
        
        // Show success message
        await swal({
          title: "Welcome Back!",
          text: `Successfully logged in as ${body.user.name || body.user.email}`,
          icon: "success",
          timer: 2000,
          buttons: false,
        });

        // Navigate based on role
        if (body.user.role === 'Admin') {
          navigate('/dashboard');
        } else if (body.user.role === 'employee') {
          navigate('/products');
        } else {
          navigate('/dashboard'); // Default fallback
        }
      } else {
        swal({
          title: "Login Failed",
          text: body.message || 'Invalid email or password',
          icon: "error",
          button: "Try Again",
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      swal({
        title: "Connection Error",
        text: "Unable to connect to server. Please check your internet connection.",
        icon: "error",
        button: "OK",
      });
    } finally {
      setSubmitButtonState(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="left-side">
        <div className="branding-content">
          <div className="logo-container">
            <BusinessCenter className="logo-icon" />
            <h1>Invenio</h1>
          </div>
          
          <p>Turn data into action with Invenio's powerful inventory management system.</p>
          
          <div className="features-list">
  <div className="feature-item">
    <PersonOutline className="feature-icon" />
    <span>Role-based access control</span>
  </div>
  <div className="feature-item">
    <EmailOutlined className="feature-icon" />
    <span>Secure authentication</span>
  </div>
  <div className="feature-item">
    <SecurityOutlined className="feature-icon" />
    <span>Real-time inventory tracking</span>
  </div>
  <div className="feature-item">
    <AnalyticsOutlined className="feature-icon" />
    <span>Advanced analytics & reports</span>
  </div>

  <div className="feature-item">
    <AutorenewOutlined className="feature-icon" />
    <span>Automated stock management</span>
  </div>
  <div className="feature-item">
    <PhoneIphoneOutlined className="feature-icon" />
    <span>Mobile-friendly interface</span>
  </div>
  <div className="feature-item">
    <FlashOnOutlined className="feature-icon" />
    <span>Fast & responsive performance</span>
  </div>
  <div className="feature-item">
    <LockOutlined className="feature-icon" />
    <span>Data encryption & security</span>
  </div>
  <div className="feature-item">
    <TrendingUpOutlined className="feature-icon" />
    <span>Sales trend analysis</span>
  </div>
  
  <div className="feature-item">
    <AssignmentOutlined className="feature-icon" />
    <span>Comprehensive audit logs</span>
  </div>
</div>
        </div>
        
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="right-side">
        <SnackbarProvider maxSnack={1} autoHideDuration={4000} />

        <div className="form-container">
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={login} className="login-form">
            <div className={`input-group ${errors.email ? 'error' : ''} ${isFocused.email ? 'focused' : ''}`}>
              <div className="input-icon">
                <EmailOutlined />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                onKeyPress={handleKeyPress}
                className={errors.email ? 'error-input' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className={`input-group ${errors.password ? 'error' : ''} ${isFocused.password ? 'focused' : ''}`}>
              <div className="input-icon">
                <SecurityOutlined />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                onKeyPress={handleKeyPress}
                className={errors.password ? 'error-input' : ''}
              />
              <div className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgetpassword" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`login-button ${submitButtonState ? 'loading' : ''}`}
              disabled={submitButtonState}
            >
              {submitButtonState ? (
                <>
                  <div className="button-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;