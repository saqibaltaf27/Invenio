import React, { useEffect, useState, useContext } from "react";
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { DarkModeContext } from "../../context/darkModeContext";
import "./Header.scss";

import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import Fullscreen from "@mui/icons-material/Fullscreen";
import { Link } from "react-router-dom";

const Header = () => {
	const { dispatch } = useContext(DarkModeContext);
	const [userName, setUserName] = useState('');
	const [userImage, setUserImage] = useState(null);
	const [userEmail, setUserEmail] = useState('');
	const [fullscreen, setFullscreen] = useState(false);
	const [darkMode, setDarkMode] = useState(false);

	const getProfile = async () => {
		try{
			let email = null;

		// Case 1: check if stored directly
		if (localStorage.getItem('email')) {
			email = localStorage.getItem('email');
		}
		// Case 2: check if stored in 'user' object
		else if (localStorage.getItem('user')) {
			const user = JSON.parse(localStorage.getItem('user'));
			email = user?.email;
		}

		console.log("Fetching Profile for userId:", email);

		if (!email) {
			console.error("Email missing in localStorage");
			return;
		}
			const result = await fetch('https://invenio-api-production.up.railway.app/api/get_profile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ email })
			});

		const body = await result.json()
		if (body?.data?.user_name) {
			setUserName(body.user_name);
			setUserEmail(body.email);
			setUserImage(body.image);
		} else {
			console.error("Invalid profile structure", body);
		}
	}catch(error) {
		console.error("❌ Failed to fetch profile:", error);
	}
};

	useEffect(() => {
		getProfile();
	}, [])

	};
export default Header;