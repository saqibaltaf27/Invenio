import React, { useEffect, useState } from 'react'
import './ProductAddNew.scss'

import swal from 'sweetalert';
import Error from '../PageStates/Error';
import Loader from '../PageStates/Loader';

function ProductAddNew() {
	const [pageState, setPageState] = useState(1);

	const [name, setName] = useState('');
	const [type, setType] = useState('');
	const [size, setSize] = useState('');
	const [material, setMaterial] = useState('');
	const [category, setCategory] = useState('');
	const [description, setDescription] = useState('');
	const [stock, setStock] = useState('0');
	const [sellingPrice, setSellingPrice] = useState('0');
	const [purchasePrice, setPurchasePrice] = useState('0');

	const [submitButtonState, setSubmitButtonState] = useState(false);

	useEffect(() => {
		setTimeout(() => {
		  setPageState(2); 
		}, 1000); 
	}, []);

	const insertProduct = async () => {
		if (name === "") {
			swal("Oops!", "Name can't be empty", "error")
			return;
		}
		if ((sellingPrice === "") || (parseFloat(sellingPrice) <= 0)) {
			swal("Oops!", "Selling Price can't be empty", "error")
			return;
		}
		if ((purchasePrice === "") || (parseFloat(purchasePrice) <= 0)) {
			swal("Oops!", "Purchase Price can't be empty", "error")
			return;
		}
		if ((stock < 0) || (parseFloat(stock) < 0)) {
			swal("Oops!", "Product stock can't be negative", "error")
			return;
		}

		const product = {
		name,
		type,
		size,
		material,
		category,
		description,
		product_stock: parseFloat(stock),
		selling_price: parseFloat(sellingPrice),
		purchase_price: parseFloat(purchasePrice)
	};

		setSubmitButtonState(true)

		let response = await fetch(//`http://localhost:5000/api/add_product` , {
			`https://invenio-api-production.up.railway.app/api/add_product`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify(product),
			credentials: 'include'
		})
		let body = await response.json()

		setSubmitButtonState(false)

		if (body.operation === 'success') {
			console.log('Product created successfully')
			swal("Success!", "Product created successfully", "success")

			setName('')
			setType('')
			setSize('')
			setMaterial('')
			setCategory('')
			setDescription('')
			setStock('0')
			setSellingPrice('0')
			setPurchasePrice('0')
		} else {
			swal("Oops!", body.message, "error")
		}
	}

	return (
		<div className='productaddnew'>
			<div className='product-header'>
				<div className='title'>Add New Product</div>
			</div>

			{
				pageState === 1 ? 
					<Loader />
					: pageState === 2 ?
						<div className="card">
							<div className="container">
								<div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
									<div className='col'>
										<label className='fw-bold'>Name</label>
										<input className='my_input' type='text' value={name} onChange={(e) => { setName(e.target.value) }} />
									</div>
									<div className='col'>
										<label className='fw-bold'>Type</label>
										<select
											className='form-select'
											value={type}
											onChange={(e) => setType(e.target.value)}
										>
											<option value="regular">Regular</option>
											<option value="foc">Free of Cost</option>
											<option value="discounted">Discounted</option>
											<option value="wastage">Wastage</option>
											<option value="staff">Staff</option>
										</select>
									</div>	
								</div>

								<div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
									<div className='col'>
										<label className='fw-bold'>Size</label>
										<input className='my_input' type='text' value={size} onChange={(e) => { setSize(e.target.value) }} />
									</div>
									<div className='col'>
										<label className='fw-bold'>Material</label>
										<input className='my_input' type='text' value={material} onChange={(e) => { setMaterial(e.target.value) }} />
									</div>
								</div>

								<div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
									<div className='col'>
										<label className='fw-bold'>Category</label>
										<input className='my_input' type='text' value={category} onChange={(e) => { setCategory(e.target.value) }} />
									</div>
									<div className='col'>
										<label className='fw-bold'>Description</label>
										<input className='my_input' type='text' value={description} onChange={(e) => { setDescription(e.target.value) }} />
									</div>
								</div>

								<div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
									<div className='col'>
										<label className='fw-bold'>Selling Price</label>
										<input className='my_input' type='number' value={sellingPrice} onChange={(e) => { setSellingPrice(e.target.value) }} />
									</div>
									<div className='col'>
										<label className='fw-bold'>Purchase Price</label>
										<input className='my_input' type='number' value={purchasePrice} onChange={(e) => { setPurchasePrice(e.target.value) }} />
									</div>
								</div>

								<div className="row" style={{ display: 'flex', marginTop: "0.5rem" }}>
									<div className='col'>
										<label className='fw-bold'>Stock</label>
										<input className='my_input' type='number' value={stock} onChange={(e) => { setStock(e.target.value) }} />
									</div>
								</div>

								<div className='d-flex justify-content-center'>
									<button className='btn success' style={{ alignSelf: "center", marginTop: "1rem" }} disabled={submitButtonState} onClick={() => { insertProduct() }} >
										{!submitButtonState ? <span>Submit</span> : <span><div className="button-loader"></div></span>}
									</button>
								</div>
							</div>
						</div>
						:
						<Error />
			}
		</div>
	)
}

export default ProductAddNew;
