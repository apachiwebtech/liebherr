import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEye, FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { Navigate, useParams } from "react-router-dom";
import Servicecontracttabs from "./Servicecontracttabs";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import DatePicker from "react-datepicker";
import _debounce from 'lodash.debounce';
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { useSelector } from 'react-redux';
import { file } from "jszip";
import { Autocomplete, TextField } from "@mui/material";
const Servicecontract = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();

  let { serviceid } = useParams();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [contarctlist, setContarctlist] = useState([]);
  const [selectedsceme, setselectedsceme] = useState(null);
  const [scheme, setscheme] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const token = localStorage.getItem("token"); // Get token from localStorage
  const created_by = localStorage.getItem("licare_code"); // Get token from localStorage
  const [successMessage, setSuccessMessage] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [enddate, setEndDate] = useState(null);
  const [purchase_date, setPurchase] = useState(null);
  const isEditMode = serviceid !== undefined;
  const [scemedata, setScemedata] = useState([]);
  const [scemetext, setScemeText] = useState("");

  // const formatDate = (date) => {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
  //   const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
  //   return `${year}-${month}-${day}`;
  // };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
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
  const handleDateChange3 = (date) => {


    if (date) {
      const formattedDate = formatDate(date);
      setPurchase(formattedDate)

    }


  };

  const handlePreviewClick = (passport_picture) => {

    if (passport_picture) {
      const fileUrl = `${Base_Url}/uploads/${passport_picture}`; // Make sure this URL is correct
      setPreviewUrl(fileUrl);
      setPreviewOpen(true);
    } else {
      alert('No file available for preview.');
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

  const [Value, SetValue] = useState({
    serialNumber: "",
    itemNumber: "",
    productName: "",
    customerName: "",
    customerId: "",
    contractNumber: "",
    contractType: "",
    schemename: "",
    goodwillmonth: "",
    duration: "",
    purchasedate: "",
    startDate: "",
    endDate: "",
    contractamt: "",
    ContrctRemark: "",
    file: ''
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
      setPurchase(response.data[0].purchaseDate)
      setscheme(response.data[0].scheme_name)
      SetValue({
        ...response.data[0],
        schemename: response.data[0].scheme_name,
        customerName: response.data[0].customerName,
        customerId: response.data[0].customerID,
        contractNumber: response.data[0].contractNumber,
        contractType: response.data[0].contractType,
        itemNumber: response.data[0].product_code,
        duration: response.data[0].duration,
        goodwillmonth: response.data[0].goodwill_month,
        productName: response.data[0].productName,
        serialNumber: response.data[0].serialNumber,
        startDate: response.data[0].startDate,
        endDate: response.data[0].endDate,
        contractamt: response.data[0].contarct_amt,
        ContrctRemark: response.data[0].remark
      });


      setIsEdit(true);




    } catch (error) {
      console.error('Error fetching Servicecontractdata:', error);
      SetValue([]);
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
    SetValue((prev) => ({ ...prev, [name]: value }));

    if (name === 'serialNumber') {
      getserial(value); // Pass the latest value directly
    }

    // if (name === 'duration' || name === 'goodwillmonth' || name === 'purchasedate') {
    //   handlestartenddatecalculation(e); // Call the function to calculate start and end dates

    // }
  };

  const getserial = (serialValue) => {
    // If serialValue is empty, unset the relevant fields
    if (!serialValue) {
      SetValue((prev) => ({
        ...prev,
        customerName: "",
        productName: "",
        itemNumber: "",
        customerId: "",
      }));
      setPurchase(null);
      setContarctlist([]);
      return;
    }
    axios.get(`${Base_Url}/getfromserial/${serialValue}`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        console.log(res);

        if (res.data.previoscontarct && res.data.previoscontarct.length > 0) {
          setContarctlist(res.data.previoscontarct);
        } else {
          setContarctlist([]);
        }

        if (res.data.data && res.data.data.length > 0 && res.data.data[0]) {
          const serial = res.data.data[0];

          SetValue((prev) => ({
            ...prev,
            customerName: serial.customer_fname,
            productName: serial.ModelNumber,
            itemNumber: serial.ItemNumber,
            customerId: serial.customer_id,
          }));

          setPurchase(serial.purchase_date ? formatDate(new Date(serial.purchase_date)) : null);
        } else {
          // If no data found, unset the fields
          SetValue((prev) => ({
            ...prev,
            customerName: "",
            productName: "",
            itemNumber: "",
            customerId: "",
          }));
          setPurchase(null);
        }
      })
      .catch((err) => {
        console.log(err);
        // On error, unset the fields
        SetValue((prev) => ({
          ...prev,
          customerName: "",
          productName: "",
          itemNumber: "",
          customerId: "",
        }));
        setPurchase(null);
        setContarctlist([]);
      });
  };


  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {}; // Initialize an empty error object

    const isEmpty = (value) => {
      return value === undefined || value === null || String(value).trim() === '';
    };

    // Text/Email/Number inputs validation
    if (isEmpty(Value.serialNumber)) newErrors.serialNumber = "Serial Number is required.";
    if (isEmpty(Value.itemNumber)) newErrors.itemNumber = "Product Code is required.";
    if (isEmpty(Value.productName)) newErrors.productName = "Product Name is required.";
    if (isEmpty(Value.customerName)) newErrors.customerName = "Customer Name is required.";
    if (isEmpty(Value.customerId)) newErrors.customerId = "Customer Id is required.";
    if (isEmpty(selectedsceme.sceme_name)) newErrors.schemename = "Sceme Name Field is required.";
    if (isEmpty(purchase_date)) newErrors.purchasedate = "Date is required.";
    if (isEmpty(Value.contractamt)) newErrors.contractamt = "Amount is required.";

    // Dropdown validations
    if (!Value.contractType) newErrors.contractType = "Contract Type is required.";
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
      ...Value,
      purchasedate: purchase_date,
      startDate: startDate,
      endDate: enddate,
      schemename : Value.schemename,
      created_by: created_by, // Include created_by for insert
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
              file: Value.file, // Include file in the request
            }, {
              headers: {
                Authorization: token, // Send token in headers
                "Content-Type": "multipart/form-data",
              },
            })
            .then((response) => {
              //window.location.reload();
              setSuccessMessage('Customer Updated Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);

              SetValue({
                serialNumber: "",
                itemNumber: "",
                productName: "",
                customerName: "",
                customerId: "",
                contractNumber: "",
                contractType: "",
                schemename: "",
                goodwillmonth: "",
                duration: "",
                purchasedate: "",
                startDate: "",
                endDate: "",
                contractamt: "",
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
              encryptedData,
              file: Value.file, // Include file in the request
            }, {
              headers: {
                Authorization: token, // Send token in headers
                "Content-Type": "multipart/form-data",
              },
            })
            .then((response) => {
              // window.location.reload();
              SetValue({
                serialNumber: "",
                itemNumber: "",
                productName: "",
                customerName: "",
                customerId: "",
                contractNumber: "",
                contractType: "",
                schemename: "",
                goodwillmonth: "",
                duration: "",
                purchasedate: "",
                startDate: "",
                endDate: "",
                contractamt: "",
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



  const handlefileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      SetValue((prev) => ({ ...prev, file: file }));
    }
  }





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


  const handlestartenddatecalculation = () => {
    const duration = Value.duration ? parseInt(Value.duration, 10) : 0;
    const goodwillMonths = Value.goodwillmonth ? parseInt(Value.goodwillmonth, 10) : 0;

    // Validation: Purchase date
    if (!purchase_date) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        purchasedate: "Please select a purchase date.",
      }));
      return;
    }

    const start = new Date(purchase_date);

    // Step 1: Warranty Expiry = 1 year from purchase date
    const warrantyExpiry = new Date(start);
    warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + 1);

    // Step 2: Contract starts 1 day after warranty
    const contractStartDate = new Date(warrantyExpiry);

    // If duration or goodwillMonths is present, calculate accordingly
    let contractEndDate = new Date(contractStartDate);

    if (duration > 0) {
      contractEndDate.setFullYear(contractEndDate.getFullYear() + duration);
    }

    if (goodwillMonths > 0) {
      // Save day of month to prevent rollover issues (like Feb 30 → Mar 2)
      const day = contractEndDate.getDate();
      contractEndDate.setMonth(contractEndDate.getMonth() + goodwillMonths);
      // Fix if month rollover caused date overflow (e.g., Feb 31 → Mar 3)
      if (contractEndDate.getDate() !== day) {
        contractEndDate.setDate(0); // go to last day of previous month
      }
    }

    // If only goodwillMonths is entered (duration is 0), set end date based on goodwill only
    if (!duration && goodwillMonths > 0) {
      // contractStartDate is after warranty, contractEndDate is contractStartDate + goodwillMonths
      // Already handled above
    }

    // Subtract 1 day from contract end date if any duration or goodwill is present
    if (duration > 0 || goodwillMonths > 0) {
      contractEndDate.setDate(contractEndDate.getDate() - 1);
      setStartDate(formatDate(contractStartDate));
      setEndDate(formatDate(contractEndDate));
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  useEffect(() => {
    if (purchase_date && (Value.duration || Value.goodwillmonth)) {
      handlestartenddatecalculation();
    }
  }, [Value.duration, Value.goodwillmonth, purchase_date]);

  const handleSearchScemeChange = (newValue) => {
    setselectedsceme(newValue);

    SetValue((prev) =>({
      ...prev,
      schemename : newValue.sceme_name
    }))
  };

  const fetchSceme = async () => {
    try {
      const response = await axios.post(`${Base_Url}/getscemesearch`, { param: scemetext }, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setScemedata(response.data)
    }
    catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleInputScemeChange = _debounce((newValue) => {
    console.log(newValue);

    // Update the text state
    setScemeText(newValue);

    // Check if newValue is not blank and has more than 4 words

    fetchSceme();
  }, 100);




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
                        value={Value.serialNumber}
                        onChange={handleChange}
                        placeholder="Enter Serial Number "
                        maxLength={9}
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
                        Item Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="itemNumber"
                        id="ProductcodeInput"
                        value={Value.itemNumber}
                        min={0}
                        onChange={handleChange}
                        placeholder="Enter Product Code  "
                      />
                      {errors.itemNumber && (
                        <small className="text-danger">
                          {errors.itemNumber}
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
                        Item Description<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="productName"
                        id="ServiceproductInput"
                        value={Value.productName}
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
                        value={Value.customerName}
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
                        Customer Id<span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="customerId"
                        id="CustomerMobileInput"
                        value={Value.customerId}
                        onChange={handleChange}
                        placeholder="Enter Customer Id"
                      />
                      {errors.customerId && (
                        <small className="text-danger">
                          {errors.customerId}
                        </small>
                      )}
                    </div>
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="CustomernameInput"
                        className="input-field"
                      >
                        Contract Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="contractNumber"
                        id="ServiceproductInput"
                        value={Value.contractNumber}
                        onChange={handleChange}
                        placeholder="Enter Contract Code "
                        disabled
                      />
                      {/* {errors.contractNumber && (
                        <small className="text-danger">
                          {errors.contractNumber}
                        </small>
                      )} */}
                    </div>

                    <div className="col-3 mb-3">
                      <label htmlFor="contracttypeInput" className="input-field">
                        Contract Type<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="contractType"
                        id="contracttypeInput"
                        value={Value.contractType}
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
                        value={Value.contractamt}
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


                    <hr />
                    <div className="col-3 mb-3">
                      <label
                        htmlFor="SchemenameInput"
                        className="input-field"
                      >
                        Scheme Name <span className="text-danger">*</span>{scheme && <span className="ms-2 text-primary"> Current-({scheme})</span> }
                      </label>
                      <Autocomplete
                        size="small"
                        disablePortal
                        options={scemedata}
                        value={selectedsceme}
                        getOptionLabel={(option) => option.sceme_name}
                        onChange={(e, newValue) => handleSearchScemeChange(newValue)}
                        onInputChange={(e, newInputValue) => handleInputScemeChange(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="Enter Scheme.." variant="outlined" />}
                      />
                      {errors.schemename && (
                        <small className="text-danger">
                          {errors.schemename}
                        </small>
                      )}
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
                        value={Value.goodwillmonth}
                        onChange={(e) => {
                          handleChange(e);
                          // handlestartenddatecalculation(e);
                        }}
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
                        Duration
                      </label>
                      <select
                        className="form-select"
                        name="duration"
                        id="contracttypeInput"
                        value={Value.duration}
                        onChange={(e) => {
                          handleChange(e);

                        }}
                      >
                        <option value="">Select Duration</option>
                        <option value="1">1 Year</option>
                        <option value="2">2 Year</option>
                        <option value="3">3 Year</option>
                        <option value="4">4 Year</option>
                        <option value="5">5 Year</option>
                      </select>
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
                      <label htmlFor="PurchaseDateInput" className="input-field">
                        Purchase Date <span className="text-danger">*</span>
                      </label>
                      <div>
                        <DatePicker
                          selected={purchase_date}
                          onChange={(date) => {
                            handleDateChange3(date);
                          }}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="purchasedate"
                          aria-describedby="PurchaseDateInput"
                        />
                      </div>
                      {errors.purchasedate && (
                        <small className="text-danger">{errors.purchasedate}</small>
                      )}
                    </div>
                    <div className="col-3 mb-3">
                      <label htmlFor="StartDateInput" className="input-field">
                        Contract Start Date
                      </label>
                      <div>
                        <DatePicker
                          selected={startDate}
                          onChange={handleDateChange}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="startDate"
                          aria-describedby="StartDateInput"
                          disabled
                        />
                      </div>
                      {errors.startDate && (
                        <small className="text-danger">{errors.startDate}</small>
                      )}
                    </div>

                    <div className="col-3 mb-3">
                      <label htmlFor="EndDateInput" className="input-field">
                        Contract End Date
                      </label>
                      <div>
                        <DatePicker
                          selected={enddate}
                          onChange={handleDateChange2}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="endDate"
                          aria-describedby="EndDateInput"
                          disabled
                        />
                      </div>
                      {errors.endDate && (
                        <small className="text-danger">{errors.endDate}</small>
                      )}
                    </div>
                    <div className="col-3 mb-3">
                      <label htmlFor="ContrctRemark" className="input-field">
                        Remark
                      </label>
                      <div>
                        <textarea value={Value.ContrctRemark} className="form-control" onChange={handleChange} name="ContrctRemark" id="ContrctRemark" ></textarea>
                      </div>
                    </div>
                    <div className="col-3 mb-3">
                      <label htmlFor="EndDateInput" className="input-field">
                        Attachment
                      </label>
                      {isEditMode && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handlePreviewClick(Value.file_upload)}

                          title="Preview"
                          style={{
                            border: 'none',    // Remove border
                            background: 'transparent',  // Transparent background
                            padding: '0', // Remove padding around the icon
                            marginLeft: '10px'
                          }}
                        >
                          <FaEye style={{ color: 'blue' }} />
                        </button>
                      )}
                      <div>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.eml"
                          name="file"
                          id=""
                          onChange={(e) => {
                            handlefileChange(e)
                          }}
                          placeholder="Enter Goodwill Month"
                        />
                      </div>
                      {errors.endDate && (
                        <small className="text-danger">{errors.endDate}</small>
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
          {previewOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
              }}
              onClick={() => setPreviewOpen(false)}
            >
              <div
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '10px',
                  maxWidth: '90%',
                  maxHeight: '90%',
                  overflow: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  style={{ float: 'right', marginBottom: '10px', background: 'transparent', border: 'none', fontSize: '20px' }}
                  onClick={() => setPreviewOpen(false)}
                >
                  ✖
                </button>

                {previewUrl.endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl}
                    title="Preview PDF"
                    width="600"
                    height="500"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '80vh' }}
                  />
                )}
              </div>
            </div>
          )}

          {contarctlist.length > 0 && <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

              <div className="row">
                <p><span className="text-success" style={{ fontSize: "20px" }}>●</span>Active Contact</p>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th width="3%">#</th>
                    <th width="10%">	Contract Number</th>
                    <th width="15%"> Customer Name</th>
                    <th width="15%">Product Name</th>
                    <th width="15%">Serial Number</th>
                    <th width="15%">Start Date</th>
                    <th width="15%">End Date</th>

                  </tr>
                </thead>
                <tbody>
                  {contarctlist.map((contract, index) => {
                    return (
                      <tr key={index}>
                        <td className={`${contract.status == 'Active' ? 'bg-success text-light' : ''}`}>{index + 1}</td>
                        <td className={`${contract.status == 'Active' ? 'bg-success text-light' : ''}`}>{contract.contractNumber}</td>
                        <td className={`${contract.status == 'Active' ? 'bg-success text-light' : ''}`}>{contract.customerName}</td>
                        <td className={`${contract.status == 'Active' ? 'bg-success text-light' : ''}`}>{contract.productName}</td>
                        <td className={`${contract.status == 'Active' ? 'bg-success text-light' : ''}`}>{contract.serialNumber}</td>
                        <td className={`${contract.status == 'Active' ? 'bg-success text-light' : ''}`}>{new Date(contract.startDate).toLocaleDateString('en-GB')}</td>
                        <td className={`${contract.status == 'Active' ? 'bg-success text-light' : ''}`}>{new Date(contract.endDate).toLocaleDateString('en-GB')}</td>
                      </tr>
                    )
                  }
                  )}

                </tbody>
              </table>
            </div>
          </div>}
        </div>
      </div> : null}
    </div>
  );
};

export default Servicecontract;
