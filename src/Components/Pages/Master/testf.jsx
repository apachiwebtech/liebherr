<<<<<<< Updated upstream
<<<<<<< Updated upstream
app.post("/postcustomerlocation", (req, res) => {
  const { country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type } = req.body;
=======
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Base_Url } from "../../Utils/Base_Url";
>>>>>>> Stashed changes

export function Complaintview(params) {
  const { complaintid } = useParams();
  const [complaintview, setComplaintview] = useState([]);
  const [note, setNote] = useState(""); // Input field value
  const [files, setFiles] = useState([]); // Store selected files
  const [remarks, setRemarks] = useState([]);
  const [duplicate, setDuplicate] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [currentAttachment, setCurrentAttachment] = useState(""); // Current attachment for modal

  const created_by = 1 ;

  const fetchComplaintDetails = async () => {
    try {
      const response = await axios.get(
        `${Base_Url}/getComplaintDetails/${complaintview.ticket_no}`
      );
      setRemarks(response.data.remarks);
      setAttachments(response.data.attachments);
    } catch (error) {
      console.error("Error fetching complaint details:", error);
    }
  };

  const fetchComplaintview = async (complaintid) => {
    try {
      const response = await axios.get(
        `${Base_Url}/getcomplaintview/${complaintid}`
      );
      console.log(response.data);
      setComplaintview(response.data);
    } catch (error) {
      console.error("Error fetching complaint view:", error);
    }
  };

  const fetchComplaintDuplicate = async () => {
    try {
      const response = await axios.get(
        `${Base_Url}/getComplaintDuplicate/${complaintview.customer_mobile}`
      );
      setDuplicate(response.data);
    } catch (error) {
      console.error("Error fetching complaint details:", error);
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!note && files.length === 0) {
      setErrorMessage("Please fill the field and upload a file.");
      return;
    } else if (!note) {
      setErrorMessage("Please fill the field.");
      return;
    } else if (files.length === 0) {
      setErrorMessage("Please upload a file.");
      return;
    }

    try {
      const complaintRemarkData = {
        ticket_no: complaintview.ticket_no,
        note,
        created_by,
      };

      const remarkResponse = await axios.post(
        `${Base_Url}/addcomplaintremark`,
        complaintRemarkData
      );
      const remarkId = remarkResponse.data.insertId;

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("ticket_no", complaintview.ticket_no);
        formData.append("remark_id", remarkId);
        formData.append("created_by", created_by);

        Array.from(files).forEach((file) => {
          formData.append("attachment", file);
        });

        await axios.post(`${Base_Url}/uploadcomplaintattachments`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      alert("Complaint remark and files submitted successfully!");
      fetchComplaintDetails();
    } catch (error) {
      console.error("Error submitting complaint remark or files:", error);
      alert(
        `Error submitting data: ${
          error.response ? error.response.data.error : error.message
        }`
      );
    }
  };

  useEffect(() => {
    if (complaintid) {
      fetchComplaintview(complaintid);
    }

<<<<<<< Updated upstream
                    customer_fname: '',
                    customer_lname: '',
                    customer_type: '',
                    customer_classification: '',
                    mobileno: '',
                    alt_mobileno: '',
                    dateofbirth: '',
                    anniversary_date: '',
                    email: '',
=======
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";

const Location = () => {
  // Step 1: Add this state to track errors
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error

  const [formData, setFormData] = useState({
    title: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getdata`);
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
      (user) => user.title && user.title.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {}; // Initialize an empty error object
    if (!formData.title.trim()) {
      // Check if the title is empty
      newErrors.title = "Country Field is required."; // Set error message if title is empty
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
          // For update, include duplicate check
          await axios
            .put(`${Base_Url}/putdata`, { ...formData })
            .then((response) => {
              setFormData({
                title: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Country already exists!"); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include duplicate check
          await axios
            .post(`${Base_Url}/postdata`, { ...formData })
            .then((response) => {
              setFormData({
                title: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Country already exists!"); // Show duplicate error for insert
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
      const response = await axios.post(`${Base_Url}/deletedata`, { id });
      setFormData({
        title: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestdata/${id}`);
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
                    <label htmlFor="countryInput" className="input-field">
                      Add Country
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      id="countryInput"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter country"
                    />
                    {errors.title && (
                      <small className="text-danger">{errors.title}</small>
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
                <table className="table table-bordered table dt-responsive nowrap w-100 table-css">
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        #
                      </th>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        Title
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
                        <td style={{ padding: "10px" }}>{item.title}</td>
                        <td style={{ padding: "0px", textAlign: "center" }}>
                          <button
                            className="btn"
                            onClick={() => {
                              // alert(item.id)
                              edit(item.id);
                            }}
                            title="Edit"
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
                            title="Delete"
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
=======
    if (complaintview.customer_mobile) {
      fetchComplaintDuplicate(complaintview.customer_mobile);
    }
    if (complaintview.ticket_no) {
      fetchComplaintDetails();
    }
  }, [complaintid, complaintview.ticket_no, complaintview.customer_mobile]);

  const handleAttachmentClick = (attachment) => {
    console.log("Attachment clicked:", attachment);
    setCurrentAttachment(attachment);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="p-3">
      <style>
        {`
          .modal {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
          }

          .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            width: 80%;
            max-width: 600px;
            position: relative;
          }

          .close {
            position: absolute;
            top: 10px;
            right: 15px;
            cursor: pointer;
            font-size: 24px;
          }
        `}
      </style>
      <div className="row mp0">
        <div className="complbread">
          <div className="row">
            <div className="col-md-3">
              <label className="breadMain">
                Complaint : {complaintview.ticket_no}
              </label>
            </div>
            <div className="col-md-9 text-right pt-2">
              {/* Buttons can be added here if needed */}x``
            </div>
          </div>
        </div>
      </div>

      <div className="row mp0 mt-25">
        <div className="col-3">
          <div id="customerInfo" className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <h4 className="pname">{complaintview.customer_name}</h4>
                </div>
              </div>

              <p>
                {complaintview.address}, Pincode: {complaintview.pincode}
              </p>
              <p>M : {complaintview.customer_mobile}</p>

              <p>Ticket Type: {complaintview.ticket_type}</p>
              <p>Call Type: {complaintview.call_type}</p>
              <p>Warranty Status: {complaintview.warranty_status}</p>

              <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    id="home-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#home"
                    type="button"
                    role="tab"
                    aria-controls="home"
                    aria-selected="true"
                  >
                    Previous Ticket
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="profile-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#profile"
                    type="button"
                    role="tab"
                    aria-controls="profile"
                    aria-selected="false"
                  >
                    Products
                  </a>
                </li>
              </ul>

              <div className="tab-content">
                <div
                  className="tab-pane active"
                  id="home"
                  role="tabpanel"
                  aria-labelledby="home-tab"
                >
                  <table className="table table-striped">
                    <tbody>
                      {duplicate.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div>{item.ticket_no}</div>
                            <div>{formatDate(item.ticket_date)}</div>
                          </td>
                          <td>Liebherr 472L</td>
                          <td>
                            <div>{item.call_status}</div>
                            <span>View Info</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="tab-pane"
                  id="profile"
                  role="tabpanel"
                  aria-labelledby="profile-tab"
                >
                  <table className="table table-striped">
                    <tr>
                      <td>
                        <div>SRL01025252252</div>
                        <div>02-06-2024</div>
                      </td>
                      <td>
                        <div>Liebherr 472L</div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suraj  Start*/}
        <div className="col-6">
          <div className="card" id="csformInfo">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <h3 className="mainheade">
                    Complaint{" "}
                    <span id="compaintno1">: {complaintview.ticket_no}</span>
                  </h3>
                </div>
              </div>

              <div className="row d-flex justify-content-center">
                <div className="col-md-12 col-lg-12">
                  <div
                    className="card shadow-0 border"
                    style={{ backgroundColor: "#f0f2f5" }}
                  >
                    <form>
                      <div className="card-body p-4">
                        <div className="form-outline mb-2">
                          <input
                            type="text"
                            id="addANote"
                            name="note"
                            className="form-control"
                            placeholder="Type comment..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>

                        {/* File upload field for images, videos, and audio */}
                        <div className="form-outline mb-4">
                          <label
                            htmlFor="uploadFiles"
                            className="form-label mp-0"
                          >
                            Upload Files (Images, Videos, Audios)
                          </label>
                          <input
                            type="file"
                            id="uploadFiles"
                            name="attachment"
                            className="form-control"
                            multiple
                            accept="image/*,video/*,audio/*"
                            onChange={handleFileChange}
                          />
                        </div>

                        {/* Consolidated error message */}
                        {errorMessage && (
                          <div className="text-danger mt-2">{errorMessage}</div>
                        )}

                        {/* Right-aligned submit button */}
                        <div className="d-flex justify-content-end">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
>>>>>>> Stashed changes
                  </div>
                </div>
              </div>
            </div>
          </div>
<<<<<<< Updated upstream
=======

          {/* Remark List Section */}
          <div className="mt-3" id="remarksSection">
            <div className="row">
              <div className="col-md-12">
                <h3 className="mainheade">
                  Remark Record Of{" "}
                  <span id="compaintno1">
                    : {complaintview.ticket_no} Ticket Number
                  </span>
                </h3>
              </div>
            </div>

            {/* Listing remarks */}
            {/* Listing remarks */}
            <div className="remarks-attachments">
              {remarks.length > 0 ? (
                remarks.map((remark) => (
                  <div key={remark.id} className="card mb-3 remark-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h3 className="mainheade">Remark</h3>
                        <h3 className="mainheade">By: {remark.created_by}</h3>
                      </div>

                      <p>
                        {remark.remark} <p></p>
                      </p>
                      {attachments.filter((att) => att.remark_id === remark.id)
                        .length > 0 && (
                        <div className="attachments">
                          <h3 className="mainheade">Attachments</h3>
                          {attachments
                            .filter((att) => att.remark_id === remark.id)
                            .map((attachment) => (
                              <div
                                key={attachment.id}
                                className="attachment"
                                style={{
                                  display: "inline-block",
                                  marginRight: "10px",
                                }} // inline block and margin added
                              >
                                <span
                                  style={{
                                    color: "blue",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleAttachmentClick(attachment.attachment)
                                  }
                                >
                                  {attachment.attachment}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No remarks available.</p>
              )}
            </div>

            {isModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <span className="close" onClick={() => setIsModalOpen(false)}>
                    &times;
                  </span>
                  {/* Determine file type and render accordingly */}
                  {currentAttachment.toLowerCase().endsWith(".jpg") ||
                  currentAttachment.toLowerCase().endsWith(".jpeg") ||
                  currentAttachment.toLowerCase().endsWith(".png") ? (
                    <img
                      src={`${Base_Url}/uploads/${currentAttachment}`}
                      alt="attachment"
                      style={{ width: "100%" }}
                    />
                  ) : currentAttachment.toLowerCase().endsWith(".mp4") ||
                    currentAttachment.toLowerCase().endsWith(".mov") ||
                    currentAttachment.toLowerCase().endsWith(".avi") ? (
                    <video controls style={{ width: "100%" }}>
                      <source
                        src={`${Base_Url}/uploads/${currentAttachment}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : currentAttachment.toLowerCase().endsWith(".mp3") ||
                    currentAttachment.toLowerCase().endsWith(".wav") ? (
                    <audio controls>
                      <source
                        src={`${Base_Url}/uploads/${currentAttachment}`}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio tag.
                    </audio>
                  ) : currentAttachment.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={`${Base_Url}/uploads/${currentAttachment}`}
                      style={{ width: "100%", height: "500px" }} // Adjust height as needed
                      title="PDF Document"
                    >
                      Your browser does not support PDFs.{" "}
                      <a href={`${Base_Url}/uploads/${currentAttachment}`}>
                        Download the PDF
                      </a>
                    </iframe>
                  ) : currentAttachment.toLowerCase().endsWith(".doc") ||
                    currentAttachment.toLowerCase().endsWith(".docx") ? (
                    <iframe
                      src={`https://docs.google.com/gview?url=${Base_Url}/uploads/${currentAttachment}&embedded=true`}
                      style={{ width: "100%", height: "500px" }} // Adjust height as needed
                      title="Word Document"
                    >
                      Your browser does not support Word documents.{" "}
                      <a href={`${Base_Url}/uploads/${currentAttachment}`}>
                        Download the Word document
                      </a>
                    </iframe>
                  ) : currentAttachment.toLowerCase().endsWith(".xls") ||
                    currentAttachment.toLowerCase().endsWith(".xlsx") ? (
                    <iframe
                      src={`https://docs.google.com/gview?url=${Base_Url}/uploads/${currentAttachment}&embedded=true`}
                      style={{ width: "100%", height: "500px" }} // Adjust height as needed
                      title="Excel Document"
                    >
                      Your browser does not support Excel documents.{" "}
                      <a href={`${Base_Url}/uploads/${currentAttachment}`}>
                        Download the Excel document
                      </a>
                    </iframe>
                  ) : (
                    <p>Unsupported file type.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* suraj end */}

        <div className="col-3">
          <div className="card mb-3" id="productInfocs">
            <div className="card-body">
              <h4 className="pname">Call Status</h4>
              <div className="mb-3">
                <select className="form-control">
                  <option value="">Select Status</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Duplicates">Duplicates</option>
                  <option value="Spares">Spares</option>
                  <option value="In Process">In Process</option>
                  <option value="DOA">DOA</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card mb-3" id="productInfocs">
            <div className="card-body">
              <h4 className="pname">Product</h4>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  value="Liebherr 472L"
                />
              </div>
            </div>
          </div>

          <div className="card mb-3" id="engineerInfocs">
            <div className="card-body">
              <h4 className="pname">Engineer</h4>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  value="John Smith"
                />
              </div>
            </div>
          </div>

          <div className="card" id="attachmentInfocs">
            <div className="card-body">
              <h4 className="pname">Attachment 2</h4>
              <div className="mb-3">
                <input type="file" className="form-control" />
              </div>
              <div id="allattachme">
                {/* Attachment section commented out */}
              </div>
            </div>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
<<<<<<< Updated upstream
};

export default Location;
>>>>>>> Stashed changes
=======
}
>>>>>>> Stashed changes
