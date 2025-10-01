import React, { useEffect, useState } from 'react'
import './EmployeeAddNew.css'

import swal from 'sweetalert';
//import CryptoJS from 'crypto-js';
import Loader from '../PageStates/Loader';
import Error from '../PageStates/Error';
import { create } from '@mui/material/styles/createTransitions';

function EmployeeAddNew() {
	const [pageState, setPageState] = useState(1);
	const [permission, setPermission] = useState({create: true});

	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const [submitButtonState, setSubmitButtonState] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try{
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setPageState(2);
			} catch(error){
				setPageState(3);
			}
		};
		fetchData();
	}, []);

	const insertEmployee = async () => {
		if (name === "") {
			swal("Oops!", "Name can't be empty", "error");
			return;
		}

		if (email === "") {
			swal("Oops!", "Email can't be empty", "error");
			return;
		}

		let regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-z]+)$/;
		if (!regex.test(email)) {
			swal("Oops!", "Please enter valid email", "error");
			return;
		}

		if (password === "") {
			swal("Oops!", "Password can't be empty", "error");
			return;
		}

		let obj = {
			name,
			address,
			email,
			password, 
		};
		setSubmitButtonState(true)

		let response = await fetch(`https://invenio-api-production.up.railway.app/api/add_employee`, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify(obj),
			credentials: 'include',
		})
		const body = await response.json();

		setSubmitButtonState(false);
		//console.log(body)

		if (body.operation === 'success') {
			console.log('Employee added successfully');
			swal("Success!", "Employee added successfully", "success");

			setName('');
			setAddress('');
			setEmail('');
			setPassword('');
		} else {
			swal("Oops!", body.message, "error");
		}
	}

	return (
		<div className='employeeaddnew'>
			<div className='employee-header'>
				<div className='title'>Add New Employee</div>
				{/* breadcrumb */}
			</div>

			{
				pageState === 1 ?
					<Loader />
					: pageState === 2 ?
						<div className="card">
							<div className="container" style={{ display: "flex", flexDirection: "column" }}>

								<div style={{ display: "flex", justifyContent: "space-evenly" }}>
									<div className="right" >
										<div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
											<div className='col'>
												<label className='fw-bold'>Name</label>
												<input className='my_input' type='text' value={name} onChange={(e) => { setName(e.target.value) }} />
											</div>
											<div className='col'>
												<label className='fw-bold'>Address</label>
												<input className='my_input' type='text' value={address} onChange={(e) => { setAddress(e.target.value) }} />
											</div>
										</div>
										<div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
											<div className='col'>
												<label className='fw-bold'>Email</label>
												<input className='my_input' type='email' value={email} onChange={(e) => { setEmail(e.target.value) }} />
											</div>
											<div className='col'>
												<label className='fw-bold'>Password</label>
												<input className='my_input' type='password' value={password} onChange={(e) => { setPassword(e.target.value) }} />
											</div>
										</div>
									</div>
								</div>

								{
									permission.create &&
									<button className='btn success' style={{ alignSelf: "center", marginTop: "1rem" }} disabled={submitButtonState} onClick={() => { insertEmployee() }} >
										{!submitButtonState ? <span>Submit</span> : <span><div className="button-loader"></div></span>}
									</button>
								}
							</div>
						</div>
						:
						<Error />
			}
		</div>
	)
}

export default EmployeeAddNew