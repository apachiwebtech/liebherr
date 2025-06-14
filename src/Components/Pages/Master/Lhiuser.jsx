import CryptoJS from 'crypto-js';
import axios from "axios";
import * as XLSX from "xlsx";
import md5 from 'js-md5';
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash, FaEye } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { Navigate } from "react-router-dom";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import Lhiusertabs from './Lhiusertabs';
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { MultiSelect } from 'react-multi-select-component';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Checkbox from '@mui/material/Checkbox';
const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const Lhiuser = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const [roles, setRoles] = useState([]);
  const [Reporting_to, setReporting] = useState([]);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [cspvalue, setCspvalue] = useState()
  const [csp, setCsp] = useState([])
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const createdBy = 1; // Static value for created_by
  const updatedBy = 2; // Static value for updated_by
  const [open, setOpen] = React.useState(false);
  const [usercode, setUsercode] = React.useState('');
  const [uid, setUid] = React.useState('');

  const handleClickOpen = (usercode) => {
    setOpen(true);
    setUsercode(usercode);

    axios
      .post(`${Base_Url}/getlhiassigncsp`, { Usercode: usercode }, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        // console.log(res.data);
        const data = res.data[0]?.assigncsp;

        if (data) {
          const array = data.split(","); // Convert CSV to array
          setSelected(array);
        } else {
          setSelected([]); // Handle empty data case
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  };


  // console.log(selected, "#$%^&")

  const handleClose = () => {
    setOpen(false);
  };

  const onhandleSearch = (e) => {
    setSearch(e.target.value)
  }

  const oncheckchnage = (e) => {

    const code = e.target.value;


    const { value, checked } = e.target;

    setSelected((prevSelected) =>
      checked ? [...prevSelected, value] : prevSelected.filter((item) => item !== value)
    );


    axios.post(`${Base_Url}/updatecspcode`, { licare_code: code, Usercode: usercode, checked: String(checked) }, {
      headers: {
        Authorization: token
      }
    })
      .then((res) => {
        // console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })

  }

  const [formData, setFormData] = useState({
    Lhiuser: "",
    Usercode: "",
    // password: "",
    mobile_no: "",
    email: "",
    status: "",
    remarks: "",
    Role: "",
    Designation: "",
    Reporting_to: "",
    employee_type: ""
    // assigncsp: "",
  });



  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getrole`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));


      setRoles(decryptedData);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchCsp = async () => {

    const ressponse = await axiosInstance.get(`${Base_Url}/getcsp`, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        // setCsp(
        //   res.data.map(item => ({ label: item.title, value: item.id, licare_code: item.licare_code }))
        // );
        setCsp(res.data)
      })
      .catch((err) => {
        console.log(err)
      })

  }



  const fetchReporting = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getreport`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

      setReporting(decryptedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getlhidata`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

      setUsers(decryptedData);
      setFilteredUsers(decryptedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchReporting();
    fetchCsp();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };


  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter(
      (user) => user.Lhiuser && user.Lhiuser.toLowerCase().includes(value) ||
        user.Usercode && user.Usercode.toLowerCase().includes(value) ||
        user.role_title && user.role_title.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };



  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};  // Initialize the errors object

    if (!formData.Lhiuser || !formData.Lhiuser.trim()) {
      newErrors.Lhiuser = "Lhiuser Field is required.";
    }

    // if (!formData.password || !formData.password.trim()) {
    //   newErrors.password = "password Field is required.";
    // }
    // if (!formData.mobile_no || !formData.mobile_no.trim()) {
    //   newErrors.mobile_no = "Mobile Number Field is required.";
    // }
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email Field is required.";
    }
    if (!formData.Role || !formData.Role.trim()) {
      newErrors.Role = "Role Field is required.";
    }
    if (!formData.employee_type || !formData.employee_type.trim()) {
      newErrors.employee_type = "Type is required.";
    }




    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      return true;  // If no errors, form is valid
    } else {
      return false;  // If there are errors, form is invalid
    }
  };


  //handlesubmit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    const newErrors = {};
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = Object.fromEntries(
      Object.entries({
        ...formData,
        updated_by: updatedBy,
        created_by: createdBy
      }).map(([key, value]) => [key, String(value)])
    );


    // console.log(payload, 'data')

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    if (validateForm()) {


      setDuplicateError(""); // Clear duplicate error before submitting

      try {
        const confirmSubmission = window.confirm(
          "Do you want to submit the data?"
        );
        if (confirmSubmission) {
          if (isEdit) {
            // For update, include 'updated_by'
            await axios
              .post(`${Base_Url}/putlhidata`, { encryptedData },
                {
                  headers: {
                    Authorization: token, // Send token in headers
                  },
                })
              .then((response) => {
                alert("User Updated")
                setFormData({
                  Lhiuser: "",
                  Usercode: "",
                  mobile_no: "",
                  email: "",
                  status: "",
                  remarks: "",
                  Role: "",
                  Designation: "",
                  Reporting_to: "",
                  employee_type: ""

                });
                fetchUsers();
                fetchCsp();
                setIsEdit(false);
              })
              .catch((error) => {
                if (error.response && error.response.status === 409) {
                  setDuplicateError("Duplicate entry, Email already exists!"); // Show duplicate error for update
                }
              });
          } else {
            // For insert, include 'created_by'
            await axios
              .post(`${Base_Url}/postlhidata`, {
                encryptedData

              },
                {
                  headers: {
                    Authorization: token, // Send token in headers
                  },
                })
              .then((response) => {

                alert("User Added");
                setCspvalue('');
                setFormData({
                  Lhiuser: "",
                  Usercode: "",
                  mobile_no: "",
                  email: "",
                  status: "",
                  remarks: "",
                  Role: "",
                  Designation: "",
                  Reporting_to: "",
                  employee_type: ""
                });
                fetchUsers();
                fetchCsp();

              })
              .catch((error) => {
                if (error.response && error.response.status === 409) {
                  setDuplicateError("Duplicate entry, Email already exists!"); // Show duplicate error for insert
                }
              });
          }
        }
      } catch (error) {
        console.error("Error during form submission:", error);
      }
    }
  };


  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestlhidata/${id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      const code = response.data.Usercode;

      const extractedCode = code.split("-")[1];

      setUid(response.data.id)

      setFormData({
        Lhiuser: response.data.Lhiuser,
        Usercode: response.data.Usercode,
        mobile_no: response.data.mobile_no,
        email: response.data.email,
        status: response.data.status,
        remarks: response.data.remarks,
        Role: response.data.Role,
        Designation: response.data.Designation,
        Reporting_to: response.data.Reporting_to,
        id: response.data.id,
        employee_type: extractedCode
      });

      const userData = response.data;

      // Split the assigncsp values (comma-separated licare_codes)
      const selectedLicareCodes = userData.assigncsp ? userData.assigncsp.split(',') : [];

      // console.log(selectedLicareCodes, "selected")



      // Map the selected licare_codes to the corresponding options in the csp array
      // const selectedOptions = csp.filter(option => selectedLicareCodes.includes(option.licare_code));

      // Set the selected options in state
      // setSelected(selectedOptions);
      // setCspvalue(userData.assigncsp);

      setIsEdit(true);


    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  const handleChangestatus = async (e) => {
    try {
      const dataId = e.target.getAttribute('data-id');

      const response = await axiosInstance.post(`${Base_Url}/updatestatus`, { dataId: dataId }, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      fetchUsers();

    } catch (error) {
      console.error("Error editing user:", error);
    }

  };




  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);


  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

    return `${day}-${month}-${year}`;
  };

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();



    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      "Name": user.Lhiuser,
      "UserCode": user.Usercode, // Add fields you want to export
      "MobileNumber": user.mobile_no,
      "Email": user.email,
      "Remarks": user.remarks,
      "Designation ": user.designation,
      "Roles": user.Role,
      "ReportingTo": user.Reporting_to,
      "Activation Date": formatDate(user.activation_date),
      "DeActivationDate": formatDate(user.deactivation_date),
      "AssignCsp": user.assigncsp
    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lhi Users");

    // Export the workbook
    XLSX.writeFile(workbook, "LHIUSERS.xlsx");
  };

  // export to excel end 

  // Role Right 


  const Decrypt = (encrypted) => {
    encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
  };

  const storedEncryptedRole = localStorage.getItem("Userrole");
  const decryptedRole = Decrypt(storedEncryptedRole);

  const roledata = {
    role: decryptedRole,
    pageid: String(27)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 


  return (
    <div className="tab-content">
      {roleaccess > 1 ? <div className="row mp0">
        {loaders && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SyncLoader loading={loaders} color="#FFFFFF" />
          </div>
        )}
        <Lhiusertabs />
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mp0">
                <form
                  onSubmit={handleSubmit}

                  className="text-left col-md-5"
                >
                  <div className="row ">
                    {/*  */}
                    <div className="col-4">


                      <div className="mb-3">
                        <label htmlFor="LhiuserInput" className="input-field">
                          FullName<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="Lhiuser"
                          id="LhiuserInput"
                          value={formData.Lhiuser}
                          onChange={handleChange}
                          placeholder="Enter FullName "
                        />
                        {errors.Lhiuser && (
                          <small className="text-danger">{errors.Lhiuser}</small>
                        )}

                      </div>

                    </div>
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="UsercodeInput" className="input-field">
                          User Code<span className="text-danger"></span>
                        </label>
                        <input disabled
                          type="text"
                          className="form-control"
                          name="Usercode"
                          id="UsercodeInput"
                          value={formData.Usercode}
                          onChange={handleChange}
                          placeholder="Enter User Code"
                        />
                        {errors.Usercode && (
                          <small className="text-danger">{errors.Usercode}</small>
                        )}

                      </div>
                    </div>

                    {/* <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="PassInput" className="input-field">
                          password<span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          id="PassInput"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter password "
                        />
                        {errors.password && (
                          <small className="text-danger">{errors.password}</small>
                        )}
                        {duplicateError && (
                          <small className="text-danger">{duplicateError}</small>
                        )}{" "}
                 
                      </div>
                    </div> */}
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="DesignationInput" className="input-field">
                          Designation
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="Designation"
                          id="DesignationInput"
                          value={formData.Designation}
                          onChange={handleChange}
                          placeholder="Enter Designation "
                        />
                        {errors.Designation && (
                          <small className="text-danger">{errors.Designation}</small>
                        )}

                      </div>

                    </div>
                  </div>

                  <div className="row ">
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="MobileInput" className="input-field">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="mobile_no"
                          id="MobileInput"
                          value={formData.mobile_no}
                          onChange={handleChange}
                          placeholder="Enter Mobile Number"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          minLength="10"
                        />


                        {errors.mobile_no && <small className="text-danger">{errors.mobile_no}</small>}
                        {/* Show duplicate error */}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="EmailInput" className="input-field">
                          Email Address<span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          id="EmailInput"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter Email Address"
                        />
                        {errors.email && (
                          <small className="text-danger">{errors.email}</small>
                        )}
                        {duplicateError && (
                          <small className="text-danger">{duplicateError}</small>
                        )}{" "}
                        {/* Show duplicate error */}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="StatusInput" className="input-field">
                          Status
                        </label>
                        <select
                          className="form-select"
                          id="StatusInput"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value=''>Select Status</option>
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row ">
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="Role" className="form-label pb-0 dropdown-label"
                        > Roles<span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select dropdown-select"
                          name="Role"
                          value={formData.Role}
                          onChange={handleChange}
                        >
                          <option value="">Select Role</option>
                          {roles.map((Role) => (
                            <option key={Role.id} value={Role.id}>
                              {Role.title}
                            </option>
                          ))}
                        </select>

                        {errors.Role && (
                          <small className="text-danger">{errors.Role}</small>
                        )}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="Reporting_to" className="form-label pb-0 dropdown-label"
                        > Reporting To<span className="text-danger"></span>
                        </label>
                        <select
                          className="form-select dropdown-select"
                          name="Reporting_to"
                          value={formData.Reporting_to}
                          onChange={handleChange}
                        >
                          <option value="">Reporting To</option>
                          {Reporting_to.map((Reporting_to) => (
                            <option key={Reporting_to.id} value={Reporting_to.id}>
                              {Reporting_to.Lhiuser}
                            </option>
                          ))}
                        </select>
                        {errors.Repoting_to && (
                          <small className="text-danger">{errors.Reporting_to}</small>
                        )}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="Reporting_to" className="form-label pb-0 dropdown-label"
                        > Employee Type<span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select dropdown-select ${uid ? "bg-secondary-subtle" : "bg-light"}`}
                          name="employee_type"
                          value={formData.employee_type}
                          onChange={handleChange}
                          disabled={uid ? true : false}
                        >
                          <option value="">Select</option>
                          <option value='EMP'>Employee</option>
                          <option value='FSD'>Employee-SD</option>
                          <option value='CCA'>Employee-CCA</option>
                        </select>
                        {errors.employee_type && (
                          <small className="text-danger">{errors.employee_type}</small>
                        )}
                      </div>
                    </div>



                    {/* <div className="col-4">
                      <div className="mb-3">
                        <label htmlFor="LhiuserInput" className="input-field">
                          Assign Csp <span className="text-danger">*</span>
                        </label>
                        <MultiSelect options={csp} value={selected}
                          onChange={(value) => handleselect(value)}
                          labelledBy='Select All' name="selected"
                          closeOnSelect={false}
                          isClearable={true} ></MultiSelect>
                      </div>
                    </div> */}

                  </div>
                  <div className='row'>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="RemarksInput" className="input-field">
                          Remarks
                        </label>
                        <textarea
                          className="form-control"
                          id="RemarksInput"
                          name="remarks"
                          rows="2"
                          value={formData.remarks}
                          onChange={handleChange}
                          placeholder="Enter remarks here"
                        />
                      </div>
                    </div>
                  </div>
                  {roleaccess > 2 ? <div className="text-right">
                    <button className="btn btn-liebherr" type="submit">
                      {isEdit ? "Update" : "Submit"}
                    </button>
                  </div> : null}
                </form>






                <div className="col-md-7">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>
                      Show
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="form-control d-inline-block"
                        style={{
                          width: "51px",
                          display: "inline-block",
                          marginLeft: "5px",
                          marginRight: "5px",
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </select>
                      entries
                    </span>

                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="form-control d-inline-block"
                      style={{ width: "300px" }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={exportToExcel}
                    >
                      Export to Excel
                    </button>
                  </div>

                  {/* Adjust table padding and spacing */}
                  <table
                    className="table table-bordered table dt-responsive nowrap w-100 table-css"
                    style={{ marginTop: "20px", tableLayout: "fixed" }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: '50px', textAlign: "center" }}>
                          #
                        </th>
                        <th style={{ width: '20%', textAlign: "center" }}>
                          Usercode
                        </th>

                        <th style={{ width: '20%', textAlign: "center" }}>
                          Full Name
                        </th>

                        <th style={{ padding: "12px 0px", textAlign: "center" }}>
                          Roles
                        </th>

                        {roleaccess > 3 ? <th style={{ width: '80px', textAlign: "center" }}>
                          Status
                        </th> : null}


                        {roleaccess > 3 ? <th style={{ width: '80px', textAlign: "center" }}>
                          Edit
                        </th> : null}

                        {roleaccess > 3 ? <th style={{ width: '80px', textAlign: "center" }}>
                          Assign Csp
                        </th> : null}

                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ padding: "2px", textAlign: "center" }}>
                            {index + 1 + indexOfFirstUser}
                          </td>

                          <td style={{ padding: "10px" }}>{item.Usercode}</td>

                          <td style={{ padding: "10px" }}>{item.Lhiuser}</td>
                          <td style={{ padding: "10px" }}>{item.role_title}</td>

                          {roleaccess > 3 ? <td style={{ padding: "10px" }}>
                            <label class="switch">
                              <input
                                type="checkbox"
                                onChange={handleChangestatus}
                                data-id={item.id}
                                checked={item.status == 1 ? 'checked' : ''}
                                className="status"
                              />


                              <span class="slider round"></span>
                            </label>

                          </td> : null}



                          {roleaccess > 3 ? <td style={{ padding: "0px", textAlign: "center" }}>
                            <button
                              className="btn"
                              onClick={() => {
                                // alert(item.id)
                                edit(item.id);
                              }}
                              Lhiuser="Edit"
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                color: "blue",
                                fontSize: "20px",
                              }}
                            >
                              <FaPencilAlt />
                            </button>
                          </td> : null}

                          {roleaccess > 3 ?
                            <td style={{ padding: "0px", textAlign: "center" }}>
                              <button
                                className="btn"
                                onClick={() => handleClickOpen(item.Usercode)}
                                Lhiuser="Edit"
                                style={{
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: "blue",
                                  fontSize: "20px",
                                }}
                              >
                                <RemoveRedEyeIcon />
                              </button>
                            </td> : null}

                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div
                    className="d-flex justify-content-between"
                    style={{ marginTop: "10px" }}
                  >
                    <div>
                      Showing {indexOfFirstUser + 1} to{" "}
                      {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                      {filteredUsers.length} entries
                    </div>

                    <div className="pagination" style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        {"<"}
                      </button>
                      {Array.from(
                        {
                          length: Math.min(3, Math.ceil(filteredUsers.length / itemsPerPage)), // Limit to 3 buttons
                        },
                        (_, index) => {
                          const pageIndex = Math.max(0, currentPage - 1) + index; // Adjust index for sliding window
                          if (pageIndex >= Math.ceil(filteredUsers.length / itemsPerPage)) return null; // Skip invalid pages

                          return (
                            <button
                              key={pageIndex}
                              onClick={() => setCurrentPage(pageIndex)}
                              className={currentPage === pageIndex ? "active" : ""}
                            >
                              {pageIndex + 1}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={
                          currentPage ===
                          Math.ceil(filteredUsers.length / itemsPerPage) - 1
                        }
                      >
                        {">"}
                      </button>
                    </div>
                    <BootstrapDialog
                      onClose={handleClose}
                      aria-labelledby="customized-dialog-title"
                      open={open}
                    >
                      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        Assign Csp
                      </DialogTitle>
                      <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={(theme) => ({
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          color: theme.palette.grey[500],

                        })}
                      >
                        <CloseIcon />
                      </IconButton>
                      <DialogContent dividers sx={{ width: "500px" }}>
                        <div>
                          <div className='mx-2 pb-5 '>
                            <input className='p-2 ' style={{ width: "400px", backgroundColor: "white" }} type='text' placeholder='Search CSP' name='searchbox' onChange={onhandleSearch} value={search} />
                          </div>
                          {csp.filter((item => item.title.toLowerCase().includes(search.toLowerCase()) ||
                            item.licare_code.toLowerCase().includes(search.toLowerCase()))).map((item, index) => {
                              return (
                                <div>
                                  <p key={index} > <Checkbox value={item.licare_code} onChange={oncheckchnage} checked={selected.includes(item.licare_code)}  {...label} /> {item.title}-{item.licare_code}</p>
                                </div>
                              )
                            })}
                        </div>
                      </DialogContent>
                      <DialogActions>
                        <Button autoFocus onClick={handleClose}>
                          Save changes
                        </Button>
                      </DialogActions>
                    </BootstrapDialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default Lhiuser;
