import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Endcustomertabs from './Endcustomertabs';
import { useParams } from 'react-router-dom';

const Customer = () => {
  const { customerid } = useParams();
  const [customerData, setCustomerData] = useState([]);
  const [errors, setErrors] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { eid } = useParams();

  const [formData, setFormData] = useState({
    customer_fname: '',
    customer_lname: '',
    customer_type: '',
    customer_classification: '',
    mobileno: '',
    alt_mobileno: '',
    dateofbirth: '',
    anniversary_date: '',
    email: '',
    salutation: '',
    customer_id:''
  });

  const fetchCustomerData = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/getcustomer`);
      console.log(response.data);
      setCustomerData(response.data);
    } catch (error) {
      console.error('Error fetching CustomerData:', error);
    }
  };

  const fetchCustomerpopulate = async (customerid) => {

    try {
      const response = await axios.get(`${Base_Url}/getcustomerpopulate/${customerid}`);
      setFormData({
        ...response.data[0],
        // Rename keys to match your formData structure
        customer_fname: response.data[0].customer_fname,
        customer_lname: response.data[0].customer_lname,
        email: response.data[0].email,
        customer_type: response.data[0].customer_type,
        customer_classification: response.data[0].customer_classification,
        mobileno: response.data[0].mobileno,
        dateofbirth: response.data[0].dateofbirth,
        alt_mobileno: response.data[0].alt_mobileno,
        anniversary_date: response.data[0].anniversary_date,
        salutation: response.data[0].salutation,   
        customer_id:response.data[0].customer_id     
      });


      setIsEdit(true);

      


    } catch (error) {
      console.error('Error fetching customerdata:', error);
      setFormData([]);
    }
  };



  useEffect(() => {

    fetchCustomerData();
    if (customerid != 0) {
      fetchCustomerpopulate(customerid);
    }


  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};
     if (!formData.customer_fname?.trim()) {
       newErrors.customer_fname = "Customer First Name Field is required.";
     }


     if (!formData.customer_lname?.trim()) {
       newErrors.customer_lname = "Customer Last Name Field is required.";
     }

    if (!formData.customer_type || formData.customer_type === 'selected') {
      newErrors.customer_type = "Customer Type Dropdown is required.";
    }

     if (!formData.customer_classification || formData.customer_classification === 'selected') {
       newErrors.customer_classification = "Customer Classification Dropdown is required.";
     }

    if (!formData.mobileno?.trim()) {
       newErrors.mobileno = "Mobile Number Field is required.";
     }

     if (!formData.customer_id?.trim()) {
      newErrors.customer_id = "Customer_id Field is required.";
    } 

    // if (!formData.alt_mobileno) {
    //   newErrors.alt_mobileno = "Alternate Mobile Number Field is required.";
    // }

    // if (!formData.dateofbirth) {
    //   newErrors.dateofbirth = "Date Of Birth Field is required.";
    // }

    // if (!formData.anniversary_date) {
    //   newErrors.anniversary_date = "Anniversary Date Field is required.";
    // }

    // if (!formData.email) {
    //   newErrors.email = "Email Field is required.";
    // }


    return newErrors;
  };


  //handlesubmit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDuplicateError(''); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include duplicate check
          await axios.put(`${Base_Url}/putcustomer`, { ...formData })
            .then(response => {
              setFormData({
                customer_fname: '',
                customer_lname: '',
                customer_type: '',
                customer_classification: '',
                mobileno: '',
                alt_mobileno: '',
                dateofbirth: '',
                anniversary_date: '',
                email: '',
                salutation: '',
                customer_id:'',
              })
              setSuccessMessage('Customer Updated Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              fetchCustomerData();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Customer already exists!'); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include duplicate check
          await axios.post(`${Base_Url}/postcustomer`, { ...formData })
            .then(response => {
              setFormData({
                customer_fname: '',
                customer_lname: '',
                customer_type: '',
                customer_classification: '',
                mobileno: '',
                alt_mobileno: '',
                dateofbirth: '',
                anniversary_date: '',
                email: '',
                salutation: '',
                customer_id:'',
              })
              setSuccessMessage('Customer Submitted Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              fetchCustomerData();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Customer already exists!'); // Show duplicate error for insert
              }
            });
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };


  const deleted = async (id) => {
    try {
      const response = await axios.post(`${Base_Url}/deletecustomer`, { id });
      setFormData({
        customer_fname: '',
        customer_lname: '',
        customer_type: '',
        customer_classification: '',
        mobileno: '',
        alt_mobileno: '',
        dateofbirth: '',
        anniversary_date: '',
        email: '',
        customer_id: '',
      })
      fetchCustomerData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestcustomer/${id}`);
      setFormData(response.data)
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };


  return (
    <div className="tab-content">
      <Endcustomertabs></Endcustomertabs>
      <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body">
              {successMessage && (
                <div className="alert alert-success text-center mb-3" role="alert">
                  {successMessage}
                </div>
              )}
              <div className="row mp0">
                <div className="col-12">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-2 mb-3">
                        <label htmlFor="Salutation" className="form-label">Salutation</label>
                        <select
                          type="text"
                          className="form-select"
                          id="salutation"
                          aria-describedby="salutation"
                          name="salutation"
                          value={formData.salutation}
                          onChange={handleChange}
                        >
                          <option value="">Select Salutation</option>
                          <option value="1">Mr</option>
                          <option value="2">Mrs</option>
                          <option value="3">Miss</option>
                          <option value="4">M.</option>
                          <option value="5">Lhi</option>
                          <option value="6">Dl</option>
                          </select>
                          {errors.salutation && (
                            <small className="text-danger">{errors.salutation}</small>
                          )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="Customerfname" className="form-label">Customer First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="Customerfname"
                          aria-describedby="Customerfname"
                          name="customer_fname"
                          placeholder='Enter Customer First Name'
                          value={formData.customer_fname}
                          onChange={handleChange}
                        />
                        {errors.customer_fname && (
                          <small className="text-danger">{errors.customer_fname}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="Customerlname" className="form-label">Customer Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="Customerlname"
                          aria-describedby="Customerlname"
                          name="customer_lname"
                          placeholder='Enter Customer Last Name'
                          onChange={handleChange}
                          value={formData.customer_lname}
                        />
                        {errors.customer_lname && (
                          <small className="text-danger">{errors.customer_lname}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="Customerid" className="form-label">Customer ID</label>
                        <input
                          type="text"
                          className="form-control"
                          id="Customerid"
                          aria-describedby="Customerid"
                          name="customer_id"
                          placeholder='Enter  Customer ID'
                          onChange={handleChange}
                          value={formData.customer_id}
                        />
                        {errors.customer_lname && (
                          <small className="text-danger">{errors.customer_id}</small>
                        )}
                      </div>
                     
                      <div className="col-md-2 mb-3">
                        <label htmlFor="cclassification" className="form-label">Customer Classification</label>
                        <select id="cclassification" name="customer_classification" className="form-select" aria-label=".form-select-lg example" value={formData.customer_classification} onChange={handleChange} >
                          <option value="selected">Select Customer Classification</option>
                          <option value="Import">Import</option>
                          <option value="India">India</option>
                        </select>
                        {errors.customer_classification && (
                          <small className="text-danger">{errors.customer_classification}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="custype" className="form-label">Customer Type</label>
                        <select id="custype" className="form-select" aria-label=".form-select-lg example" name="customer_type" value={formData.customer_type} onChange={handleChange} >
                          <option value="selected">Select Customer Type</option>
                          <option value="EndCustomer">EndCustomer</option>
                          <option value="Sales Dealer WH/Display">Sales Dealer WH/Display</option>
                          <option value="Service Partner">Service Partner</option>
                          <option value="Warehouse">Warehouse</option>
                          <option value="Lhidisplay">LHI Display/WH</option>
                          <option value="Sub-Dealer">Sub-Dealer</option>
                        </select>
                        {errors.customer_type && (
                          <small className="text-danger">{errors.customer_type}</small>
                        )}
                      </div>
                      
                      <div className="col-md-3 mb-3">
                        <label htmlFor="mobilenumber" className="form-label">Mobile No. <input type="checkbox" />Whatsapp </label>
                        <input
                          type="text"
                          className="form-control"
                          id="mobilenumber"
                          aria-describedby="mobilenumber"
                          name="mobileno"
                          placeholder='Enter Mobile Number'
                          value={formData.mobileno}
                          onChange={handleChange}
                        />
                        {errors.mobileno && (
                          <small className="text-danger">{errors.mobileno}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="Altnumber" className="form-label">Alternate Mobile No.  <input type="checkbox" />Whatsapp</label>
                        <input
                          type="text"
                          className="form-control"
                          id="Altnumber"
                          aria-describedby="Altnumber"
                          name="alt_mobileno"
                          placeholder='Enter Alternate Mobile No.'
                          value={formData.alt_mobileno}
                          onChange={handleChange}
                        />
                        {errors.alt_mobileno && (
                          <small className="text-danger">{errors.alt_mobileno}</small>
                        )}
                      </div>
                      <div className="col-md-2 mb-3">
                        <label htmlFor="dbirth" className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          id="dbirth"
                          aria-describedby="dbirth"
                          name="dateofbirth"
                          value={formData.dateofbirth}
                          onChange={handleChange}
                        />
                        {errors.dateofbirth && (
                          <small className="text-danger">{errors.dateofbirth}</small>
                        )}
                      </div>
                      <div className="col-md-2 mb-3">
                        <label htmlFor="Anidate" className="form-label">Anniversary Date</label>
                        <input
                          type="date"
                          className="form-control"
                          id="Anidate"
                          aria-describedby="Anidate"
                          name="anniversary_date"
                          value={formData.anniversary_date}
                          onChange={handleChange}
                        />
                        {errors.anniversary_date && (
                          <small className="text-danger">{errors.anniversary_date}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="emailid" className="form-label">Email ID</label>
                        <input
                          type="email"
                          className="form-control"
                          id="emailid"
                          aria-describedby="emailid"
                          name="email"
                          placeholder='Enter Customer Email'
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && (
                          <small className="text-danger">{errors.email}</small>
                        )}
                      </div>
                      <div className="col-md-12 text-right">
                        <button type="submit" className="btn btn-liebherr">{isEdit ? "Update" : "Submit"}</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></div>

  );
};

export default Customer;
