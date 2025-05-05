import React, { useState } from 'react';
import './Table.scss';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import ViewColumn from "@mui/icons-material/ViewColumn";
import Close from "@mui/icons-material/Close";

function Table(props) {
  const [searchBar, setSearchBar] = useState(false);
  const [unsetColumns, setUnsetColumns] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  // Ensure props.headers and props.data are arrays before mapping
  const headers = props.headers || [];
  const data = props.data || [];

  // Debugging logs to check headers and data
  console.log("Headers:", headers);
  console.log("Data:", data);

  const handleColumnToggle = (col) => {
    setUnsetColumns(prevState => 
      prevState.includes(col) 
        ? prevState.filter(item => item !== col) 
        : [...prevState, col]
    );
  };

  return (
    <div className='dataTable'>
      <div className='tableToolbar'>
        <div className="flex-grow-1 d-flex align-items-center">
        
          <Close 
            style={{ transition: "all 0.3s ease-in-out", cursor: "pointer", visibility: searchBar ? "visible" : "hidden", opacity: searchBar ? "1" : "0" }} 
            onClick={() => { 
              setSearchBar(false); 
              setSearchInput(""); 
            }} 
          />
        </div>
        
      </div>

      {/* Insert your table here */}
      <div className="tableContainer">
        <table className="table">
          <thead>
            <tr>
			{headers.filter(h => !unsetColumns.includes(h)).map((header, index) => (
      		<th key={index}>{header}</th>
                ))}
            </tr>
          </thead>
          <tbody>
			{data.map((row, index) => (
				<tr key={index}>
				{Object.keys(row).map((key, idx) => (
					<td key={idx}>{row[key]}</td>
				))}
				</tr>
			))}
			</tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
