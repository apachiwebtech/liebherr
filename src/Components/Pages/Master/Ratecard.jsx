import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";

const Ratecard = () => {
  // Step 1: Add this state to track errors
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const createdBy = 1; // Static value for created_by
  const updatedBy = 2; // Static value for updated_by

  const [formData, setFormData] = useState({
    Ratecard: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getratedata`);
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
            .put(`${Base_Url}/putratedata`, {
              ...formData,
              updated_by: updatedBy,
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
    try {
      const response = await axios.post(`${Base_Url}/deleteratedata`, { id });
      // alert(response.data[0]);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestprodata/${id}`);
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
                    <label htmlFor="RatecardInput" className="input-field">
                      Add Rate Card Matrix
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="Ratecard"
                      id="RatecardInput"
                      value={formData.Ratecard}
                      onChange={handleChange}
                      placeholder="Enter Rate Card Matrix "
                    />
                    {errors.Ratecard && (
                      <small className="text-danger">{errors.Ratecard}</small>
                    )}
                    {duplicateError && (
                      <small className="text-danger">{duplicateError}</small>
                    )}{" "}
                    {/* Show duplicate error */}
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
                </div>

                {/* Adjust table padding and spacing */}
                <table
                  className="table table-bordered table dt-responsive nowrap w-100 table-css"
                  style={{ marginTop: "20px", tableLayout: "fixed" }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        #
                      </th>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        Rate Card Matrix
                      </th>
                      <th style={{ padding: "0px 0px", textAlign: "center" }}>
                        Edit
                      </th>
                      <th style={{ padding: "0px 0px", textAlign: "center" }}>
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: "2px", textAlign: "center" }}>
                          {index + 1 + indexOfFirstUser}
                        </td>
                        <td style={{ padding: "10px" }}>{item.Ratecard}</td>
                        <td style={{ padding: "0px", textAlign: "center" }}>
                          <button
                            className="btn"
                            onClick={() => {
                              // alert(item.id)
                              edit(item.id);
                            }}
                            Ratecard="Edit"
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
                            Ratecard="Delete"
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
                        length: Math.ceil(filteredUsers.length / itemsPerPage),
                      },
                      (_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={currentPage === index ? "active" : ""}
                        >
                          {index + 1}
                        </button>
                      )
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
    </div>
  );
};

export default Ratecard;
