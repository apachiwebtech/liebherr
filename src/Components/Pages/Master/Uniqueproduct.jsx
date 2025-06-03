import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import Endcustomertabs from "./Endcustomertabs";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { IoArrowBack } from "react-icons/io5";
import Select from "react-select";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Uniqueproduct = () => {
  const { customer_id } = useParams();
  const { loaders, axiosInstance } = useAxiosLoader();
  const [errors, setErrors] = useState({});
  //   const [Customerlocation, setCustomerlocation] = useState({});
  const [product, setProduct] = useState([]);
  const [Model, setModel] = useState([]);
  const [CustomerAddress, setCustomerAddress] = useState([]);
  const [newCustomerAddress, setnewCustomerAddress] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    id: "",
    product: "",
    address: "",
    purchase_date: "",
    serial_no: "",
    CustomerID: customer_id,
    CustomerName: "",
    SerialStatus: "",
    customer_id: "",
    newaddress: "",
    ItemNumber: ""
  });


  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const purchase_date = new Date(dateString);
    const day = String(purchase_date.getDate()).padStart(2, "0");
    const month = String(purchase_date.getMonth() + 1).padStart(2, "0");
    const year = purchase_date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format date for input field (MM/DD/YYYY)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const purchase_date = new Date(dateString);
    const month = String(purchase_date.getMonth() + 1).padStart(2, "0");
    const day = String(purchase_date.getDate()).padStart(2, "0");
    const year = purchase_date.getFullYear();
    return `${year}-${month}-${day}`; // This format works with the date input
  };

  const fetchCustomerlocationById = async (customer_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/fetchcustomerlocationByCustomerid/${customer_id}`, {
        headers: {
          Authorization: token,
        },
      });

      if (Array.isArray(response.data)) {
        setCustomerAddress(response.data); // Handle as array
      } else if (response.data && typeof response.data === 'object') {
        setCustomerAddress([response.data]); // Wrap single object in an array
      } else {
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error("Error fetching customer location by ID:", error);
    }
  };

  const newfetchCustomerlocationById = async (customer_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/fetchcustomerlocationByCustomerid/${customer_id}`, {
        headers: {
          Authorization: token,
        },
      });

      if (Array.isArray(response.data)) {
        setnewCustomerAddress(response.data); // Handle as array
      } else if (response.data && typeof response.data === 'object') {
        setnewCustomerAddress([response.data]); // Wrap single object in an array
      } else {
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error("Error fetching customer location by ID:", error);
      setnewCustomerAddress([])
    }
  };


  const fetchProduct = async (customer_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getproductunique/${customer_id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchModelno = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/product_master`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setModel(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {

    if (customer_id) {
      fetchProduct(customer_id);
      fetchCustomerlocationById(customer_id);
    }
    fetchModelno();
  }, [customer_id]);

  const [isProductDisabled, setIsProductDisabled] = useState(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // When serial number is entered, fetch model number
    if (name === "serial_no" && value.trim() !== "") {
      try {
        const response = await fetch(`${Base_Url}/getserial/${value}`, {
          method: "GET",
          headers: {
            Authorization: token, // Replace with your authentication token if needed
          },
        });

        const data = await response.json();

        if (data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            product: data.data[0].ModelNumber, // Auto-fill product field with ModelNumber
            ItemNumber: data.data[0].ItemNumber, // Auto-fill product field with ModelNumber
          }));
          setIsProductDisabled(true);
        } else {
          setFormData((prev) => ({
            ...prev,
            product: "", // Clear product field if no match is found
          }));
          setIsProductDisabled(false);
        }
      } catch (error) {
        console.error("Error fetching serial number details:", error);
        setIsProductDisabled(false);
      }
    }

    if (name == 'customer_id') {
      newfetchCustomerlocationById(value)
    }
  };




  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.product.trim()) {
      newErrors.product = "Product Name Field is required.";
    }
    if (!formData.purchase_date) {
      newErrors.purchase_date = "Date Field is required.";
    }
    if (!formData.address) {
      newErrors.address = "Location Field is required.";
    }
    if (!formData.serial_no) {
      newErrors.serial_no = "Serial Number Field is required.";
    }
    if (!formData.SerialStatus) {
      newErrors.SerialStatus = "Status Is Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  //handlesubmit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // const payload = {
    //   ...formData,
    //   CustomerID: customer_id,
    // }

    const payload = Object.fromEntries(
      Object.entries({
        ...formData,
        CustomerID: customer_id
      }).map(([key, value]) => [key, String(value)])
    );
    console.log(payload, 'test')
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


          // For update, include duplicate check
          await axios
            .post(`${Base_Url}/putproductunique`, { encryptedData }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              setFormData({
                product: "",
                address: "",
                purchase_date: "",
                serial_no: "",
                SerialStatus: "",
                CustomerID: customer_id,
              });
              fetchProduct(customer_id);
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Product with same serial number already exists!");
              } else {
                console.error("Unexpected Error:", error.response?.data || error.message);
                alert("Something went wrong while updating. Please try again.");
              }
            });
        } else {
          // For insert, include duplicate check
          await axios
            .post(`${Base_Url}/postproductunique`, { encryptedData }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              setFormData({
                product: "",
                address: "",
                purchase_date: "",
                serial_no: "",
                SerialStatus: "",
              });
              fetchProduct(customer_id);
              setIsProductDisabled(false);
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Product with same serial number already exists!"
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
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (confirm) {
      try {
        const response = await axiosInstance.post(`${Base_Url}/deleteproductunique`, { id: String(id) }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
        fetchProduct(customer_id);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/requestproductunique/${id}`
        , {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      const formattedDate = formatDateForInput(response.data.purchase_date);

      const editData = {
        id: response.data.id,
        serial_no: response.data.serial_no,
        product: response.data.ModelNumber,
        purchase_date: formattedDate,
        address: response.data.address,
        SerialStatus: response.data.SerialStatus,
        ItemNumber: response.data.ModelName,
      };

      setFormData(editData);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  // Role Right 

  const handletransfer = () => {

    if (formData.SerialStatus == 'Active') {
      const payload = {
        serial_no: formData.serial_no,
        customer_id: formData.customer_id,
        Modelno: formData.product,
        product_id: String(formData.id),
        newaddress: formData.newaddress,
        oldcustid: formData.CustomerID,
        ItemNumber: formData.ItemNumber
      }

      axios.post(`${Base_Url}/transferproduct`, payload, {
        headers: {
          Authorization: token
        }
      })
        .then((res) => {
          alert("Data Submitted")
          setOpen(false)
          setFormData(prev => ({
            ...prev,
            newaddress: '',
            customer_id: '',
          }))
        })
    } else {
      alert("Serial status is inactive")
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
    pageid: String(17)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End

  return (
    <div className="tab-content">
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mt-1 mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body">
              <IoArrowBack onClick={() => navigate(-1)} style={{ fontSize: "25px", cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div> : null}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body">
              <div className="row mp0">
                <h2 className="pname" style={{ fontSize: "20px" }}>Cutomer Products:</h2>
                <hr></hr>
                <div className="col-4">
                  <form onSubmit={handleSubmit}>
                    <div className="row">

                      <div className="col-md-6 mb-3">
                        <label htmlFor="snumber" className="form-label">
                          Serial Number<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="snumber"
                          name="serial_no"
                          value={formData.serial_no}
                          onChange={handleChange}
                          aria-describedby="snumber"
                        />
                        {errors.serial_no && (
                          <small className="text-danger">{errors.serial_no}</small>
                        )}
                        {duplicateError && (
                          <small className="text-danger">{duplicateError}</small>
                        )}
                      </div>


                      <div className="col-md-6 mb-3">
                        <label htmlFor="pdate" className="form-label">
                          Purchase Date<span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          name="purchase_date"
                          className="form-control"
                          id="pdate"
                          value={formData.purchase_date}
                          onChange={handleChange}
                          aria-describedby="pdate"
                        />
                        {errors.purchase_date && (
                          <small className="text-danger">{errors.purchase_date}</small>
                        )}
                      </div>

                      <div className="col-md-8 mb-3">
                        <label htmlFor="pname" className="form-label">
                          Product<span className="text-danger">*</span>
                        </label>

                        {isProductDisabled ? (
                          // Render input field when disabled
                          <input
                            type="text"
                            className="form-control"
                            value={formData.product}
                            readOnly // Prevent editing
                          />
                        ) : (
                          // Render Select dropdown when enabled
                          <Select
                            options={
                              Model && Model.length > 0
                                ? Model.map((item) => ({
                                  value: item.item_description,
                                  label: item.item_description,
                                }))
                                : []
                            }
                            isSearchable
                            onChange={(selectedOption) =>
                              setFormData({ ...formData, product: selectedOption.value })
                            }
                            value={
                              formData.product
                                ? { value: formData.product, label: formData.product }
                                : null
                            }
                            placeholder="Select Product"
                          />
                        )}

                        {errors.product && <small className="text-danger">{errors.product}</small>}
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label htmlFor="StatusInput" className="input-field">
                            Serial Status
                          </label>
                          <select
                            className="form-select"
                            id="StatusInput"
                            name="SerialStatus"
                            value={formData.SerialStatus}
                            onChange={handleChange}
                          >
                            <option value=''>Select Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                          {errors.SerialStatus && (
                            <small className="text-danger">{errors.SerialStatus}</small>
                          )}
                        </div>
                      </div>


                      <div className="col-md-12 mb-3">
                        <label htmlFor="country" className="form-label pb-0 dropdown-label">
                          Customer Address<span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select dropdown-select"
                          name="address"
                          value={formData.address}
                          onChange={(e) => handleChange(e)}
                        >
                          <option value="">Select Customer Address</option>
                          {CustomerAddress.length > 0 ? (
                            CustomerAddress.map((cust_add, index) => (
                              <option
                                key={index}
                                value={cust_add.address}
                                data-customername={cust_add.customername}
                              >
                                {cust_add.address}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No addresses available
                            </option>
                          )}
                        </select>

                        {errors.address && (
                          <small className="text-danger">{errors.address}</small>
                        )}
                      </div>

                      {roleaccess > 4 && <div onClick={handleClickOpen} style={{ textDecoration: "underline", cursor: "pointer" }}>
                        Serial number transfer
                      </div>}

                      <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle id="alert-dialog-title">
                          {"Serial number transfer"}
                        </DialogTitle>
                        <DialogContent style={{ width: "600px" }}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="snumber" className="form-label">
                                Customer Id<span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="snumber"
                                name="customer_id"
                                value={formData.customer_id}
                                onChange={handleChange}
                                aria-describedby="snumber"
                              />
                              {errors.customer_id && (
                                <small className="text-danger">{errors.customer_id}</small>
                              )}

                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="snumber" className="form-label">
                                Serial No<span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="snumber"
                                name="serial_no"
                                value={formData.serial_no}
                                onChange={handleChange}
                                aria-describedby="snumber"
                                disabled
                              />
                              {errors.serial_no && (
                                <small className="text-danger">{errors.serial_no}</small>
                              )}

                            </div>
                            <div className="col-md-12 mb-3">
                              <label htmlFor="country" className="form-label pb-0 dropdown-label">
                                Customer Address<span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-select dropdown-select"
                                name="newaddress"
                                value={formData.newaddress}
                                onChange={(e) => handleChange(e)}
                              >
                                <option value="">Select Customer Address</option>
                                {newCustomerAddress.length > 0 ? (
                                  newCustomerAddress.map((cust_add, index) => (
                                    <option
                                      key={index}
                                      value={cust_add.id}
                                      data-customername={cust_add.customername}
                                    >
                                      {cust_add.address}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>
                                    No addresses available
                                  </option>
                                )}
                              </select>

                              {errors.newaddress && (
                                <small className="text-danger">{errors.newaddress}</small>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleClose} autoFocus>
                            Close
                          </Button>
                          <Button onClick={handletransfer}>Submit</Button>
                        </DialogActions>
                      </Dialog>


                      {roleaccess > 2 ? <div className="col-md-12 text-right">
                        <button
                          className="btn btn-liebherr"
                          type="submit"
                          style={{ marginTop: "15px" }}
                        >
                          {isEdit ? "Update" : "Submit"}
                        </button>
                      </div> : null}
                    </div>
                  </form>
                </div>
                <div className="col-8">
                  <table
                    className="table table-bordered table dt-responsive nowrap w-100"
                    id="basic-datatable"
                  >
                    <thead>
                      <tr>
                        <th scope="col" width="10%">
                          #
                        </th>
                        <th scope="col">Purchase Date</th>
                        <th scope="col">Product Name</th>
                        <th scope="col">Serial No.</th>
                        <th scope="col">Delivered Location</th>
                        {roleaccess > 3 ? <th
                          scope="col"
                          width="15%"
                          style={{ textAlign: "center" }}
                        >
                          Edit
                        </th> : null}
                        {roleaccess > 4 ? <th
                          scope="col"
                          width="15%"
                          style={{ textAlign: "center" }}
                        >
                          Delete
                        </th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {product.map((item, index) => (
                        <tr key={item.id}>
                          <th scope="row">{index + 1}</th>
                          <td>{formatDate(item.purchase_date)}</td>
                          <td>{item.ModelNumber}</td>
                          <td>{item.serial_no}</td>
                          <td>{item.address}</td>
                          {roleaccess > 3 ? <td className="text-center">
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => edit(item.id)}
                              title="Edit"

                            >
                              <FaPencilAlt />
                            </button>
                          </td> : null}
                          {roleaccess > 4 ? <td className="text-center">
                            <button
                              className="btn btn-link text-danger"
                              onClick={() => deleted(item.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td> : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default Uniqueproduct;
