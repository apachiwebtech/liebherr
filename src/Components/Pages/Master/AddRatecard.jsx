import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import md5 from "js-md5";
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import "react-datepicker/dist/react-datepicker.css";
import Ratecardtabs from './Ratecardtabs';
const AddRatecard = () => {
    // Step 1: Add this state to track errors
    const { loaders, axiosInstance } = useAxiosLoader();
    const { engineerid } = useParams();
    const [Childfranchise, setChildfranchise] = useState([]);
    const [Parentfranchise, setParentfranchise] = useState([]);
    const token = localStorage.getItem("token");
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [duplicateError, setDuplicateError] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [joining_date, setJoiningDate] = useState('');

    const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
    const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
        const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
        return `${year}-${month}-${day}`;
    };
    const [formData, setFormData] = useState({
        call_type: '',
        class_city: '',
        ProductType: '',
        ProductLine: '',
        ProductClass: '',
        Within_24_Hours: '',
        Within_48_Hours: '',
        Within_96_Hours: '',
        MoreThan96_Hours: '',
        gas_charging: '',
        transportation: '',
    });

    const fetchEngineerpopulate = async (ratecardid) => {

        try {
            const response = await axiosInstance.get(`${Base_Url}/getengineerpopulate/${engineerid}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setFormData({
                ...response.data[0],
                // Rename keys to match your formData structure
                title: response.data[0].title,
                mfranchise_id: response.data[0].mfranchise_id,
                cfranchise_id: response.data[0].cfranchise_id,
                mobile_no: response.data[0].mobile_no,
                password: response.data[0].password,
                email: response.data[0].email,
                employee_code: response.data[0].employee_code,
                personal_email: response.data[0].personal_email,
                personal_mobile: response.data[0].personal_mobile,
                dob: response.data[0].dob,
                blood_group: response.data[0].blood_group,
                academic_qualification: response.data[0].academic_qualification,
                joining_date: response.data[0].joining_date,
                passport_picture: response.data[0].passport_picture,
                resume: response.data[0].resume,
            });


            setIsEdit(true);

            if (response.data[0].mfranchise_id) {
                fetchParentfranchise(response.data[0].mfranchise_id);
            }
            if (response.data[0].cfranchise_id) {
                fetchChildfranchise(response.data[0].cfranchise_id);
            }



        } catch (error) {
            console.error('Error fetching Enginnerdata:', error);
            setFormData([]);
        }
    };


    const fetchParentfranchise = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getparentfranchise`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setParentfranchise(decryptedData);
        } catch (error) {
            console.error("Error fetching Parentfranchise:", error);
        }
    };

    const fetchChildfranchise = async (mfranchise_id) => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getchildfranchise/${mfranchise_id}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setChildfranchise(response.data);
        } catch (error) {
            console.error('Error fetching Childfranchise:', error);
        }
    };


    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getrate`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setUsers(decryptedData);
            setFilteredUsers(decryptedData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchParentfranchise();

        if (engineerid != 0) {
            fetchEngineerpopulate(engineerid);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        switch (name) {
            case "mfranchise_id":
                fetchChildfranchise(value);
                break;
            default:
                break;
        }
    };



    // Step 2: Add form validation function
    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = "Engineer Name Field is required.";
        }

        // Check if the cfranchise_id is empty
        if (!formData.cfranchise_id) {
            newErrors.cfranchise_id = "Child Franchise selection is required.";
        }
        if (!formData.mfranchise_id) {
            newErrors.mfranchise_id = "Main Franchise selection is required.";
        }
        if (!formData.email) {
            newErrors.email = "Engineer Email Field is required.";
        }
        if (!formData.mobile_no) {
            newErrors.mobile_no = "Engineer Mobile No Field is required.";
        }
        if (!formData.password) {
            newErrors.password = "Engineer Password Field is required.";
        }
        if (!formData.title) {
            newErrors.title = "Engineer Name Field is required.";
        }
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
        const payload = {
            ...formData,
            joining_date: joining_date,
            dob: selectedDate,
            password: md5(formData.password),
            created_by,
        }

        console.log(payload, "TTT")


        const encryptedData = CryptoJS.AES.encrypt(
            JSON.stringify(payload),
            secretKey
        ).toString();

        setDuplicateError(''); // Clear duplicate error before submitting

        try {
            const confirmSubmission = window.confirm("Do you want to submit the data?");
            if (confirmSubmission) {
                if (isEdit) {

                    const formDataToSend = new FormData();
                    formDataToSend.append('encryptedData', encryptedData);

                    // Append files
                    if (formData.passport_picture) {
                        formDataToSend.append('passport_picture', formData.passport_picture);
                    }
                    if (formData.resume) {
                        formDataToSend.append('resume', formData.resume);
                    }
                    if (formData.photo_id_proof) {
                        formDataToSend.append('photo_id_proof', formData.photo_id_proof);
                    }
                    if (formData.gov_address_proof) {
                        formDataToSend.append('gov_address_proof', formData.gov_address_proof);
                    }

                    // For update, include duplicate check
                    await axiosInstance.post(`${Base_Url}/putengineer`, formDataToSend
                        , {
                            headers: {
                                Authorization: token,
                            },
                        })
                        .then(response => {
                            alert("Engineer Updated")
                            setFormData({
                                title: '',
                                mfranchise_id: '',
                                cfranchise_id: '',
                                password: '',
                                email: '',
                                mobile_no: '',
                                employee_code: '',
                                personal_email: '',
                                personal_mobile: '',
                                dob: '',
                                blood_group: '',
                                academic_qualification: '',
                                joining_date: '',
                                passport_picture: '',
                                resume: '',
                                photo_id_proof: '',
                                gov_address_proof: '',
                                permanent_address: '',
                                current_address: ''
                            })
                            fetchUsers();
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError('Duplicate entry,Email and Mobile No Credential already exists!'); // Show duplicate error for update
                            }
                        });
                } else {



                    const formDataToSend = new FormData();
                    formDataToSend.append('encryptedData', encryptedData);

                    // Append files
                    if (formData.passport_picture) {
                        formDataToSend.append('passport_picture', formData.passport_picture);
                    }
                    if (formData.resume) {
                        formDataToSend.append('resume', formData.resume);
                    }
                    if (formData.photo_id_proof) {
                        formDataToSend.append('photo_id_proof', formData.photo_id_proof);
                    }
                    if (formData.gov_address_proof) {
                        formDataToSend.append('gov_address_proof', formData.gov_address_proof);
                    }
                    // For insert, include duplicate check
                    await axiosInstance.post(`${Base_Url}/postengineer`, formDataToSend
                        , {
                            headers: {
                                Authorization: token,
                                'Content-Type': 'multipart/form-data'
                            },
                        }
                    )
                        .then(response => {
                            alert("Engineer Added")
                            setFormData({
                                title: '',
                                mfranchise_id: '',
                                cfranchise_id: '',
                                password: '',
                                email: '',
                                mobile_no: '',
                                employee_code: '',
                                personal_email: '',
                                personal_mobile: '',
                                dob: '',
                                blood_group: '',
                                academic_qualification: '',
                                joining_date: '',
                                passport_picture: '',
                                resume: '',
                                photo_id_proof: '',
                                gov_address_proof: '',
                                permanent_address: '',
                                current_address: ''
                            })
                            fetchUsers();
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError('Duplicate entry,Email and Mobile No Credential already exists!'); // Show duplicate error for insert
                            }
                        });
                }
            }
        } catch (error) {
            console.error('Error during form submission:', error);
        }
    };




    const indexOfLastUser = (currentPage + 1) * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    // const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
        pageid: String(66)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End

    return (
        <div className="tab-content">
            <Ratecardtabs />
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
                                <div className="col-12">
                                    <form onSubmit={handleSubmit} className="col-12">
                                        <div className='row'>
                                            <div className="col-md-3">
                                                <label htmlFor="Master  Franchise" className="form-label pb-0 dropdown-label">Master Service Partner<span className="text-danger">*</span></label>
                                                <select className='form-select dropdown-select' name='mfranchise_id' value={formData.mfranchise_id} onChange={handleChange} >
                                                    <option value="">Select Master Service Partner</option>
                                                    {Parentfranchise.map((pf) => (
                                                        <option key={pf.id} value={pf.licarecode}>{pf.title}</option>
                                                    ))}
                                                </select>
                                                {errors.mfranchise_id && <small className="text-danger">{errors.mfranchise_id}</small>} {/* Show error for Child Franchise selection */}
                                            </div>
                                            <div className="col-md-3">
                                                <label htmlFor="Child Franchise" className="form-label pb-0 dropdown-label">Child Service Partner<span className="text-danger">*</span></label>
                                                <select className='form-select dropdown-select' name='cfranchise_id' value={formData.cfranchise_id} onChange={handleChange} >
                                                    <option value="">Select Child Service Partner</option>
                                                    {Childfranchise.map((pf) => (
                                                        <option key={pf.id} value={pf.licare_code}>{pf.title}</option>
                                                    ))}
                                                </select>
                                                {errors.cfranchise_id && <small className="text-danger">{errors.cfranchise_id}</small>} {/* Show error for Child Franchise selection */}
                                            </div>
                                            <div className="col-md-3">
                                                <label htmlFor="academicQualificationInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Academic Qualification</label>
                                                <select
                                                    className="form-select"
                                                    name="academic_qualification"
                                                    id="academicQualificationInput"
                                                    value={formData.academic_qualification}  // Updated value to match "academicQualification"
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Academic Qualification</option>  // Placeholder option
                                                    <option value="Ssc">SSC</option>
                                                    <option value="Hsc">HSC</option>
                                                    <option value="Graduate">Graduate</option>
                                                    <option value="Postgraduate">Postgraduate</option>
                                                    <option value="Diploma">Diploma</option>
                                                    <option value="Iti">ITI</option>
                                                    <option value="Engineering">Engineering</option>
                                                    <option value="Other">Other</option>

                                                    {/* Add more options as necessary */}
                                                </select>
                                                {errors.academic_qualification && <small className="text-danger">{errors.academic_qualification}</small>}
                                                {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                                            </div>
                                        </div>
                                        {roleaccess > 2 ? <div className="text-right">
                                            <button className="btn btn-liebherr" type="submit" style={{ marginTop: '15px' }}>
                                                {isEdit ? "Update" : "Submit"}
                                            </button>
                                        </div> : null}  

                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> : null}
        </div>
    );
};

export default AddRatecard;
