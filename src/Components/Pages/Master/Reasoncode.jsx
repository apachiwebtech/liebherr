import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Complainttabs from './Complainttabs';

const ReasonCode = () => {
    // Step 1: Add this state to track errors
    const token = localStorage.getItem("token"); 
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [duplicateError, setDuplicateError] = useState(''); // State to track duplicate error
    const created_by = localStorage.getItem("userId");  
    const updated_by = localStorage.getItem("userId"); 
  

    const [groupdefect_code, setGroupdefect_code] = useState([]);

    const [formData, setFormData] = useState({
        groupdefect_code: '',
        defect_code: '',
        defect_title: '',
        description: ''
    });


    const fetchGroupDefectCode = async () => {
        try {
          const response = await axios.get(`${Base_Url}/getgroupdefectcode`,{
            headers: {
                Authorization: token, // Send token in headers
                }, 
            });
          console.log(response.data);
          setGroupdefect_code(response.data);
        } catch (error) {
          console.error("Error fetching groupdefect_code:", error);
        }
      };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${Base_Url}/gettypeofdefect`,{
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
        fetchGroupDefectCode();
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
        if (!formData.groupdefect_code.trim()) { // Check if the reasoncode is empty
            newErrors.groupdefect_code = "Defect Group Code Field is required."; // Set error message if reasoncode is empty
        }
        if (!formData.defect_code.trim()) { // Check if the reasoncode is empty
            newErrors.defect_code = "Defect Type Code Field is required."; // Set error message if reasoncode is empty
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
                    await axios.put(`${Base_Url}/putdatatypeofdefect`, {
                        id: formData.id,  // Explicitly pass the ID
                        groupdefect_code: formData.groupdefect_code,
                        defect_code: formData.defect_code,
                        defect_title: formData.defect_title,
                        description: formData.description,
                        updated_by: updated_by
                    },{
                        headers: {
                            Authorization: token, // Send token in headers
                            }, 
                        })
                        .then(response => {
                           // window.location.reload();
                           setFormData({
                            groupdefect_code: '',
                            defect_code: '',
                            defect_title: '',
                            description: ''
                        })
                        fetchUsers();
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError('Duplicate entry, Defect Type Code already exists!'); // Show duplicate error for update
                            }
                        });
                } else {
                    // For insert, include 'created_by'
                    await axios.post(`${Base_Url}/postdatatypeofdefect`, { ...formData, created_by: created_by },{
                        headers: {
                            Authorization: token, // Send token in headers
                            }, 
                        })
                        .then(response => {
                            //window.location.reload();
                            setFormData({
                                groupdefect_code: '',
                                defect_code: '',
                                defect_title: '',
                                description: ''
                            })
                            fetchUsers();
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError('Duplicate entry, Defect Type Code already exists!'); // Show duplicate error for insert
                            }
                        });
                }
            }
        } catch (error) {
            console.error('Error during form submission:', error);
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deletetypeofdefect`, { id },{
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
            const response = await axios.get(`${Base_Url}/requestdatatypeofdefect/${id}`,{
                headers: {
                    Authorization: token, // Send token in headers
                    }, 
                });
            // Ensure all fields are spread, including potential missing fields
            setFormData({
                id: id,  // Explicitly set the ID
                groupdefect_code: response.data.groupdefect_code || '',
                defect_code: response.data.defect_code || '',
                defect_title: response.data.defect_title || '',
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

    return (
        <div className="tab-content">
        <Complainttabs />
        <div className="row mp0" >
            <div className="col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        <div className="row mp0">
                            <div className="col-6">
                                <form onSubmit={handleSubmit} style={{ width: "50%" }} className="text-left">
                                    
                                <div className="mb-3">
                                    <label
                                                htmlFor="groupdefect_code"
                                                className="form-label pb-0 dropdown-label"
                                            >
                                                Defect Group Code
                                            </label>
                                            <select
                                                className="form-select dropdown-select"
                                                name="groupdefect_code"
                                                value={formData.groupdefect_code}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
                                                {groupdefect_code.map((gdc) => (
                                                <option key={gdc.id} value={gdc.defectgroupcode}>
                                                    {gdc.defectgrouptitle}
                                                </option>
                                                ))}
                                            </select>
                                            {errors.groupdefect_code && (
                                                <small className="text-danger">{errors.groupdefect_code}</small>
                                            )}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="defect_code" className="input-field" >Defect Type Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="defect_code"
                                            id="defect_code"
                                            value={formData.defect_code}
                                            onChange={handleChange}
                                            placeholder="Enter Defect Type Code "
                                            pattern="[0-9]*"  // This pattern ensures only numbers are allowed
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, '');  // Remove any non-numeric characters
                                            }}
                                        />

                                        {errors.defect_code && <small className="text-danger">{errors.defect_code}</small>}
                                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                                    </div>


                                     <div className="mb-3">
                                            <label htmlFor="ComplaintcodeInput" className="input-field">
                                            Defect Title
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="defect_title"
                                                id="defect_title"
                                                value={formData.defect_title}
                                                onChange={handleChange}
                                                placeholder="Enter Defect Title "
                                            />
                                            {errors.defect_title && (
                                            <small className="text-danger">
                                                {errors.defect_title}
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


                                    <div className="text-right">
                                        <button className="btn btn-liebherr" type="submit">
                                            {isEdit ? "Update" : "Submit"}
                                        </button>
                                    </div>
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
                                </div>

                                {/* Adjust table padding and spacing */}
                                <table className='table table-bordered table dt-responsive nowrap w-100 table-css' style={{ marginTop: '20px', tableLayout: 'fixed' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>#</th>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Defect Group Title</th>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Defect Type Code</th>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Defect Type Title</th>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Description</th>
                                            <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
                                            <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map((item, index) => (
                                            <tr key={item.id}>
                                                <td style={{ padding: '2px', textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                                                <td style={{ padding: '10px' }}>{item.grouptitle}</td>
                                                <td style={{ padding: '10px' }}>{item.defect_code}</td>
                                                <td style={{ padding: '10px' }}>{item.defect_title}</td>
                                                <td style={{ padding: '10px' }}>{item.description}</td>
                                                <td style={{ padding: '0px', textAlign: 'center' }}>
                                                    <button
                                                        className='btn'
                                                        onClick={() => {
                                                            // alert(item.id)
                                                            edit(item.id)
                                                        }}
                                                        reasoncode="Edit"
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
        </div>
        </div>

    );
};

export default ReasonCode;
