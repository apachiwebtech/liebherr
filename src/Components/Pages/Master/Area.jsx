import axios from "axios";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import LocationTabs from "./LocationTabs";
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


const Area = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const token = localStorage.getItem("token");
  const [geoStates, setGeoStates] = useState([]);
  // const [geoCities, setGeoCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [errors, setErrors] = useState({});
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    country_id: "",
    region_id: "",
    geostate_id: "",
    // geocity_id: "",
  });

  const fetchCountries = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcountries`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      setCountries(decryptedData);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchRegions = async (countryId) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getregionscity/${countryId}`
        , {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      setRegions(response.data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchGeoStates = async (regionId) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getgeostatescity/${regionId}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );
      setGeoStates(response.data);
    } catch (error) {
      console.error("Error fetching geo states:", error);
    }
  };


  const fetchAreas = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getareas`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));


      setAreas(decryptedData);
      setFilteredAreas(decryptedData);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchAreas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(formData),
      secretKey
    ).toString();


    setDuplicateError("");

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          await axios
            .post(`${Base_Url}/putarea`, { encryptedData }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            }
            )
            .then((response) => {
              setFormData({
                title: "",
                country_id: "",
                region_id: "",
                geostate_id: "",
                // geocity_id: "",

              });
              fetchAreas();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Area already exists!");
              }
            });
        } else {
          await axios
            .post(`${Base_Url}/postarea`, { encryptedData }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            }
            )
            .then((response) => {
              setFormData({
                title: "",
                country_id: "",
                region_id: "",
                geostate_id: "",
                // geocity_id: "",

              });
              fetchAreas();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Area already exists!");
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "country_id") {
      fetchRegions(value);
    }
    if (name === "region_id") {
      fetchGeoStates(value);
    }
    // if (name === "geostate_id") {
    //   fetchGeoCities(value); // Fetch Geo Cities when Geo State is selected
    // }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredAreas(
      areas.filter(
        (area) =>
          area.title.toLowerCase().includes(searchValue) ||
          area.country_title.toLowerCase().includes(searchValue) ||
          area.region_title.toLowerCase().includes(searchValue) ||
          area.geostate_title.toLowerCase().includes(searchValue)
      )
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Area Field is required.";
    }
    if (!formData.country_id) {
      newErrors.country_id = "Country selection is required.";
    }
    if (!formData.region_id) {
      newErrors.region_id = "Region selection is required.";
    }
    if (!formData.geostate_id) {
      newErrors.geostate_id = "Geo State selection is required.";
    }

    return newErrors;
  };

  const deleted = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete ?");

    if (confirm) {
      try {
        await axiosInstance.post(`${Base_Url}/deletearea`, { id }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        }
        );
        setFormData({
          title: "",
          country_id: "",
          region_id: "",
          geostate_id: "",
          geocity_id: "",
        });
        fetchAreas();
      } catch (error) {
        console.error("Error deleting area:", error);
      }
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestarea/${id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );
      console.log(response.data);
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      fetchGeoStates(response.data.region_id);
      // fetchGeoCities(response.data.geostate_id);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing area:", error);
    }
  };
  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredAreas.slice(indexOfFirstUser, indexOfLastUser);

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredAreas.map(user => ({
      "Country": user.country_title,
      "Region": user.region_title,
      "Geo State": user.geostate_title,
      "District": user.title,
      // Add fields you want to export
    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "District");

    // Export the workbook
    XLSX.writeFile(workbook, "District.xlsx");
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
    pageid: String(4)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  return (
    <div className="tab-content">
      <LocationTabs />
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mp0">
                <div className="col-4">
                  <form
                    onSubmit={handleSubmit}
                    style={{ width: "50%" }}
                    className="text-left"
                  >
                    {/* Country Dropdown */}
                    <div className="form-group">
                      <label
                        htmlFor="country"
                        className="form-label pb-0 dropdown-label"
                      >
                        Country<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select dropdown-select"
                        name="country_id"
                        value={formData.country_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.title}
                          </option>
                        ))}
                      </select>
                      {errors.country_id && (
                        <small className="text-danger">{errors.country_id}</small>
                      )}
                    </div>

                    {/* Region Dropdown */}
                    <div className="form-group">
                      <label
                        htmlFor="region"
                        className="form-label pb-0 dropdown-label"
                      >
                        Region<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select dropdown-select"
                        name="region_id"
                        value={formData.region_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Region</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.title}
                          </option>
                        ))}
                      </select>
                      {errors.region_id && (
                        <small className="text-danger">{errors.region_id}</small>
                      )}
                    </div>

                    {/* Geo State Dropdown */}
                    <div className="form-group">
                      <label
                        htmlFor="geostate_id"
                        className="form-label pb-0 dropdown-label"
                      >
                        Geo State<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select dropdown-select"
                        name="geostate_id"
                        value={formData.geostate_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Geo State</option>
                        {geoStates.map((geoState) => (
                          <option key={geoState.id} value={geoState.id}>
                            {geoState.title}
                          </option>
                        ))}
                      </select>
                      {errors.geostate_id && (
                        <small className="text-danger">
                          {errors.geostate_id}
                        </small>
                      )}
                    </div>

                    {/* Geo City Dropdown */}
                    {/* <div className="form-group">
                      <label
                        htmlFor="geocity_id"
                        className="form-label pb-0 dropdown-label"
                      >
                        Geo City
                      </label>
                      <select
                        className="form-select dropdown-select"
                        name="geocity_id" // Ensure the name matches formData
                        value={formData.geocity_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Geo City</option>
                        {geoCities.map((geoCity) => (
                          <option key={geoCity.id} value={geoCity.id}>
                            {geoCity.title}
                          </option>
                        ))}
                      </select>
                      {errors.geocity_id && (
                        <small className="text-danger">{errors.geocity_id}</small>
                      )}
                    </div> */}

                    {/* Title Input */}
                    <div className="form-group">
                      <label htmlFor="areaInput" className="input-field">
                        District<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        id="areaInput"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter District"
                      />
                      {errors.title && (
                        <small className="text-danger">{errors.title}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                    </div>
                    {roleaccess > 2 ? <div className="text-right">
                      <button
                        className="btn btn-liebherr"
                        type="submit"
                        style={{ marginTop: "15px" }}
                      >
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div> : null}
                  </form>
                </div>

                <div className="col-md-8">
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

                  <table className="table table-bordered table-hover dt-responsive nowrap w-100">
                    <thead>
                      <tr className="text-center">
                        <th scope="col" width="10%" className='text-center'>#</th>
                        <th scope="col" width="14%" className='text-center'>Country</th>
                        <th scope="col" width="14%" className='text-center'>Region</th>
                        <th scope="col" width="14%" className='text-center'>Geo State</th>
                        <th scope="col" width="14%" className='text-center'>District</th>
                        <th scope="col" width="15%" className='text-center'>Edit</th>
                        <th scope="col" width="15%" className='text-center'>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAreas
                        .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                        .map((area, index) => (
                          <tr key={area.id} className="text-center">
                            <td className='text-center'>{currentPage * itemsPerPage + index + 1}</td>
                            <td className='text-center'>{area.country_title}</td>
                            <td className='text-center'>{area.region_title}</td>
                            <td className='text-center'>{area.geostate_title}</td>
                            <td className='text-center'>{area.title}</td>
                            <td className='text-center'>
                              <button className="btn"
                                style={{
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: "blue",
                                  fontSize: "20px",
                                }}
                                onClick={() => edit(area.id)}
                                disabled={roleaccess > 3 ? false : true}
                              >
                                <FaPencilAlt />
                              </button>
                            </td>
                            <td className='text-center'>
                              <button
                                className="btn"
                                style={{
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: "red",
                                  fontSize: "20px",
                                }}
                                onClick={() => deleted(area.id)}
                                disabled={roleaccess > 4 ? false : true}>
                                <FaTrash style={{ cursor: 'pointer', color: 'red' }} />
                              </button></td>
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
                      {Math.min(indexOfLastUser, filteredAreas.length)} of{" "}
                      {filteredAreas.length} entries
                    </div>

                    <div className="pagination" style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 0))
                        }
                        disabled={currentPage === 0}
                      >
                        &lt;
                      </button>
                      {Array.from(
                        {
                          length: Math.min(3, Math.ceil(filteredAreas.length / itemsPerPage)), // Limit to 3 buttons
                        },
                        (_, index) => {
                          const pageIndex = Math.max(0, currentPage - 1) + index; // Adjust index for sliding window
                          if (pageIndex >= Math.ceil(filteredAreas.length / itemsPerPage)) return null; // Skip invalid pages

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
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(filteredAreas.length / itemsPerPage) - 1
                            )
                          )
                        }
                        disabled={
                          currentPage >=
                          Math.ceil(filteredAreas.length / itemsPerPage) - 1
                        }
                      >
                        &gt;
                      </button>
                    </div>
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

export default Area;
