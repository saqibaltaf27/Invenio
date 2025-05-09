import React, { useEffect, useRef, useState } from 'react';
import './Profile.scss';
import swal from 'sweetalert';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Loader from '../PageStates/Loader';
import ErrorComponent from '../PageStates/Error';

function Profile() {
  const [pageState, setPageState] = useState(1);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState("");
  const [imageEdited, setImageEdited] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [submitButtonState, setSubmitButtonState] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitButtonState2, setSubmitButtonState2] = useState(false);

  useEffect(() => {
	const storedEmail = localStorage.getItem('userEmail');
	if (storedEmail) {
	  setEmail(storedEmail); // Set the email in state
	  fetchProfile(storedEmail); // Fetch the profile
	} else {
	  console.warn('User email not found in local storage. Cannot fetch profile.');
	  setPageState(3); // Show error state if no email
	}
  }, []); // Runs only once on mount
  
  const fetchProfile = async (userEmail) => {
	setPageState(1); // Set loading state
	try {
	  const result = await fetch('http://localhost:5000/api/get_profile', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({ email: userEmail }),
	  });
  
	  const body = await result.json();
	  console.log('Profile Data (Frontend): ', body);
  
	  // Check if the response contains the expected profile data
	  if (body && body.operation === 'success' && body.data) {
		// Assuming body.data contains the profile info directly
		setProfileData(body.data); // Update the profile data
		setName(body.data.user_name); // Set the name from the response
		setEmail(body.data.email); // Set the email from the response
		setAddress(body.data.address || ''); // If address exists, set it
		setProfileImage(body.data.profile_image || ''); // If profile image exists, set it
		setPageState(2); // Set success state
	  } else {
		console.error('Invalid profile data received:', body);
		setPageState(3); // Set error state
	  }
	} catch (err) {
	  console.error('Error fetching profile:', err);
	  setPageState(3); // Set error state
	}
  };

	const updateProfile = async () => {
		if (name === "") {
			swal("Oops!", "Name can't be empty", "error")
			return;
		}

		let f = new FormData();
		f.append('name', name)
		f.append('address', address)
		f.append('file', file)
		f.append('image_edited', imageEdited)

		console.log(Array.from(f.values()).map(x => x).join(", "))
		setSubmitButtonState(true)

		let response = await fetch(`http://localhost:5000/api/update_profile`, {
			method: 'POST',
			body: f,
			credentials: 'include'
		})
		let body = await response.json();

		setSubmitButtonState(false);

		if (body.operation === 'success') {
			console.log('Profile updated successfully')
			swal("Success!", "Profile updated successfully", "success").then(() => { window.location.reload() })
		} else {
			swal("Oops!", body.message, "error")
		}
	}

	const updateProfilePassword = async () => {
		if (oldPassword === "") {
			swal("Oops!", "Old Password can't be empty", "error")
			return;
		}
		if (newPassword === "") {
			swal("Oops!", "New Password can't be empty", "error")
			return;
		}
		if (confirmPassword !== newPassword) {
			swal("Oops!", "Confirm Password can't be different", "error")
			return;
		}

		let obj = {}
		obj.old_password = oldPassword
		obj.new_password = newPassword
		setSubmitButtonState2(true)

		let response = await fetch(`http://localhost:5000/api/update_profile_password`, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			},
			body: JSON.stringify(obj),
			credentials: 'include'
		})
		let body = await response.json()

		setSubmitButtonState2(false);

		if (body.operation === 'success') {
			console.log('Password updated successfully')
			swal("Success!", "Password updated successfully", "success")

			setOldPassword('')
			setNewPassword('')
			setConfirmPassword('')
		}
		else {
			swal("Oops!", body.message, "error")
		}
	}

	return (
		<div className="profile">
		  {pageState === 1 && <Loader />}
		  {pageState === 2 && profileData && (
			<>
			  <div className="bottom">
				<div className="left">
				  <img
					src={(editMode && file) ? URL.createObjectURL(file) : (profileImage !== null ? `http://localhost:5000/api/profile_images/${profileImage}` : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg")}
					alt=""
				  />
				  {editMode && !profileImage && (
					<>
					  <DriveFolderUploadOutlinedIcon
						className="utilityButtonSuccess"
						onClick={() => { fileInputRef.current.click(); }}
					  />
					  <input
						ref={fileInputRef}
						type="file"
						style={{ display: 'none' }}
						onChange={(e) => {
						  if (e.target.files[0].type === "image/jpeg" || e.target.files[0].type === "image/png") {
							setImageEdited(true);
							setFile(e.target.files[0]);
						  } else {
							swal("Oops!!", "Unsupported File type, Please upload either .jpg,.jpeg,.png", "warning");
						  }
						}}
					  />
					</>
				  )}
				  {editMode && profileImage && (
					<>
					  <DeleteOutline
						className="utilityButtonDanger"
						onClick={() => { setImageEdited(true); setProfileImage(null); }}
					  />
					</>
				  )}
				</div>
				<div className="right">
				  <div style={{ display: "flex", margin: "0.5rem 0" }}>
					<div className="formInput">
					  <label>Name</label>
					  <input
						type="text"
						value={name}
						onChange={(e) => { setName(e.target.value); }}
						placeholder="Name"
						readOnly={!editMode}
					  />
					</div>
				  </div>
	
				  <div style={{ display: "flex", margin: "0.5rem 0" }}>
					<div className="formInput">
					  <label>Email</label>
					  <input
						type="email"
						value={email}
						onChange={(e) => { setEmail(e.target.value); }}
						placeholder="Email"
						readOnly={!editMode}
					  />
					</div>
				  </div>
	
				  <div style={{ display: "flex", margin: "0.5rem 0" }}>
					<div className="formInput">
					  <label>Address</label>
					  <textarea
						rows={3}
						style={{ resize: "none" }}
						value={address}
						onChange={(e) => { setAddress(e.target.value); }}
						placeholder="Address"
						readOnly={!editMode}
					  />
					</div>
				  </div>
	
				  {!editMode ? (
					<button style={{ margin: "0 2rem" }} onClick={(e) => { setEditMode(true); }}>Edit</button>
				  ) : (
					<div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
					  <button style={{ margin: "0 2rem" }} onClick={(e) => { setEditMode(false); setFile(null); }}>Back</button>
					  {submitButtonState ? (
						<button
						  disabled
						  style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "7px", paddingBottom: "7px", cursor: "not-allowed", opacity: "0.7" }}
						>
						  {/* ... your loading spinner ... */}
						  Updating...
						</button>
					  ) : (
						<button style={{ margin: "0 2rem" }} onClick={updateProfile}>Save</button>
					  )}
					</div>
				  )}
				</div>
			  </div>
	
			  <div className="password-section">
				<h3>Change Password</h3>
				{/* ... password input fields ... */}
				{submitButtonState2 ? (
				  <button
					disabled
					style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "7px", paddingBottom: "7px", cursor: "not-allowed", opacity: "0.7" }}
				  >
					{/* ... your loading spinner ... */}
					Updating...
				  </button>
				) : (
				  <button style={{ margin: "0 2rem" }} onClick={updateProfilePassword}>Save</button>
				)}
			  </div>
			</>
		  )}
		  {pageState === 3 && <ErrorComponent />}
		</div>
	  );
	};
	
	export default Profile;