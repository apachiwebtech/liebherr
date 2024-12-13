import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import Complainttabs from './Complainttabs';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
DataTable.use(DT);

const ComplaintCode = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const token = localStorage.getItem("token");
  // Step 1: Add this state to track errors
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const created_by = localStorage.getItem("userId");
  const updated_by = localStorage.getItem("userId");


  const [formData, setFormData] = useState({
    defectgroupcode: "",
    defectgrouptitle: "",
    description: "",
    created_by: created_by,
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcom`,{
        headers: {
          Authorization: token,
        },
      });
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
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
      (user) =>
        user.defectgroupcode && user.defectgroupcode.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {}; // Initialize an empty error object
    if (!formData.defectgroupcode.trim()) {
      // Check if the defectgroupcode is empty
      newErrors.defectgroupcode = "Defect Group Code Field is required."; // Set error message if defectgroupcode is empty
    }

    if (!formData.defectgrouptitle.trim()) {

      newErrors.defectgrouptitle = "Defect Group Title Field is required.";
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
            .post(`${Base_Url}/putcomdata`, {
              ...formData,
              updated_by: updated_by,
            },{
              headers: {
                Authorization: token,
              },
            })
            .then((response) => {

              setFormData({
                defectgroupcode: "",
                defectgrouptitle: "",
                description: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Defect Group Code already exists!"
                ); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include 'updated_by'
          await axios
            .post(`${Base_Url}/postdatacom`, {
              ...formData,
              updated_by: created_by,
            },{
              headers: {
                Authorization: token,
              },
            })
            .then((response) => {

              setFormData({
                defectgroupcode: "",
                defectgrouptitle: "",
                description: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Defect Group Code already exists!"
                ); // Show duplicate error for insert
              }
            });
        }
        setIsEdit(false);

      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const deleted = async (id) => {
    try {
      const response = await axiosInstance.post(`${Base_Url}/deletecomdata`, { id },{
        headers: {
          Authorization: token,
        },
      }
);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestdatacom/${id}`,{
        headers: {
          Authorization: token,
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
          {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
    <Complainttabs />
    <div className="row mp0">
      <div className="col-12">
        <div className="card mb-3 tab_box">
          <div
            className="card-body"
            style={{ flex: "1 1 auto", padding: "13px 28px" }}
          >
            <div className="row mp0">
              <div className="col-6">
                <form
                  onSubmit={handleSubmit}
                  style={{ width: "50%" }}
                  className="text-left"
                >
                  <div className="mb-3">
                    <label htmlFor="ComplaintcodeInput" className="input-field">
                      Defect Group Code<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="defectgroupcode"
                      id="defectgroupcode"
                      value={formData.defectgroupcode}
                      onChange={handleChange}
                      placeholder="Enter Defect Group Code "
                      pattern="[0-9]*" // This pattern ensures only numbers are allowed
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Remove any non-numeric characters
                      }}
                    />
                    {errors.defectgroupcode && (
                      <small className="text-danger">
                        {errors.defectgroupcode}
                      </small>
                    )}
                    {duplicateError && (
                      <small className="text-danger">{duplicateError}</small>
                    )}{" "}
                    {/* Show duplicate error */}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ComplaintcodeInput" className="input-field">
                      Defect Group Title<span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="defectgrouptitle"
                        id="defectgrouptitle"
                        value={formData.defectgrouptitle}
                        onChange={handleChange}
                        placeholder="Enter Defect Group Title "
                      />
                    {errors.defectgrouptitle && (
                      <small className="text-danger">
                        {errors.defectgrouptitle}
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

                  </div>
                  <div className="text-right">
                    <button className="btn btn-liebherr" type="submit">
                      {isEdit ? "Update" : "Submit"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="col-md-6">
                {/* Adjust table padding and spacing */}
                <table data={filteredUsers} className="table table-bordered table-responsive table-hover mt-3">
                    <thead className="thead-light">
                      <tr>
                        <th className="text-center">#</th>
                        <th className="text-center">Defect Group Code</th>
                        <th className="text-center">Defect Group Title</th>
                        <th className="text-center">Description</th>
                        <th className="text-center">Edit</th>
                        <th className="text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1 + indexOfFirstUser}</td>
                          <td>{item.defectgroupcode}</td>
                          <td>{item.defectgrouptitle}</td>
                          <td>{item.description}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => edit(item.id)}
                              style={{ fontSize: "20px" }}
                            >
                              <FaPencilAlt />
                            </button>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-danger"
                              onClick={() => deleted(item.id)}
                              style={{ fontSize: "20px" }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                {/* <DataTable
                  data={currentUsers}
                  columns={[
                    { title: '#', data: null, render: (data, type, row, meta) => meta.row + 1 + indexOfFirstUser },
                    { title: 'Complaint Code', data: 'defectgroupcode' },
                    {
                      title: 'Edit', data: null, render: (data, type, row) => (

                        // <button
                        //   className="btn btn-link text-primary"
                        //   onClick={() => edit(row.id)}
                        //   style={{ fontSize: "20px" }}
                        // >
                        // </button>
                          // <FaPencilAlt />
                          <div>edit</div>
                      )
                    },
                    {
                      title: 'Delete', data: null, render: (data, type, row) => (
                        <button
                          className="btn btn-link text-danger"
                          onClick={() => deleted(row.id)}
                          style={{ fontSize: "20px" }}
                        >
                          <FaTrash />
                        </button>
                      )
                    }
                  ]}
                  className="table table-bordered table-responsive table-hover mt-3"
                /> */}



              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ComplaintCode;
