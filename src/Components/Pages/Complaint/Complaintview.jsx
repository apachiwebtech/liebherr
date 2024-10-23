import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Base_Url } from "../../Utils/Base_Url";

export function Complaintview(params) {
  const { complaintid } = useParams();
  const [complaintview, setComplaintview] = useState([]);
  const [note, setNote] = useState(""); // Input field value
  const [files, setFiles] = useState([]); // Store selected files
  const [remarks, setRemarks] = useState([]);
  const [duplicate, setDuplicate] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [currentAttachment, setCurrentAttachment] = useState(""); // Current attachment for modal

  const created_by = 4;

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
    setFiles(e.target.files); // Store files from the input field
  };

  const handleSubmit = async () => {
    try {
      // Prepare data for the complaint remark
      const complaintRemarkData = {
        ticket_no: complaintview.ticket_no, // Correctly access ticket_no from complaintview
        note,
        created_by,
      };

      // First, insert the complaint remark
      const remarkResponse = await axios.post(
        `${Base_Url}/addcomplaintremark`,
        complaintRemarkData
      );
      const remarkId = remarkResponse.data.insertId; // Get the inserted remark ID

      // Now handle file uploads, if there are files
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("ticket_no", complaintview.ticket_no);
        formData.append("remark_id", remarkId);
        formData.append("created_by", created_by);

        // Append all selected files to the form data
        Array.from(files).forEach((file) => {
          formData.append("attachment", file);
        });

        // Send files to the server
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
      ); // Display detailed error
    }
  };

  useEffect(() => {
    if (complaintid) {
      fetchComplaintview(complaintid);
    }

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
                      {/* <tr>
                        <td>
                          <div>LB240624002</div>
                          <div>02-06-2024</div>
                        </td>
                        <td>Liebherr 472L</td>
                        <td>
                          <div>Closed</div>
                          <span>View Info</span>
                        </td>
                      </tr> */}
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
                    <div className="card-body p-4">
                      <div className="form-outline mb-2">
                        <input
                          type="text"
                          id="addANote"
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
                          className="form-control"
                          multiple
                          accept="image/*,video/*,audio/*"
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* Right-aligned submit button */}
                      <div className="d-flex justify-content-end">
                        <button
                          type="button" // Change to "button" to prevent form submission
                          className="btn btn-primary"
                          onClick={handleSubmit}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                          <h3 className="mainheade" >Attachments</h3>
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
              <h4 className="pname">Attachment</h4>
              <div className="mb-3">
                <input type="file" className="form-control" />
              </div>
              <div id="allattachme">
                {/* Attachment section commented out */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
