import axios from "axios";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";

// Step 1: Set up animated components for react-select
const animatedComponents = makeAnimated();

const Groupmasterpg = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [isEdit, setIsEdit] = useState(false);
  const token = localStorage.getItem("token"); // Get token from localStorage

  const [Childfranchise, setChildfranchise] = useState([]);
  // Step 2: Define state to store the options for the dropdown (fetched from API)
  const [options, setOptions] = useState([]);

  // Step 3: Define state to store selected options from the dropdown
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Step 4: Define state to store data for the group table (fetched from API when editing)
  const [groupdata, setGroupdata] = useState([]);

  const [formData, setFormData] = useState({
    cfranchise_id: '',
    engineer: '',
    product: '',
  });
  // State for product options
const [productOptions, setProductOptions] = useState([]);

// State for selected products
const [selectedProducts, setSelectedProducts] = useState([]);

  // Step 5: Function to fetch options for the dropdown from the API
  const fetchOptions = async (cfranchise_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getgroupmengineer/${cfranchise_id}`,{
        headers: {
           Authorization: token, // Send token in headers
         },
       });

      // Map response data to format required by react-select
      const engineerOptions = response.data.map(engineer => ({
        value: engineer.id,      // Unique value for each option
        label: engineer.title    // Displayed label for each option
      }));

      // Step 6: Update options state with fetched data
      setOptions(engineerOptions);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };



  const fetchChildfranchise = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getchildfranchisegroupm`,{
        headers: {
           Authorization: token, // Send token in headers
         },
       });
      console.log(response.data);
      setChildfranchise(response.data);
    } catch (error) {
      console.error('Error fetching Childfranchise:', error);
    }
  };

  // Function to fetch product options from API
const fetchProductOptions = async () => {
  try {
    const response = await axiosInstance.get(`${Base_Url}/getproduct`);
    const options = response.data.map(product => ({
      value: product.id,     // Adjust 'id' to match your actual property
      label: product.item_description    // Adjust 'name' to match your actual property
    }));
    setProductOptions(options);
  } catch (error) {
    console.error("Error fetching product options:", error);
  }
};


  // Step 7: useEffect to fetch options once the component loads
  useEffect(() => {
    fetchOptions(); // This will run fetchOptions once after the component mounts
    fetchProductOptions();
    fetchChildfranchise();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "cfranchise_id"){
      fetchOptions(value);
    }
  };

  // Step 8: Function to handle selection changes in the dropdown
  const handleSelectChange = (selected) => {
    setSelectedOptions(selected || []); // Update selectedOptions state
  };

  // Handle product selection changes
const handleProductSelectChange = (selected) => {
  setSelectedProducts(selected || []);
};


  // Step 9: Function to select all options in the dropdown
  const selectAll = (e) => {
    e.preventDefault();
    setSelectedOptions(options); // Select all available options
  };

  // Step 10: Function to clear all selected options in the dropdown
  const clearSelection = (e) => {
    e.preventDefault();
    setSelectedOptions([]); // Clear selection
  };

  //for Products 9,10 same code
  // Select All Products function
const selectAllProducts = (e) => {
  e.preventDefault();
  setSelectedProducts(productOptions);
};

