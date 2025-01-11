import axios from 'axios';
import * as XLSX from "xlsx";
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import LocationTabs from './LocationTabs';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useSelector } from 'react-redux';
import CryptoJS from 'crypto-js';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";

const Geostate = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const token = localStorage.getItem("token");
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]); // State for regions
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    country_id: '',
    region_id: ''
  });

  const fetchCountries = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcountries`, {
        headers: {
          Authorization: token,
        },
      });
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };



  const fetchRegions = async (countryId) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getregionscity/${countryId}`, {
        headers: {
          Authorization: token,
        },
      }); // API to fetch regions based on country_id
      setRegions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getgeostates`, {
        headers: {
          Authorization: token,
        },
      }); // This should be updated to fetch from your geostate table if necessary
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchUsers();
    fetchRegions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Fetch regions when country is selected
    if (name === 'country_id') {
      fetchRegions(value); // Fetch regions for the selected country
      //   setFormData({ ...formData, region_id: '' }); // Reset region_id when country changes
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      user.title && user.title.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Geo State Field is required.";
    }
    if (!formData.country_id) {
      newErrors.country_id = "Country selection is required.";
    }
    if (!formData.region_id) { // Validation for region_id
      newErrors.region_id = "Region selection is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDuplicateError('');

    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          await axiosInstance.post(`${Base_Url}/putgeostate`, { ...formData }, {
            headers: {
              Authorization: token,
            },
          })
            .then(response => {
              setFormData({
                title: '',
                country_id: '',
                region_id: ''
              })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Geo State already exists!');
              }
            });
        } else {
          await axiosInstance.post(`${Base_Url}/postgeostate`, { ...formData }, {
            headers: {
              Authorization: token,
            },
          })
            .then(response => {
              setFormData({
                title: '',
                country_id: '',
                region_id: ''
              })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Geo State already exists!');
              }
            });
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  const deleted = async (id) => {
    const confirm =  window.confirm("Are you sure you want to delete ?");

    if(confirm){
    try {
      await axiosInstance.post(`${Base_Url}/deletegeostate`, { id }, {
        headers: {
          Authorization: token,
        },
      });
      setFormData({
        title: '',
        country_id: '',
        region_id: ''
      })
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestgeostate/${id}`, {
        headers: {
          Authorization: token,
        },
      });
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      console.log("ddtttttt", response.data);
      console.log("ddddd", response.data.country_id);
      setIsEdit(true);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      "Country": user.country_title,
      "Region": user.region_title,
      "Geostate": user.title
      // Add fields you want to export
    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Geostate");

    // Export the workbook
    XLSX.writeFile(workbook, "Geostate.xlsx");
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
    pageid: String(3)
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
      {roleaccess > 1 ? <div className="row mp0" >
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <div className="row mp0">
                <div className="col-4">
                  <form onSubmit={handleSubmit} style={{ width: "50%" }} className="text-left">
                    {/* Country Dropdown */}
                    <div className="form-group">
                      <label htmlFor="country" className="form-label pb-0 dropdown-label">Country<span className="text-danger">*</span></label>
                      <select className='form-select dropdown-select' name='country_id' value={formData.country_id} onChange={handleChange}>
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>{country.title}</option>
                        ))}
                      </select>
                      {errors.country_id && <small className="text-danger">{errors.country_id}</small>}
                    </div>

                    {/* Region Dropdown */}
                    <div className="form-group">
                      <label htmlFor="region" className="form-label pb-0 dropdown-label">Region<span className="text-danger">*</span></label>
                      <select className='form-select dropdown-select' name='region_id' value={formData.region_id} onChange={handleChange}>
                        <option value="">Select Region</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>{region.title}</option>
                        ))}
                      </select>
                      {errors.region_id && <small className="text-danger">{errors.region_id}</small>} {/* Show error for region selection */}
                    </div>

                    {/* Region Input */}
                    <div className="form-group">
                      <label htmlFor="geoStateInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Geo State<span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        id="geostateInput"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter Geo State"
                      />
                      {errors.title && <small className="text-danger">{errors.title}</small>}
                      {duplicateError && <small className="text-danger">{duplicateError}</small>}
                    </div>
                    {roleaccess > 2 ? <div className="text-right">
                      <button className="btn btn-liebherr" type="submit" style={{ marginTop: '15px' }}>
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
                        style={{ width: '51px', display: 'inline-block', marginLeft: '5px', marginRight: '5px' }}
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
                      style={{ width: '300px' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={exportToExcel}
                    >
                      Export to Excel
                    </button>
                  </div>

                  <table className='table table-bordered  table-hover dt-responsive nowrap w-100'>
                    <thead className='thead-light'>
                      <tr>
                        <th scope='col' width="10%" className='text-center'>#</th>
                        <th scope='col' width="20%" className='text-left'>Country</th>
                        <th scope='col' width="20%" className='text-left'>Region</th>
                        <th scope='col' width="20%" className='text-left'>Geo State</th>
                        <th scope='col' width="15%" className='text-center'>Edit</th>
                        <th scope='col' width="15%" className='text-center'>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, index) => (
                        <tr key={user.id}>
                          <td className='text-center'>{index + 1 + indexOfFirstUser}</td>
                          <td className='text-center'>{user.country_title}</td>
                          <td className='text-center'>{user.region_title}</td>
                          <td className='text-center'>{user.title}</td>
                          <td className='text-center'>
                            <FaPencilAlt style={{ cursor: 'pointer', color: 'blue' }} onClick={() => edit(user.id)} disabled={roleaccess > 3 ? false : true} />
                          </td>
                          <td className='text-center'>
                            <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => deleted(user.id)} disabled={roleaccess > 4 ? false : true} />
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

export default Geostate;
