import axios from "axios";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import Endcustomertabs from "./Endcustomertabs";

const Uniqueproduct = () => {
  const { customer_id } = useParams();

  const [errors, setErrors] = useState({});
  //   const [Customerlocation, setCustomerlocation] = useState({});
  const [product, setProduct] = useState([]);
  const [Model, setModel] = useState([]);
  const [CustomerAddress, setCustomerAddress] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const token = localStorage.getItem("token"); // Get token from localStorage

  const [formData, setFormData] = useState({
    product: "",
    location: "",
    date: "",
    serialnumber: "",
    CustomerID: customer_id,
    CustomerName: "",
  });


  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format date for input field (MM/DD/YYYY)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // This format works with the date input
  };

  const fetchCustomerlocationById = async (customer_id) => {
    try {
      const response = await axios.get(`${Base_Url}/fetchcustomerlocationByCustomerid/${customer_id}`, {
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

      console.log(response.data)
    } catch (error) {
      console.error("Error fetching customer location by ID:", error);
    }
  };
  

  const fecthProduct = async (customer_id) => {
    try {
      const response = await axios.get(`${Base_Url}/getproductunique/${customer_id}`,{
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      console.log(response.data);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchModelno = async () => {
    try {
      const response = await axios.get(`${Base_Url}/product_master`,{
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      console.log(response.data);
      setModel(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {
 
    if (customer_id) {
      fecthProduct(customer_id);
      fetchCustomerlocationById(customer_id);
    }
    fetchModelno();
  }, [customer_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if e.target.options exists before accessing it
    if (e.target.options) {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const customername = selectedOption ? selectedOption.getAttribute("data-customername") : '';
    
      setFormData({
        ...formData,
        [name]: value,
        ...(customername ? { CustomerName: customername } : {})
      });
    } else {
      // For input elements without options
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  

  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.product.trim()) {
      newErrors.product = "Product Name Field is required.";
    }

    if (!formData.date) {
      newErrors.date = "Date Field is required.";
    }

    if (!formData.location) {
      newErrors.location = "Loaction Field is required.";
    }

    if (!formData.serialnumber) {
      newErrors.serialnumber = "Serial Number Field is required.";
    }

    setErrors(newErrors);
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
                setDuplicateError(""); // Clear duplicate error before submitting

            try {
              const confirmSubmission = window.confirm(
                "Do you want to submit the data?"
              );
              if (confirmSubmission) {
                if (isEdit) {
                  // For update, include duplicate check
                  await axios
                    .post(`${Base_Url}/putproductunique`, { ...formData },{
                      headers: {
                        Authorization: token, // Send token in headers
                      },
                    })
                    .then((response) => {
                      console.log(response.data);
                      setFormData({
                        product: "",
                        location: "",
                        date: "",
                        serialnumber: "",
                      });
                      fecthProduct(customer_id);
                    })
                    .catch((error) => {
                      if (error.response && error.response.status === 409) {
                        setDuplicateError(
                          "Product with same serial number already exists!"
                        ); // Show duplicate error for update
                      }
                    });
                } else {
                  // For insert, include duplicate check
                  await axios
                    .post(`${Base_Url}/postproductunique`, { ...formData },{
                      headers: {
                        Authorization: token, // Send token in headers
                      },
                    })
                    .then((response) => {
                      setFormData({
                        product: "",
                        location: "",
                        date: "",
                        serialnumber: "",
                      });
                      fecthProduct(customer_id);
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
    try {
      const response = await axios.post(`${Base_Url}/deleteproductunique`, { id },{
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      fecthProduct(customer_id);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/requestproductunique/${id}`
        ,{
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      console.log("Original date:", response.data.date);

      const formattedDate = formatDateForInput(response.data.date);
      console.log("Formatted date for input:", formattedDate);

      const editData = {
        ...response.data,
        date: formattedDate,
      };

      setFormData(editData);
      setIsEdit(true);
      console.log(editData);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  return (
    <div className="tab-content">
      <Endcustomertabs></Endcustomertabs>
    <div className="row mp0">
      <div className="col-12">
        <div className="card mb-3 tab_box">
          <div className="card-body">
            <div className="row mp0">
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
                                        name="serialnumber"
                                        value={formData.serialnumber}
                                        onChange={handleChange}
                                        aria-describedby="snumber"
                                      />
                                      {errors.serialnumber && (
                                        <small className="text-danger">{errors.serialnumber}</small>
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
                                        name="date"
                                        className="form-control"
                                        id="pdate"
                                        value={formData.date}
                                        onChange={handleChange}
                                        aria-describedby="pdate"
                                      />
                                      {errors.date && (
                                        <small className="text-danger">{errors.date}</small>
                                      )}
                                  </div>

                                    <div className="col-md-12 mb-3">
                                        <label htmlFor="pname" className="form-label">
                                          Product<span className="text-danger">*</span>
                                        </label>
                                            <select 
                                              className="form-control" 
                                              onChange={handleChange} 
                                              value={formData.product || ''}
                                              name="product"
                                            >
                                              <option value="">Select</option>
                                              {Model && Model.length > 0 ? (
                                                Model.map((item, index) => (
                                                  <option key={index} value={item.item_description}>
                                                    {item.item_description}
                                                  </option>
                                                ))
                                              ) : (
                                                <option value="" disabled>No products available</option>
                                              )}
                                            </select>
                                        {errors.product && (
                                          <small className="text-danger">{errors.product}</small>
                                        )}
                                  </div>

                                <div className="col-md-12 mb-3">
                                        <label htmlFor="country" className="form-label pb-0 dropdown-label">
                                          Customer Address<span className="text-danger">*</span>
                                        </label>
                                          <select
                                            className="form-select dropdown-select"
                                            name="location"
                                            value={formData.customer_address}
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

                                          {errors.location && (
                                        <small className="text-danger">{errors.location}</small>
                                      )}
                                </div>

                    
                    {/* <div className="col-md-6 mb-3">
                      <label htmlFor="locationc" className="form-label">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-control"
                        id="locationc"
                        aria-describedby="locationc"
                      />
                       {errors.location && (
                        <small className="text-danger">{errors.location}</small>
                      )}
                    </div> */}

                    <div className="col-md-12 text-right">
                      <button
                        className="btn btn-liebherr"
                        type="submit"
                        style={{ marginTop: "15px" }}
                      >
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div>
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
                      <th
                        scope="col"
                        width="15%"
                        style={{ textAlign: "center" }}
                      >
                        Edit
                      </th>
                      <th
                        scope="col"
                        width="15%"
                        style={{ textAlign: "center" }}
                      >
                        Delete
                      </th>
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
                        <td className="text-center">
                          <button
                            className="btn btn-link text-primary"
                            onClick={() => edit(item.id)}
                            title="Edit"
                          >
                            <FaPencilAlt />
                          </button>
                        </td>
                        {/* kjkbvskd */}
                        <td className="text-center">
                          <button
                            className="btn btn-link text-danger"
                            onClick={() => deleted(item.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></div>
  );
};

export default Uniqueproduct;
