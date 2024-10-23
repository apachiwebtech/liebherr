import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const Customer = () => {
//  // Step 1: Add this state to track errors
//   const [countries, setCountries] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [isEdit, setIsEdit] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [duplicateError, setDuplicateError] = useState(''); // State to track duplicate error


//   const [formData, setFormData] = useState({ 
//     title: '',
//     country_id: ''
//   });

//   const fetchCountries = async () => {
//     try {
//       const response = await axios.get(`${Base_Url}/getcountries`);
//       console.log(response.data); 
//       setCountries(response.data); // Countries data ko set kar rahe hain
//     } catch (error) {
//       console.error('Error fetching countries:', error); // Agar error aata hai to console me print karenge
//     }
//   };
  
//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get(`${Base_Url}/getregions`);
//       console.log(response.data); 
//       setUsers(response.data);
//       setFilteredUsers(response.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//     fetchCountries();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     const filtered = users.filter((user) =>
//       user.title && user.title.toLowerCase().includes(value)
//     );
//     setFilteredUsers(filtered);
//     setCurrentPage(0);
//   };

   
//     // Step 2: Add form validation function
//     const validateForm = () => {
//       const newErrors = {}; // Initialize an empty error object
//       if (!formData.title.trim()) { // Check if the title is empty
//         newErrors.title = "Region Field is required."; // Set error message if title is empty
//       }

//        // Check if the country_id is empty
//       if (!formData.country_id) {
//         newErrors.country_id = "Country selection is required."; // Set error message if no country is selected
//       }
//       return newErrors; // Return the error object
//     };
  

//       //handlesubmit form
//       const handleSubmit = async (e) => {
//         e.preventDefault();
      
//         const validationErrors = validateForm();
//         if (Object.keys(validationErrors).length > 0) {
//           setErrors(validationErrors);
//           return;
//         }
      
//         setDuplicateError(''); // Clear duplicate error before submitting
      
//         try {
//           const confirmSubmission = window.confirm("Do you want to submit the data?");
//           if (confirmSubmission) {
//             if (isEdit) {
//               // For update, include duplicate check
//               await axios.put(`${Base_Url}/putregion`, { ...formData })
//                 .then(response => {
//                   setFormData({
//                     title: '',
//                 country_id: ''
//                               })
//                     fetchUsers();
//                 })
//                 .catch(error => {
//                   if (error.response && error.response.status === 409) {
//                     setDuplicateError('Duplicate entry, Region already exists!'); // Show duplicate error for update
//                   }
//                 });
//             } else {
//               // For insert, include duplicate check
//               await axios.post(`${Base_Url}/postregion`, { ...formData })
//                 .then(response => {
//                   setFormData({
//                     title: '',
//                 country_id: ''
//                               })
//                     fetchUsers();
//                 })
//                 .catch(error => {
//                   if (error.response && error.response.status === 409) {
//                     setDuplicateError('Duplicate entry, Region already exists!'); // Show duplicate error for insert
//                   }
//                 });
//             }
//           }
//         } catch (error) {
//           console.error('Error during form submission:', error);
//         }
//       };
      

//   const deleted = async (id) => {
//     try {
//       const response = await axios.post(`${Base_Url}/deleteregion`, { id });
//       setFormData({
//         title: '',
//     country_id: ''
//                   })
//         fetchUsers();
//     } catch (error) {
//       console.error('Error deleting user:', error);
//     }
//   };

//   const edit = async (id) => {
//     try {
//       const response = await axios.get(`${Base_Url}/requestregion/${id}`);
//       setFormData(response.data)
//       setIsEdit(true);
//       console.log(response.data);
//     } catch (error) {
//       console.error('Error editing user:', error);
//     }
//   };


//   const indexOfLastUser = (currentPage + 1) * itemsPerPage;
//   const indexOfFirstUser = indexOfLastUser - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="row mp0">
    <div className="col-12">
      <div className="card mb-3 tab_box">
        <div className="card-body">
          <div className="row mp0">
            <div className="col-12">
              <form>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="Customerfname" className="form-label">Customer First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="Customerfname"
                      aria-describedby="Customerfname"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="Customerlname" className="form-label">Customer Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="Customerlname"
                      aria-describedby="Customerlname"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="custype" className="form-label">Customer Type</label>
                    <select id="custype" name="custype" className="form-select" aria-label=".form-select-lg example">
                      <option value="selected">Select Customer Type</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="cclassification" className="form-label">Customer Classification</label>
                    <select id="cclassification" name="cclassification" className="form-select" aria-label=".form-select-lg example">
                      <option value="selected">Select Customer Classification</option>
                      <option value="Import">Import</option>
                      <option value="India">India</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="mobilenumber" className="form-label">Mobile No.</label>
                    <input
                      type="text"
                      className="form-control"
                      id="mobilenumber"
                      aria-describedby="mobilenumber"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="Altnumber" className="form-label">Alternate Mobile No.</label>
                    <input
                      type="text"
                      className="form-control"
                      id="Altnumber"
                      aria-describedby="Altnumber"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="dbirth" className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dbirth"
                      aria-describedby="dbirth"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="Anidate" className="form-label">Anniversary Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="Anidate"
                      aria-describedby="Anidate"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="emailid" className="form-label">Email ID</label>
                    <input
                      type="email"
                      className="form-control"
                      id="emailid"
                      aria-describedby="emailid"
                    />
                  </div>
                  <div className="col-md-12 text-right">
                    <button type="submit" className="btn btn-liebherr">Submit</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default Customer;
