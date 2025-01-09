import axios from 'axios';
import * as XLSX from "xlsx";
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import Complainttabs from './Complainttabs';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


const Activity = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState(''); // State to track duplicate error
  const created_by = localStorage.getItem("userId");
  const updated_by = localStorage.getItem("userId");

  const [groupdefectcode, setGroupdefect_code] = useState([]);

  const [formData, setFormData] = useState({
    groupdefectcode: '',
    dsite_code: '',
    dsite_title: '',
    description: ''
  });


  const fetchGroupDefectCode = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getactivity`
        , {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      console.log(response.data);
      setGroupdefect_code(response.data);
    } catch (error) {
      console.error("Error fetching groupdefectcode:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getactivity`
        , {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      user.reasoncode && user.reasoncode.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };


  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {}; // Initialize an empty error object
    if (!formData.dsite_code.trim()) { // Check if the reasoncode is empty
      newErrors.dsite_code = "Site Defect Code Field is required."; // Set error message if reasoncode is empty
    }
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

    setDuplicateError(''); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include 'updated_by'
          await axiosInstance.post(`${Base_Url}/putactivity`, {
            id: formData.id,  // Explicitly pass the ID
            groupdefectcode: formData.groupdefectcode,
            dsite_code: formData.dsite_code,
            dsite_title: formData.dsite_title,
            description: formData.description,
            updated_by: updated_by
          }
            , {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then(response => {
              // window.location.reload();
              setFormData({
                groupdefectcode: '',
                dsite_code: '',
                dsite_title: '',
                description: ''
              })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Site Defect Code already exists!'); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include 'created_by'
          await axiosInstance.post(`${Base_Url}/postactivity`, { ...formData, created_by: created_by }
            , {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then(response => {
              //window.location.reload();
              setFormData({
                groupdefectcode: '',
                dsite_code: '',
                dsite_title: '',
                description: ''
              })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Site Defect Code already exists!'); // Show duplicate error for insert
              }
            });
        }
        setIsEdit(false);
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };


  const deleted = async (id) => {
    try {
      const response = await axiosInstance.post(`${Base_Url}/deleteactivity`, { id }
        , {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestactivity/${id}`
        , {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      // Ensure all fields are spread, including potential missing fields
      setFormData({
        id: id,  // Explicitly set the ID
        groupdefectcode: response.data.defectgroupcode || '',
        dsite_code: response.data.code || '',
        dsite_title: response.data.title || '',
        description: response.data.description || ''
      });
      setIsEdit(true);
      console.log(response.data);
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
          const worksheet = XLSX.utils.json_to_sheet(currentUsers.map(user => ({
      
            "ActivityCode": user.code,
            "ActivityTitle": user.title,
            "Description": user.description,
            
      
          })));
      
          // Append the worksheet to the workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, "Activity");
      
          // Export the workbook
          XLSX.writeFile(workbook, "Activity.xlsx");
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
    pageid: String(36)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  return (
    <div className="tab-content">
      <Complainttabs />
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
                <div className="col-6">
                  <form onSubmit={handleSubmit} style={{ width: "50%" }} className="text-left">

                    <div className="mb-3" hidden>
                      <label
                        htmlFor="groupdefectcode"
                        className="form-label pb-0 dropdown-label"
                      >
                        Defect Group Code<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select dropdown-select"
                        name="groupdefectcode"
                        value={formData.groupdefectcode}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        {groupdefectcode.map((gdc) => (
                          <option key={gdc.id} value={gdc.defectgroupcode}>
                            {gdc.defectgrouptitle}
                          </option>
                        ))}
                      </select>
                      {errors.groupdefectcode && (
                        <small className="text-danger">{errors.groupdefectcode}</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="dsite_code" className="input-field" >Activity Code<span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="dsite_code"
                        id="dsite_code"
                        value={formData.dsite_code}
                        onChange={handleChange}
                        placeholder="Enter Activity Code "
                        pattern="[0-9]*"  // This pattern ensures only numbers are allowed
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');  // Remove any non-numeric characters
                        }}
                      />

                      {errors.dsite_code && <small className="text-danger">{errors.dsite_code}</small>}
                      {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                    </div>


                    <div className="mb-3">
                      <label htmlFor="ComplaintcodeInput" className="input-field">
                        Activity Title
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="dsite_title"
                        id="dsite_title"
                        value={formData.dsite_title}
                        onChange={handleChange}
                        placeholder="Enter Activity Title "
                      />
                      {errors.dsite_title && (
                        <small className="text-danger">
                          {errors.dsite_title}
                        </small>
                      )}

                    </div>

                    <div className="mb-3">
                      <label htmlFor="ComplaintcodeInput" className="input-field">
                        Description
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter Description "
                      />

                      {errors.description && (
                        <small className="text-danger">
                          {errors.description}
                        </small>
                      )}

                    </div>


                    {roleaccess > 2 ? <div className="text-right">
                      <button className="btn btn-liebherr" type="submit">
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div> : null}
                  </form>
                </div>

                <div className="col-md-6">
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

                  {/* Adjust table padding and spacing */}
                  <table className='table table-bordered table dt-responsive nowrap w-100 table-css' style={{ marginTop: '20px', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 15px', textAlign: 'center' }}>#</th>
                        <th style={{ padding: '12px 15px', textAlign: 'center' }}>Code</th>
                        <th style={{ padding: '12px 15px', textAlign: 'center' }}>Title</th>
                        <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
                        <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ padding: '2px', textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                          <td style={{ padding: '10px' }}>{item.code}</td>
                          <td style={{ padding: '10px' }}>{item.title}</td>
                          <td style={{ padding: '0px', textAlign: 'center' }}>
                            <button
                              className='btn'
                              onClick={() => {
                                // alert(item.id)
                                edit(item.id)
                              }}
                              reasoncode="Edit"
                              disabled={roleaccess > 3 ? false : true}
                              style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                            >
                              <FaPencilAlt />
                            </button>
                          </td>
                          <td style={{ padding: '0px', textAlign: 'center' }}>
                            <button
                              className='btn'
                              onClick={() => deleted(item.id)}
                              reasoncode="Delete"
                              disabled={roleaccess > 4 ? false : true}
                              style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-between" style={{ marginTop: '10px' }}>
                    <div>
                      Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
                    </div>

                    <div className="pagination" style={{ marginLeft: 'auto' }}>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        {'<'}
                      </button>
                      {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={currentPage === index ? 'active' : ''}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage) - 1}
                      >
                        {'>'}
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

export default Activity;
