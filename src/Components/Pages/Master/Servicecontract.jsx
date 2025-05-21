import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { Navigate, useParams } from "react-router-dom";
import Servicecontracttabs from "./Servicecontracttabs";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { useSelector } from 'react-redux';
const Servicecontract = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();

  let { serviceid } = useParams();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [successMessage, setSuccessMessage] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [enddate, setEndDate] = useState(null);
  const createdBy = 1; // Static value for created_by
  const updatedBy = 2; // Static value for updated_by

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
    return `${year}-${month}-${day}`;
  };


  const handleDateChange = (date) => {


    if (date) {
      const formattedDate = formatDate(date);
      setStartDate(formattedDate)
    }


  };

  const handleDateChange2 = (date) => {


    if (date) {
      const formattedDate = formatDate(date);
      setEndDate(formattedDate)
    }


  };

  try {
    serviceid = serviceid.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = CryptoJS.AES.decrypt(serviceid, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    serviceid = parseInt(decrypted, 10)
  } catch (error) {
    console.log("Error".error)
  }

  const [formData, setFormData] = useState({
    customerName: "",
    customerMobile: "",
    contractNumber: "",
    contractType: "",
    productName: "",
    serialNumber: "",
    startDate: "",
    endDate: ""

  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getservicecontract`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      console.log(decryptedData);
      setUsers(decryptedData);
      setFilteredUsers(decryptedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const fetchservicecontractpopulate = async (serviceid) => {

    try {
      const response = await axiosInstance.get(`${Base_Url}/getservicecontractpopulate/${serviceid}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setStartDate(response.data[0].startDate)
      setEndDate(response.data[0].endDate)
      setFormData({
        ...response.data[0],
        // Rename keys to match your formData structure
        customerName: response.data[0].customerName,
        customerMobile: response.data[0].customerMobile,
        contractNumber: response.data[0].contractNumber,
        contractType: response.data[0].contractType,
        productName: response.data[0].productName,
        serialNumber: response.data[0].serialNumber,
        startDate: response.data[0].startDate,
        endDate: response.data[0].endDate

      });


      setIsEdit(true);




    } catch (error) {
      console.error('Error fetching Servicecontractdata:', error);
      setFormData([]);
    }
  };

  useEffect(() => {
    fetchUsers();


    if (serviceid != 0) {
      fetchservicecontractpopulate(serviceid);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter(
      (user) =>
        user.Serviceproduct && user.Serviceproduct.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {}; // Initialize an empty error object

    const isEmpty = (value) => {
      return value === undefined || value === null || String(value).trim() === '';
    };

    // Text/Email/Number inputs validation
    if (isEmpty(formData.contractNumber)) newErrors.contractNumber = "Contract Number Field is required.";
    if (isEmpty(formData.customerName)) newErrors.customerName = "Customer Name is required.";
    if (isEmpty(formData.customerMobile)) newErrors.customerMobile = "Customer Mobile Number is required.";
    if (isEmpty(formData.productName)) newErrors.productName = "Product Name is required.";
    if (isEmpty(formData.serialNumber)) newErrors.serialNumber = "Serial Number is required.";

    // Dropdown validations
    if (!formData.contractType) newErrors.contractType = "Contract Type is required.";
    return newErrors; // Return the error object
  };

  //handlesubmit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,

      startDate: startDate,
      endDate: enddate,

    }
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    setDuplicateError(""); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include 'updated_by'
          await axios
            .post(`${Base_Url}/putservicecontract`, {
              encryptedData,
            }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              //window.location.reload();
              setSuccessMessage('Customer Updated Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);

              setFormData({
                customerName: "",
                customerMobile: "",
                contractNumber: "",
                contractType: "",
                productName: "",
                serialNumber: "",
                startDate: "",
                endDate: "",
              });


              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Servicecontract already exists!"
                ); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include 'created_by'
          await axios
            .post(`${Base_Url}/postservicecontract`, {
              encryptedData
            }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              // window.location.reload();
              setFormData({
                customerName: "",
                customerMobile: "",
                contractNumber: "",
                contractType: "",
                productName: "",
                serialNumber: "",
                startDate: "",
                endDate: "",
              });
              setSuccessMessage('Customer Updated Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Servicecontract already exists!"
                ); // Show duplicate error for insert
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };


  const deleted = async (id) => {
    try {
      // Add confirmation dialog
      const isConfirmed = window.confirm("Are you sure you want to delete?");

      // Only proceed with deletion if user clicks "OK"
      if (isConfirmed) {
        const response = await axiosInstance.post(`${Base_Url}/deleteservicecontract`, { id }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestservicecontract/${id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setFormData(response.data);
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  // Role Right 
const handleSerialNumberBlur = async () => {
  if (!formData.serial_no) return;

  try {
    const response = await axios.get('/getProductDetailsBySerial', {
      params: {
        serialNumber: formData.serial_no,
      },
    });

    const data = response.data;

    setFormData((prev) => ({
      ...prev,
      productcode: data.productCode || '',
      productName: data.productDescription || '',
      customerName: data.customerName || '',
      customerID: data.customerID || '',
    }));
  } catch (error) {
    console.error("Error fetching product details:", error);
    // Optionally show a toast or error message here
  }
};



  const Decrypt = (encrypted) => {
    encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
  };

  const storedEncryptedRole = localStorage.getItem("Userrole");
  const decryptedRole = Decrypt(storedEncryptedRole);

  const roledata = {
    role: decryptedRole,
    pageid: String(30)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="tab-content">
      <Servicecontracttabs />
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              {successMessage && (
                <div className="alert alert-success text-center mb-3" role="alert">
                  {successMessage}
                </div>
              )}
              <div className="row">


                <form
                  onSubmit={handleSubmit}
                >
                  <div className="row">
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="CustomernameInput"
                        className="input-field"
                      >
                        Serial Number<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="serialNumber"
                        id="ServiceproductInput"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        placeholder="Enter Serial Number "
                      />
                      {errors.serialNumber && (
                        <small className="text-danger">
                          {errors.serialNumber}
                        </small>
                      )}
                    </div>
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="ProductcodeInput"
                        className="input-field"
                      >
                        Product Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="productcode"
                        id="ProductcodeInput"
                        value={formData.productcode}
                        onChange={handleChange}
                        placeholder="Enter Product Code  "
                      />
                      {errors.productcode && (
                        <small className="text-danger">
                          {errors.productcode}
                        </small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="CustomernameInput"
                        className="input-field"
                      >
                        Product Description<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="productName"
                        id="ServiceproductInput"
                        value={formData.productName}
                        onChange={handleChange}
                        placeholder="Enter Product Name "
                      />
                      {errors.productName && (
                        <small className="text-danger">
                          {errors.productName}
                        </small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="CustomernameInput"
                        className="input-field"
                      >
                        Customer Name<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="customerName"
                        id="ServiceproductInput"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Enter Customer Name "
                      />
                      {errors.customerName && (
                        <small className="text-danger">
                          {errors.customerName}
                        </small>
                      )}
                    </div>
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="CustomerMobileInput"
                        className="input-field"
                      >
                        Customer Mobile No
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="customerMobile"
                        id="CustomerMobileInput"
                        value={formData.customerMobile}
                        onChange={handleChange}
                        placeholder="Enter Customer Mobile Number "
                        pattern="[0-9]*"
                        maxLength="10"
                        minLength="10"
                      />
                      {errors.customerMobile && (
                        <small className="text-danger">
                          {errors.customerMobile}
                        </small>
                      )}
                    </div>
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="CustomernameInput"
                        className="input-field"
                      >
                        Contract Code<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="contractNumber"
                        id="ServiceproductInput"
                        value={formData.contractNumber}
                        onChange={handleChange}
                        placeholder="Enter Contract Code "
                      />
                      {errors.contractNumber && (
                        <small className="text-danger">
                          {errors.contractNumber}
                        </small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>

                    <div className="col-3 mb-3">
                      <label htmlFor="contracttypeInput" className="input-field">
                        Contract Type<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="contractType"
                        id="contracttypeInput"
                        value={formData.contractType}
                        onChange={handleChange}
                        placeholder="Select End Date"
                      >
                        <option value="">Select Contract Type</option>
                        <option value="AMC">AMC</option>
                        <option value="ExtWarranty">Extended Warranty</option>
                      </select>
                      {errors.contractType && (
                        <small className="text-danger">{errors.contractType}</small>
                      )}
                    </div>

                    <div className="col-3 mb-3">
                      <label
                        htmlFor="ContractAmtInput"
                        className="input-field"
                      >
                        Contract Amount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="contractamt"
                        id="ContractAmtInput"
                        value={formData.contractamt}
                        onChange={handleChange}
                        placeholder="Enter Contract Amount"
                      />
                      {errors.contractamt && (
                        <small className="text-danger">
                          {errors.contractamt}
                        </small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3 mb-3">
                      <label htmlFor="GoodwillMonthInput" className="input-field">
                        Goodwill Month
                      </label>
                      <input
                        type="text" // or use type="number" if it's numeric
                        className="form-control"
                        name="goodwillmonth"
                        id="GoodwillMonthInput"
                        value={formData.goodwillmonth}
                        onChange={handleChange}
                        placeholder="Enter Goodwill Month"
                      />
                      {errors.goodwillmonth && (
                        <small className="text-danger">{errors.goodwillmonth}</small>
                      )}
                    </div>

                    <div className="col-3 mb-3">
                      <label
                        htmlFor="DurationInput"
                        className="input-field"
                      >
                        Duration<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="duration"
                        id="DurationInput"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="Enter Duration "
                      />
                      {errors.duration && (
                        <small className="text-danger">
                          {errors.duration}
                        </small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>

                    <div className="col-3 mb-3">
                      <label
                        htmlFor="SchemenameInput"
                        className="input-field"
                      >
                        Scheme Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="schemename"
                        id="SchemenameInput"
                        value={formData.schemename}
                        onChange={handleChange}
                        placeholder="Enter Scheme Name"
                      />
                      {errors.schemename && (
                        <small className="text-danger">
                          {errors.schemename}
                        </small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>

                    <div className="col -3 mb-3">
                      <label htmlFor="StartDateInput" className="input-field">
                        Contract Start Date
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className='form-control'
                        name="startDate"
                        aria-describedby="StartDateInput"
                      />
                      {errors.startDate && (
                        <small className="text-danger">{errors.startDate}</small>
                      )}
                    </div>

                    <div className="col-3 mb-3">
                      <label htmlFor="EndDateInput" className="input-field">
                        Contract End Date
                      </label>
                      <DatePicker
                        selected={enddate}
                        onChange={handleDateChange2}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className='form-control'
                        name="endDate"
                        aria-describedby="EndDateInput"
                      />
                      {errors.endDate && (
                        <small className="text-danger">{errors.endDate}</small>
                      )}
                    </div>

                    <div className="col-3 mb-3">
                      <label htmlFor="PurchaseDateInput" className="input-field">
                        Purchase Date
                      </label>
                      <DatePicker
                        selected={enddate}
                        onChange={handleDateChange2}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className='form-control'
                        name="purchasedate"
                        aria-describedby="PurchaseDateInput"
                      />
                      {errors.purchasedate && (
                        <small className="text-danger">{errors.purchasedate}</small>
                      )}
                    </div>
                  </div>

                  {roleaccess > 2 ? <div className="text-right">
                    <button className="btn btn-liebherr" type="submit">
                      {isEdit ? "Update" : "Submit"}
                    </button>
                  </div> : null}
                </form>


              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default Servicecontract;
