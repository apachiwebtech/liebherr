import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import Ratecardtabs from "./Ratecardtabs";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import * as XLSX from "xlsx";

const Ratecard = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [excelData, setExcelData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const token = localStorage.getItem("token"); // Get token from localStorage
  const createdBy = 1; // Static value for created_by
  const updatedBy = 2; // Static value for updated_by

  const [formData, setFormData] = useState({
    Ratecard: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getratedata`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      console.log(decryptedData);
      setUsers(decryptedData);
      setFilteredUsers(decryptedData);
    } catch (error) {
      console.error("Error fetching users:", error);
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
    const filtered = users.filter(
      (user) => user.Ratecard && user.Ratecard.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {}; // Initialize an empty error object
    if (!formData.Ratecard.trim()) {
      // Check if the Ratecard is empty
      newErrors.Ratecard = "Ratecard Field is required."; // Set error message if Ratecard is empty
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

    setDuplicateError(""); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include 'updated_by'
          await axios
            .post(`${Base_Url}/putratedata`, {
              ...formData,
              updated_by: updatedBy,
            }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              //window.location.reload();
              setFormData({
                Ratecard: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Ratecard already exists!"); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include 'created_by'
          await axios
            .post(`${Base_Url}/postratedata`, {
              ...formData,
              created_by: createdBy,
            }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              // window.location.reload();
              setFormData({
                Ratecard: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Ratecard already exists!"); // Show duplicate error for insert
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const deleted = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete ?");

    if (confirm) {
      try {
        const response = await axiosInstance.post(`${Base_Url}/deleteratedata`, { id }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
        // alert(response.data[0]);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestratedata/${id}`, {
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


  const importexcel = (event) => {
    // If triggered by file input
    const file = event?.target?.files ? event.target.files[0] : null;

    // If triggered by button click, use the file uploaded
    if (!file) {
      alert("Please upload an Excel file first!");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
      setExcelData(jsonData);
      console.log("Excel Data Imported:", jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const uploadexcel = () => {

    const data = {
      excelData: JSON.stringify(excelData),
      created_by: localStorage.getItem("licare_code")
    }

    axios.post(`${Base_Url}/uplaodratecardexcel`, data,{
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data) {
          alert("Uploaded")
        }
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({

      "RateCardMatrix": user.Ratecard,
      "CspCode": user.csp_code,
      "Sub_Call_Type": user.sub_call_type,
      "Warranty_Type": user.warranty_type,
      "ItemCode": user.item_code,
      "Class_city": user.class_city,
      "Engineer_Level": user.engineer_level,
      "ProductType": user.ProductType,
      "ProductLine": user.ProductLine,
      "ProductClass": user.ProductClass,
      "Within_24_Hours": user.Within_24_Hours,
      "Within_48_Hours": user.Within_48_Hours,
      "Within_96_Hours": user.Within_96_Hours,
      "MoreThan96_Hours": user.MoreThan96_Hours,
      "gas_charging": user.gas_charging,
      "transportation": user.transportation,



    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "RateCard");

    // Export the workbook
    XLSX.writeFile(workbook, "RateCard.xlsx");
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
    pageid: String(37)
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
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-md-12 col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div>
                <input type="file" accept=".xlsx, .xls" onChange={importexcel} />
                <button className="btn btn-primary" onClick={uploadexcel}>
                  Import Rate Card
                </button>

              </div>
              <div className='table-responsive'>
                <button
                  className="btn btn-primary"
                  onClick={exportToExcel}
                >
                  Export to Excel
                </button>
                <table id="example" className="table table-striped">
                  <thead>
                    <tr>
                      <th width="3%">#</th>
                      <th width="10%">Call Type</th>
                      <th width="10%">Class city</th>
                      <th width="10%">Product Type</th>
                      <th width="10%">Product Line</th>
                      <th width="10%">Product Class</th>




                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.call_type}</td>
                        <td>{item.class_city}</td>
                        <td>{item.ProductType}</td>
                        <td>{item.ProductLine}</td>
                        <td>{item.ProductClass}</td>


                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default Ratecard;
