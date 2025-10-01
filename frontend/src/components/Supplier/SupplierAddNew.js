import React, { useEffect, useState } from 'react';
import './SupplierAddNew.css';

import swal from 'sweetalert';
import Loader from '../PageStates/Loader';
import Error from '../PageStates/Error';

function SupplierAddNew() {
    const [pageState, setPageState] = useState(1);
    const [permission, setPermission] = useState({ create: true }); 

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); 

    const [submitButtonState, setSubmitButtonState] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setPageState(2);
            } catch (error) {
                setPageState(3);
            }
        };
        fetchData();
    }, []);

    const insertSupplier = async () => {
        if (name === "") {
            swal("Oops!", "Name can't be empty", "error");
            return;
        }

        if (address === "") {
            swal("Oops!", "Address can't be empty", "error");
            return;
        }

        if (email === "") {
            swal("Oops!", "Email can't be empty", "error");
            return;
        }

        const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-z]+)$/;
        if (!emailRegex.test(email)) {
            swal("Oops!", "Please enter valid email", "error");
            return;
        }

        const obj = {
            name,
            address,
            email,
            phone, // Include phone in the object
        };

        setSubmitButtonState(true);

        try {
            const response = await fetch(`https://invenio-api-production.up.railway.app/api/add_supplier`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(obj),
                credentials: 'include',
            });
            const body = await response.json();

            setSubmitButtonState(false);

            if (body.operation === 'success') {
                console.log('Supplier added successfully');
                swal("Success!", "Supplier added successfully", "success");

                setName('');
                setAddress('');
                setEmail('');
                setPhone(''); 
            } else {
                swal("Oops!", body.message, "error");
            }
        } catch (error) {
            setSubmitButtonState(false);
            swal("Oops!", "Failed to connect to the server", "error");
            console.error("Error adding supplier:", error);
        }
    };

    return (
        <div className='supplieraddnew'>
            <div className='supplier-header'>
                <div className='title'>Add New Supplier</div>
                {/* breadcrumb */}
            </div>

            {pageState === 1 ? (
                <Loader />
            ) : pageState === 2 ? (
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
                                        <label className='fw-bold'>Email</label>
                                        <input className='my_input' type='email' value={email} onChange={(e) => { setEmail(e.target.value) }} />
                                    </div>
                                </div>
                                <div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
                                    <div className='col'>
                                        <label className='fw-bold'>Address</label>
                                        <input className='my_input' type='text' value={address} onChange={(e) => { setAddress(e.target.value) }} />
                                    </div>
                                    <div className='col'>
                                        <label className='fw-bold'>Phone</label>
                                        <input className='my_input' type='text' value={phone} onChange={(e) => { setPhone(e.target.value) }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {permission.create && (
                            <button
                                className='btn success'
                                style={{ alignSelf: "center", marginTop: "1rem" }}
                                disabled={submitButtonState}
                                onClick={insertSupplier}
                            >
                                {!submitButtonState ? <span>Submit</span> : <span><div className="button-loader"></div></span>}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <Error />
            )}
        </div>
    );
}

export default SupplierAddNew;