// Clear All Products function
const clearProductSelection = (e) => {
  e.preventDefault();
  setSelectedProducts([]);
};


  // Step 11: Function to delete an item by its id
  const deleted = async (id) => {
    try {
      const response = await axiosInstance.post(`${Base_Url}/deletesdata`, { id });
      console.log("Item deleted successfully");
      // Optionally, you can refresh data here or remove the item from groupdata
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Step 12: Function to fetch and set group data for editing an item by id
  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestsdata/${id}`);
      setGroupdata(response.data); // Update groupdata state with fetched data
      console.log("Fetched data for editing:", response.data);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  return (
    <div className="row mp0">
          {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      <div className="col-12">
        <div className="card mb-3 tab_box">
          <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
            <div className="row mp0">
              <div className="col-6">
                <form style={{ width: "50%" }} className="text-left">

                  {/* Step 13: Select All and Clear All buttons */}
                        <div style={{ width: '300px', margin: '20px' }}>
                                <div className="form-group">
                                    <label htmlFor="Child Franchise" className="form-label pb-0 dropdown-label " >
                                      Child Franchise
                                    </label>
                                    <select className="form-select react-select-dropdown" name="cfranchise_id" value={formData.cfranchise_id} onChange={handleChange} style={{ padding: "8px", border: "1px solid #d1d3e2", borderRadius: "4px" }}>
                                      <option value="">Child Franchise</option>
                                      {Childfranchise.map((pf) => (
                                        <option key={pf.id} value={pf.id}>{pf.title}</option>
                                      ))}
                                    </select>
                                </div>
                        </div>
                  <div style={{ width: '300px', margin: '20px' }}>
                      <div className="mb-0">
                        {/* Label */}
                        <label htmlFor="Child Franchise" className="form-label pb-0 dropdown-label">
                          Engineer
                        </label>
                      </div>
                    <div className="d-flex mb-2">
                        {/* Select All Button */}
                      <button
                        onClick={selectAll}
                        className="btn btn-outline-primary me-2"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <i className="fas fa-check-circle"></i> Select All
                      </button>

                      {/* Clear All Button */}
                      <button
                        onClick={clearSelection}
                        className="btn btn-outline-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <i className="fas fa-times-circle"></i> Clear All
                      </button>
                    </div>

                    {/* Step 14: Multi-select dropdown using react-select */}
                    <Select
                      isMulti
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      options={options}               // Options from API
                      value={selectedOptions}         // Selected options
                      onChange={handleSelectChange}   // Handle change
                      placeholder="Select Engineer"
                      className="custom-select"
                      name="engineer"

                      styles={{

                        placeholder: (provided) => ({
                          ...provided,
                          color: 'black', // Set placeholder text color to black
                          fontFamily: 'Nunito', // Optional: apply font family to placeholder
                          fontSize: '14px', // Optional: apply font size to placeholder
                        }),
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          color: 'black', // Set the dropdown arrow color to black
                        }),
                        indicatorSeparator: (provided) => ({
                          ...provided,
                          display: 'none', // Hide the separator line
                        }),
                      }}
                    />
                  </div>

                      {/* For Products Option */}

                       {/* Step 13: Select All and Clear All buttons */}
                  <div style={{ width: '300px', margin: '20px' }}>
                        <div className="mb-0">
                              {/* Label */}
                              <label htmlFor="Child Franchise" className="form-label pb-0 dropdown-label">
                                Products
                              </label>
                            </div>
                    <div className="d-flex mb-2">
                      {/* Select All  Products Button */}
                      <button
                          onClick={selectAllProducts}
                          className="btn btn-outline-primary me-2"
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <i className="fas fa-check-circle"></i> Select All
                        </button>

                        {/* Clear All Products Button */}
                        <button
                          onClick={clearProductSelection}
                          className="btn btn-outline-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <i className="fas fa-times-circle"></i> Clear All
                        </button>
                    </div>

                    {/* Step 14: Multi-select dropdown using react-select */}
                        <Select
                          isMulti
                          closeMenuOnSelect={false}
                          components={animatedComponents}
                          options={productOptions}               // Dynamic options from API for products
                          value={selectedProducts}               // Currently selected products
                          onChange={handleProductSelectChange}    // Handle change for products
                          placeholder="Select Products"
                          className="custom-select"
                          name="product"
                          styles={{

                            placeholder: (provided) => ({
                              ...provided,
                              color: 'black', // Set placeholder text color to black
                              fontFamily: 'Nunito', // Optional: apply font family to placeholder
                              fontSize: '14px', // Optional: apply font size to placeholder
                            }),
                            dropdownIndicator: (provided) => ({
                              ...provided,
                              color: 'black', // Set the dropdown arrow color to black
                            }),
                            indicatorSeparator: (provided) => ({
                              ...provided,
                              display: 'none', // Hide the separator line
                            }),
                          }}
                        />

                  </div>

                  {/* products option end */}


                  {/* Submit or Update Button */}
                  <div className="text-right">
                    <button className="btn btn-liebherr" type="submit">
                      {isEdit ? "Update" : "Submit"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Step 15: Table for displaying group data */}
              <div className="col-md-6">
                <table
                  className="table table-bordered table dt-responsive nowrap w-100 table-css"
                  style={{ marginTop: "20px", tableLayout: "fixed" }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>#</th>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>Service Agent</th>
                      <th style={{ padding: "0px 0px", textAlign: "center" }}>Edit</th>
                      <th style={{ padding: "0px 0px", textAlign: "center" }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupdata.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: "2px", textAlign: "center" }}>{index + 1}</td>
                        <td style={{ padding: "10px" }}>{item.serviceagent}</td>
                        <td style={{ padding: "0px", textAlign: "center" }}>
                          <button
                            className="btn"
                            onClick={() => edit(item.id)}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groupmasterpg;
