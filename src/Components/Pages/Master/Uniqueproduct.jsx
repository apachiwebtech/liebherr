import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";

const Uniqueproduct = () => {
  const [errors, setErrors] = useState({});
  //   const [Customerlocation, setCustomerlocation] = useState({});
  const [product, setProduct] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");

  const [formData, setFormData] = useState({
    product: "",
    location: "",
    date: "",
    serialnumber: "",
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

  const fecthProduct = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getproductunique`);
      console.log(response.data);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {
    fecthProduct();
    // fetchCustomerlocation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
                    .put(`${Base_Url}/putproductunique`, { ...formData })
                    .then((response) => {
                      console.log(response.data);
                      setFormData({
                        product: "",
                        location: "",
                        date: "",
                        serialnumber: "",
                      });
                      fecthProduct();
                    })
                    .catch((error) => {
                      if (error.response && error.response.status === 409) {
                        setDuplicateError(
                          "Duplicate entry,date and Mobile No Credential already exists!"
                        ); // Show duplicate error for update
                      }
                    });
                } else {
                  // For insert, include duplicate check
                  await axios
                    .post(`${Base_Url}/postproductunique`, { ...formData })
                    .then((response) => {
                      setFormData({
                        product: "",
                        location: "",
                        date: "",
                        serialnumber: "",
                      });
                      fecthProduct();
                    })
                    .catch((error) => {
                      if (error.response && error.response.status === 409) {
                        setDuplicateError(
                          "Duplicate entry,date and Mobile No Credential already exists!"
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
      const response = await axios.post(`${Base_Url}/deleteproductunique`, { id });
      fecthProduct();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/requestproductunique/${id}`
      );
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
    <div className="row mp0">
      <div className="col-12">
        <div className="card mb-3 tab_box">
          <div className="card-body">
            <div className="row mp0">
              <div className="col-4">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="pname" className="form-label">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="product"
                        value={formData.product}
                        onChange={handleChange}
                        className="form-control"
                        id="pname"
                        aria-describedby="pname"
                        placeholder=""
                      />
                      {errors.product && (
                        <small className="text-danger">{errors.product}</small>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="pdate" className="form-label">
                        Purchase Date
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
                    <div className="col-md-6 mb-3">
                      <label htmlFor="snumber" className="form-label">
                        Serial Number
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
                    </div>
                    <div className="col-md-6 mb-3">
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
                    </div>
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
                        <td>{formatDate(item.date)}</td>
                        <td>{item.product}</td>
                        <td>{item.serialnumber}</td>
                        <td>{item.location}</td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="edithelper" // You can keep or modify this class as needed
                            onClick={() => edit(item.id)}
                            title="Edit"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#0000FF",
                              fontSize: "20px",
                              transform: "rotate(1deg)", // Add rotation if needed
                              cursor: "pointer", // Change cursor to pointer on hover
                            }}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="deletehelper" // Optional: You can keep this for any specific styling
                            onClick={() => deleted(item.id)} // Call the delete function
                            title="Delete"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#df2025", // Red color for delete icon
                              fontSize: "20px",
                              cursor: "pointer", // Change cursor to pointer on hover
                            }}
                          >
                            <i className="fa-solid fa-trash"></i>{" "}
                            {/* Use Font Awesome trash icon */}
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
    </div>
  );
};

export default Uniqueproduct;
