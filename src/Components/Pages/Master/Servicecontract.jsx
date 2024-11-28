import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import { Navigate, useParams } from "react-router-dom";
import Servicecontracttabs from "./Servicecontracttabs";

const Servicecontract = () => {
  // Step 1: Add this state to track errors
  const { serviceid } = useParams();
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
  const createdBy = 1; // Static value for created_by
  const updatedBy = 2; // Static value for updated_by

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
      const response = await axios.get(`${Base_Url}/getservicecontract`,{
        headers: {
            Authorization: token, // Send token in headers
            }, 
        });
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const fetchservicecontractpopulate = async (serviceid) => {

    try {
      const response = await axios.get(`${Base_Url}/getservicecontractpopulate/${serviceid}`,{
        headers: {
            Authorization: token, // Send token in headers
            }, 
        });
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

    setDuplicateError(""); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include 'updated_by'
          await axios
            .put(`${Base_Url}/putservicecontract`, {
              ...formData,
              updated_by: updatedBy,
            },{
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
              ...formData,
              created_by: createdBy,
            },{
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
            const response = await axios.post(`${Base_Url}/deleteservicecontract`, { id },{
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
      const response = await axios.get(`${Base_Url}/requestservicecontract/${id}`,{
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

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="tab-content">
      <Servicecontracttabs />
      <div className="row mp0">
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
                        Customer Name
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
                       Customer Mobile No <input type="checkbox" />Whatsapp
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
                        maxLength="15"
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
                        Contract Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="contractNumber"
                        id="ServiceproductInput"
                        value={formData.contractNumber}
                        onChange={handleChange}
                        placeholder="Enter Contract Number "
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
                        Contract Type
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
                  </div>
                  <div className="row">

                    <div className="col-3 mb-3">
                      <label
                        htmlFor="CustomernameInput"
                        className="input-field"
                      >
                        Product Name
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
                        Serial Number
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
                    <div className="col -3 mb-3">
                      <label htmlFor="StartDateInput" className="input-field">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        id="StartDateInput"
                        value={formData.startDate}
                        onChange={handleChange}
                        placeholder="Select Start Date"
                      />
                      {errors.startDate && (
                        <small className="text-danger">{errors.startDate}</small>
                      )}
                    </div>
                    <div className="col-3 mb-3">
                      <label htmlFor="EndDateInput" className="input-field">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        id="EndDateInput"
                        value={formData.endDate}
                        onChange={handleChange}
                        placeholder="Select End Date"
                      />
                      {errors.endDate && (
                        <small className="text-danger">{errors.endDate}</small>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <button className="btn btn-liebherr" type="submit">
                      {isEdit ? "Update" : "Submit"}
                    </button>
                  </div>
                </form>


                {/* <div className="col-md-6">
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
                </div>

                {/* Adjust table padding and spacing 
                <table
                  className="table table-bordered table dt-responsive nowrap w-100 table-css"
                  style={{ marginTop: "20px", tableLayout: "fixed" }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        #
                      </th>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        Service Product
                      </th>
                      <th style={{ padding: "0px 0px", textAlign: "center" }}>
                        Edit
                      </th>
                      <th style={{ padding: "0px 0px", textAlign: "center" }}>
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: "2px", textAlign: "center" }}>
                          {index + 1 + indexOfFirstUser}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {item.Serviceproduct}
                        </td>
                        <td style={{ padding: "0px", textAlign: "center" }}>
                          <button
                            className="btn"
                            onClick={() => {
                              // alert(item.id)
                              edit(item.id);
                            }}
                            Serviceproduct="Edit"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "blue",
                              fontSize: "20px",
                            }}
                          >
                            <FaPencilAlt />
                          </button>
                        </td>
                        <td style={{ padding: "0px", textAlign: "center" }}>
                          <button
                            className="btn"
                            onClick={() => deleted(item.id)}
                            Serviceproduct="Delete"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "red",
                              fontSize: "20px",
                            }}
                          >
                            <FaTrash />
                          </button>
                        </td>
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
                        length: Math.ceil(filteredUsers.length / itemsPerPage),
                      },
                      (_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={currentPage === index ? "active" : ""}
                        >
                          {index + 1}
                        </button>
                      )
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
                </div>
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </div></div>
  );
};

export default Servicecontract;
