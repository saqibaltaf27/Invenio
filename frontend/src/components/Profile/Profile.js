import React, { useEffect, useRef, useState } from 'react'
import './Profile.scss';
import swal from 'sweetalert';


import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import DeleteOutline from '@mui/icons-material/DeleteOutline';

import Loader from '../PageStates/Loader';
import Error from '../PageStates/Error';

function Profile() {
	const [pageState, setPageState] = useState(1);
	const [profileData, setProfileData] = useState(null);
	const [editMode, setEditMode] = useState(false);

	const [name, setName] = useState('');
	const [email, setEmail] = useState("");
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

	const getProfile = async (req, res) => {
		const { email} = req.body;
		let result = await fetch('http://localhost:5000/api/get_profile', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ email }),
		});

		let body = await result.json();
		console.log('Profile Data: ', body);
		setProfileData(body.info.profile[0]);
	}

	useEffect(() => {
    const fetchProfileData = async () => {
        try {
            await getProfile();
            setPageState(2);
        } catch (err) {
            console.log(err);
            setPageState(3);
        }
    };
    fetchProfileData();
}, []);

	useEffect(() => {
		if ((profileData) && (!editMode)) {
			setName(profileData.user_name);
			setEmail(profileData.email);
			setAddress(profileData.address);
			setProfileImage(profileData.image);
		}
	}, [profileData, editMode])

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
		  {
			profileData ? (
			  profileData.pageState === 1 ? 
			  <Loader /> :
			  profileData.pageState === 2 ?
				<>
				  <div className="bottom">
					<div className="left">
					  <img 
						src={(editMode && file) ? URL.createObjectURL(file) : (profileImage !== null ? `http://localhost:5000/api/profile_images/${profileImage}` : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg")} 
						alt="" 
					  />
					  {
						editMode && !profileImage &&
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
					  }
					  {
						editMode && profileImage &&
						<>
						  <DeleteOutline 
							className="utilityButtonDanger" 
							onClick={() => { setImageEdited(true); setProfileImage(null); }} 
						  />
						</>
					  }
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
	
					  {
						!editMode ? 
						<button style={{ margin: "0 2rem" }} onClick={(e) => { setEditMode(true); }}>Edit</button> :
						<div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
						  <button style={{ margin: "0 2rem" }} onClick={(e) => { setEditMode(false); setFile(null); }}>Back</button>
						  {
							submitButtonState ? 
							<button 
							  disabled 
							  style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "7px", paddingBottom: "7px", cursor: "not-allowed", opacity: "0.7" }}
							>
							  <svg width="25px" height="25px" viewBox="0 0 100 100">
								<g transform="translate(50 50)">
								  <g transform="translate(-19 -19) scale(0.6)">
									<g>
									  <animateTransform 
										attributeName="transform" 
										type="rotate" 
										values="0;36" 
										keyTimes="0;1" 
										dur="0.2s" 
										begin="0s" 
										repeatCount="indefinite" 
									  />
									  <path d="M28.625011367592503 20.13972999335393 L37.81739952301762 29.33211814877905 L29.33211814877905 37.81739952301762 L20.13972999335393 28.625011367592503 A35 35 0 0 1 11.320284385312565 33.11874335532145 L11.320284385312565 33.11874335532145 L13.353932430835567 45.95869178305824 L1.5016723436939086 47.835905363541 L-0.5319757018290933 34.995956935804216 A35 35 0 0 1 -10.308406469842062 33.44752242024091 L-10.308406469842062 33.44752242024091 L-16.21028296645617 45.03060723468969 L-26.902361256716592 39.58272123781513 L-21.000484760102484 27.999636423366347 A35 35 0 0 1 -27.999636423366347 19.999636423366347 A35 35 0 0 1 -20 9.807017416285682"></path>
									</g>
								  </g>
								</g>
							  </svg>
							  Updating...
							</button> :
							<button style={{ margin: "0 2rem" }} onClick={updateProfile}>Save</button>
						  }
						</div>
					  }
					</div>
				  </div>
	
				  <div className="password-section">
					<h3>Change Password</h3>
					<div className="formInput">
					  <label>Old Password</label>
					  <input 
						type="password" 
						value={oldPassword} 
						onChange={(e) => setOldPassword(e.target.value)} 
					  />
					</div>
					<div className="formInput">
					  <label>New Password</label>
					  <input 
						type="password" 
						value={newPassword} 
						onChange={(e) => setNewPassword(e.target.value)} 
					  />
					</div>
					<div className="formInput">
					  <label>Confirm New Password</label>
					  <input 
						type="password" 
						value={confirmPassword} 
						onChange={(e) => setConfirmPassword(e.target.value)} 
					  />
					</div>
	
					{
					  submitButtonState2 ? 
					  <button 
						disabled 
						style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "7px", paddingBottom: "7px", cursor: "not-allowed", opacity: "0.7" }}
					  >
						<svg width="25px" height="25px" viewBox="0 0 100 100">
						  <g transform="translate(50 50)">
							<g transform="translate(-19 -19) scale(0.6)">
							  <g>
								<animateTransform 
								  attributeName="transform" 
								  type="rotate" 
								  values="0;36" 
								  keyTimes="0;1" 
								  dur="0.2s" 
								  begin="0s" 
								  repeatCount="indefinite" 
								/>
								<path d="M28.625011367592503 20.13972999335393 L37.81739952301762 29.33211814877905 L29.33211814877905 37.81739952301762 L20.13972999335393 28.625011367592503 A35 35 0 0 1 11.320284385312565 33.11874335532145 L11.320284385312565 33.11874335532145 L13.353932430835567 45.95869178305824 L1.5016723436939086 47.835905363541 L-0.5319757018290933 34.995956935804216 A35 35 0 0 1 -10.308406469842062 33.44752242024091 L-10.308406469842062 33.44752242024091 L-16.21028296645617 45.03060723468969 L-26.902361256716592 39.58272123781513 L-21.000484760102484 27.999636423366347 A35 35 0 0 1 -27.999636423366347 19.999636423366347 A35 35 0 0 1 -20 9.807017416285682"></path>
							  </g>
							</g>
						  </g>
						</svg>
						Updating...
					  </button> :
					  <button style={{ margin: "0 2rem" }} onClick={updateProfilePassword}>Save</button>
					}
				  </div>
				</> :
				<Error />
			) : null
		  }
		</div>
	  );
	};
	
	export default Profile;