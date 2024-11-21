import axios from "axios";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Base_Url } from "../../Utils/Base_Url";
import { FaEye } from "react-icons/fa";

export function Complaintview(params) {
  const { complaintid } = useParams();
  const [complaintview, setComplaintview] = useState({
    ticket_no: '',
    customer_name: '',
    address: '',
    pincode: '',
    customer_mobile: '',
    ticket_type: '',
    call_type: '',
    warranty_status: '',
    ModelNumber: '',
    invoice_date: '',
    serial_no: '',
    call_status: '',
    engineer_id: ''
  });


    
  const [sserial_no, setsserial_no] = useState([]);
  const [product, setProduct] = useState([]);
  const [engineer, setEngineer] = useState([]); // Initialize as empty array
  const [note, setNote] = useState(""); // Input field value
  const [files, setFiles] = useState([]); // Store selected files
  const [remarks, setRemarks] = useState([]);
  const [duplicate, setDuplicate] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [files2, setFiles2] = useState([]); // New state for Attachment 2 files
  const fileInputRef = useRef(); // Ref for Attachment 1 input
  const fileInputRef2 = useRef(); // Create a ref for the file input

  const [attachments2, setAttachments2] = useState([]); // New state for Attachment 2 list
  const [jsondata , setjsondata] = useState([]);
  const [isModal2Open, setIsModal2Open] = useState(false); // New modal state
  const [currentAttachment2, setCurrentAttachment2] = useState(""); // Current attachment 2 for modal

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [currentAttachment, setCurrentAttachment] = useState(""); // Current attachment for modal

const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage

const [TicketUpdateSuccess, setTicketUpdateSuccess] = useState({
  message: '',
  visible: false,
  type: 'success' // can be 'success' or 'error'
});

  async function getProduct(params) {

    axios.get(`${Base_Url}/product_master`)
        .then((res) => {
            if (res.data) {

                setProduct(res.data)
            }
        })

}

async function getEngineer(params) {
  try {
    const res = await axios.get(`${Base_Url}/getcvengineer`);
    
    if (res.data && Array.isArray(res.data)) {
      setEngineer(res.data);
    } else {
      console.error("Expected array from API but got:", typeof res.data);
      setEngineer([]); // Set empty array as fallback
    }
  } catch (error) {
    console.error("Error fetching engineers:", error);
    setEngineer([]); // Set empty array on error
  }
}

// console.log("this is get product",product);

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
//  console.log(remarks , "$$$$")
  const fetchComplaintview = async (complaintid) => {
    try {
      const response = await axios.get(
        `${Base_Url}/getcomplaintview/${complaintid}`
      );
      console.log(response.data);
      setComplaintview(response.data);
      if(response.data.serial_no != ""){
      setsserial_no(response.data.serial_no);
    
    }
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

  // New function to fetch Attachment 2 list
  const fetchAttachment2Details = async () => {
    try {
      const response = await axios.get(
        `${Base_Url}/getAttachment2Details/${complaintview.ticket_no}`
      );
      setAttachments2(response.data.attachments2);
      
    } catch (error) {
      console.error("Error fetching attachment 2 details:", error);
    }
  };

  // New handler for Attachment 2
  const handleFile2Change = (e) => {
    setFiles2(e.target.files);
  };

  // New submit handler for Attachment 2
  const handleAttachment2Submit = async (e) => {
    e.preventDefault();

    
    try {
      if (files2.length > 0) {
        const formData = new FormData();
        formData.append("ticket_no", complaintview.ticket_no);
        formData.append("created_by", created_by);

        Array.from(files2).forEach((file) => {
          formData.append("attachment2", file);
        });

        await axios.post(`${Base_Url}/uploadAttachment2`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert("Attachment 2 files submitted successfully!");

        // Reset the file input and state
        setFiles2([]); // Clear the state
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset the file input element
        }

        fetchAttachment2Details(); // Fetch updated attachment details
      }
    } catch (error) {
      console.error("Error submitting attachment 2:", error);
      alert(
        `Error submitting files: ${
          error.response ? error.response.data.error : error.message
        }`
      );
    }
  };

  const handleModelChange = (e) => { 
    const { name, value } = e.target;

    setComplaintview(prev => ({ ...prev, [name]: value }));
  };
  
//handlesubmitticketdata strat for serial no,model number, engineer_id and call_status and form data
const handleSubmitTicketFormData = (e) => {
  e.preventDefault();
  
  const data = {
    serial_no: complaintview.serial_no,
    ModelNumber: complaintview.ModelNumber,
    engineer_id: complaintview.engineer_id,
    call_status: complaintview.call_status,
    updated_by: 1,
    ticket_no: complaintview.ticket_no
  };

  axios.post(`${Base_Url}/ticketFormData`, data)
    .then(response => {
      console.log("Server response:", response.data);
      setComplaintview({
        ...complaintview,
        serial_no: '',
        ModelNumber: '',
        engineer_id: '',
        call_status: '',
      });
      fetchComplaintview(complaintid);
    
      setTicketUpdateSuccess({
        message: 'Ticket updated successfully!',
        visible: true,
        type: 'success'
      });

      // Hide the message after 3 seconds
      setTimeout(() => {
        setTicketUpdateSuccess({
          message: '',
          visible: false,
          type: 'success'
        });
      }, 3000);
    })
    .catch(error => {
      console.error("Error updating ticket:", error);
      setTicketUpdateSuccess({
        message: 'Error updating ticket. Please try again.',
        visible: true,
        type: 'error'
      });

      setTimeout(() => {
        setTicketUpdateSuccess({
          message: '',
          visible: false,
          type: 'error'
        });
      }, 3000);
    });
};

//handkesubmitticketdata end

  // New handler for Attachment 2 preview
  const handleAttachment2Click = (attachment) => {
    setCurrentAttachment2(attachment);
    setIsModal2Open(true);
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // if (!note && files.length === 0) {
    //   setErrorMessage("Please fill the field and upload a file.");
    //   return;
    // } else if (!note) {
    //   setErrorMessage("Please fill the field.");
    //   return;
    // } else if (files.length === 0) {
    //   setErrorMessage("Please upload a file.");
    //   return;
    // }

      // Check only for note being empty
      if (!note) {
        setErrorMessage("Please fill the field.");
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

      
      const remarkId = remarkResponse.data.remark_id;

      if (files.length > 0 && remarkId > 0)  {
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

      // Reset all form fields and states
      setNote(""); // Clear the note input
      setFiles([]); // Clear the files state

      // Reset file input using the ref
      if (fileInputRef2.current) {
        fileInputRef2.current.value = ""; // Reset the file input for remarks
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

    if (complaintview.customer_mobile) {
      fetchComplaintDuplicate(complaintview.customer_mobile);
    }
    if (complaintview.ticket_no) {
      fetchComplaintDetails();
    }
    if (complaintview.ticket_no) {
      fetchAttachment2Details(); // Add this line to fetch Attachment 2
    }
    getProduct();
    getEngineer();
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

  const successMessageStyle = {
    padding: '10px 15px',
    marginTop: '10px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    opacity: TicketUpdateSuccess.visible ? '1' : '0',
    transition: 'opacity 0.3s ease-in-out',
    backgroundColor: TicketUpdateSuccess.type === 'success' ? '#d4edda' : '#f8d7da',
    color: TicketUpdateSuccess.type === 'success' ? '#155724' : '#721c24',
    border: TicketUpdateSuccess.type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
  };

  const navigate = useNavigate();

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
<span style={{ fontSize: "14px"}}>Complaint : {complaintview.ticket_no}</span>
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
                  <h4 className="pname" style={{ fontSize: "14px"}}>{complaintview.customer_name}</h4>
                </div>
              </div>

              <p style={{ fontSize: "14px"}}>
                {complaintview.address}, Pincode: {complaintview.pincode}
              </p>
              <p style={{ fontSize: "14px"}}>M : {complaintview.customer_mobile}</p>

              <p style={{ fontSize: "14px"}}>Ticket Type: {complaintview.ticket_type}</p>
              <p style={{ fontSize: "14px"}}>Call Type: {complaintview.call_type}</p>
              <p style={{ fontSize: "14px"}}>Warranty Status: {complaintview.warranty_status}</p>

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
                    style={{ fontSize: "14px"}}
                  >
                    Previous Ticket
                  </a>
                </li>
                {/* <li className="nav-item">
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
                </li> */}
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
                                              <div style={{ fontSize: "14px"}}>{item.ticket_no}</div>
                                              <span style={{ fontSize: "14px"}}>{formatDate(item.ticket_date)}</span> 
                                          </td>
                                          <td style={{ fontSize: "14px"}}>{item.ModelNumber}</td>
                                          <td>
                                              <div style={{ fontSize: "14px"}}>{item.call_status}</div>
                                              <span style={{ fontSize: "14px"}}><button
                                                className='btn'
                                                onClick={() => navigate(`/complaintview/${item.id}`)}
                                                title="View"
                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                            >
                                                <FaEye />
                                            </button>View Info</span>
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
                    {/* <table className="table table-striped">
                      <tr>
                        <td>
                          <div>SRL01025252252</div>
                          <div>02-06-2024</div>
                        </td>
                        <td>
                          <div>Liebherr 472L</div>
                        </td>
                      </tr>
                    </table> */}
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

                                    {/* <div className="col-md-4">
                                        <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Model</p>
                                        <p style={{ fontSize: "14px"}}>{complaintview.ModelNumber}</p>
                                    </div> */}


                                      <div className="col-md-4">
                                        <h4 className="pname" style={{ fontSize: "11px"}}>Model</h4>
                                       
                                        <select
                                            className="form-select dropdown-select"
                                            name="ModelNumber"
                                            value={complaintview.ModelNumber}
                                            onChange={handleModelChange}
                                          >
                                            <option value="">Select Model</option>
                                            {product.map((products) => (
                                              <option key={products.id} value={products.item_description}>
                                                {products.item_description}
                                              </option>
                                            ))}
                                          </select>
                                      </div>
                                      

                                      <div className="col-md-2">
                                        <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>
                                          Serial No
                                        </p>
                                        {sserial_no ? (
                                          <p style={{ fontSize: "14px" }}>{complaintview.serial_no}</p>
                                        ) : (
                                          <input
                                            type="text"
                                            name="serial_no"
                                            value={complaintview.serial_no || ''}
                                            placeholder="Enter Serial No"
                                            style={{ fontSize: "14px", width: "100%" }}
                                            onChange={handleModelChange}
                                          />
                                        )}
                                      </div>

                                  
                                          <div className="col-md-2">
                                              <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Purchase Date</p>
                                              <p style={{ fontSize: "14px"}}>{formatDate(complaintview.invoice_date)}</p>
                                          </div>
                                    <div className="col-md-2">
                                        <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Warranty Status</p>
                                        <p style={{ fontSize: "14px"}}>{complaintview.warranty_status}</p>
                                    </div>

                <div className="col-md-12">
                  <h3 className="mainheade" style={{ fontSize: "14px"}}>
                    Complaint{" "}
                    <span style={{ fontSize: "14px"}} id="compaintno1">: {complaintview.ticket_no}</span>
                  </h3>
                </div>
              </div>

              <div className="row d-flex justify-content-center">
                <div className="col-md-12 col-lg-12">
                  <div
                    className="card shadow-0 border"
                    style={{ backgroundColor: "#f0f2f5" }}
                  >
                    <form onSubmit={handleSubmit}>
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
                            style={{ fontSize: "14px"}}
                          >
                            Upload Files (Images, Videos, Audios)
                          </label>
                          <input
                            type="file"
                            id="uploadFiles"
                            name="attachment"
                            className="form-control"
                            multiple
                            accept="image/*,video/*,audio/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.eml"
                            onChange={handleFileChange}
                            ref={fileInputRef2} // Attach the ref to the input
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
                            style={{ fontSize: "14px"}}
                            onClick={handleSubmit}
                          >
                            Upload Remark
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remark List Section */}
          <div className="mt-3" id="remarksSection">
            <div className="row">
              <div className="col-md-12">
                <h3 className="mainheade" style={{ fontSize: "14px"}}>
                  Remark Record Of{" "}
                  <span id="compaintno1" style={{ fontSize: "14px"}}>
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
          
        <div className="d-flex justify-content-between">
          {/* Remarks Section - 80% */}
            <div style={{ flex: "0 0 80%", paddingRight: '10px' }}>
              <p style={{ fontSize: "14px", margin: 0 }}>{remark.remark}</p>
             
            </div>

             {/* By and Date Section - 20% */}
              <div style={{ flex: "0 0 20%", textAlign: "right" }}>
                
                  <h3 className="mainheade important-margin" style={{ fontSize: "12px", margin: 0 }}>
                    By: {remark.Lhiuser}
                  </h3>
                
                <h3 className="mainheade" style={{ fontSize: "12px", margin: 0 }}>
                   Date: {formatDate(remark.created_date)}
                </h3>
            </div>
        </div>


            

          {attachments.filter((att) => att.remark_id == remark.id).length > 0 && (
            <div className="attachments mt-2">
              <h3 className="mainheade" style={{ fontSize: "14px" }}>Attachments</h3>
              {attachments
  .filter((att) => att.remark_id === remark.id)
  .map((attachment, index) => {
    // Split the attachment string into an array by commas
    const fileNames = attachment.attachment.split(','); // Assuming attachment.attachment is a comma-separated string

    return fileNames.map((fileName, fileIndex) => {
      // Trim whitespace from file name
      const trimmedFileName = fileName.trim();

      // Determine the file extension
      const fileExtension = trimmedFileName.split('.').pop();

      // Create a new file name like file1.mp3, file2.mp4, etc.
      const newFileName = `file${index * fileNames.length + fileIndex + 1}.${fileExtension}`;

      return (
        <div
          key={`${attachment.id}-${fileIndex}`} // Unique key for each file
          className="attachment"
          style={{
            display: "block", // Display attachments in new lines
            marginTop: "5px",
          }}
        >
          <span
            style={{
              color: "blue",
              cursor: "pointer",
            }}
            onClick={() => handleAttachmentClick(trimmedFileName)} // Handle click for each file
          >
            {newFileName} {/* Display the new file name */}
          </span>
        </div>
      );
    });
  })}

            </div>
          )}
        </div>
      </div>
    ))
  ) : (
    <p style={{ fontSize: "14px" }}>No remarks available.</p>
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
                    currentAttachment.toLowerCase().endsWith(".docx") || currentAttachment.toLowerCase().endsWith(".eml") ? (
                      
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
              <h4 className="pname" style={{ fontSize: "14px"}}>Call Status</h4>
              <div className="mb-3">
                <select name="call_status" className="form-control" style={{ fontSize: "14px"}} onChange={handleModelChange}>
                  <option value="" >Select Status</option>
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

          {/* <div className="card mb-3" id="productInfocs">
            <div className="card-body">
              <h4 className="pname" style={{ fontSize: "14px"}}>Product</h4>
              <div className="mb-3" style={{ fontSize: "14px"}}>
                <input
                  type="text"
                  className="form-control"
                  value="Liebherr 472L"
                />
              </div>
            </div>
          </div> */}

          {/* <div className="card mb-3" id="engineerInfocs">
            <div className="card-body">
              <h4 className="pname" style={{ fontSize: "14px"}}>Engineer</h4>
              <div className="mb-3" style={{ fontSize: "14px"}}>
                <input
                  type="text"
                  className="form-control"
                  value="John Smith"
                />
              </div>
            </div>
          </div> */}

            <div className="card mb-3" id="engineerInfocs">
              <div className="card-body">
                <h4 className="pname" style={{ fontSize: "14px"}}>Engineer</h4>
                <select
                    className="form-select dropdown-select"
                    name="engineer_id"
                    value={complaintview.engineer_id} // Add this to control the value
                    onChange={handleModelChange}
                  >
                    <option value="">Select Engineer</option>
                    {Array.isArray(engineer) && engineer.length > 0 ? (
                      engineer.map((engineers) => (
                        <option key={engineers.id} value={engineers.id}>
                          {engineers.title}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No engineers available</option>
                    )}
                  </select>

                <div className="d-flex justify-content-end">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ fontSize: "14px"}}
                            onClick={handleSubmitTicketFormData}
                          >
                            Submit
                          </button>
                        </div>
                        {TicketUpdateSuccess.visible && (
            <div style={successMessageStyle}>
              {TicketUpdateSuccess.message}
            </div>
                        )}
              </div>
            </div>
            

          <div className="card" id="attachmentInfocs">
            <div className="card-body">
              <h4 className="pname" style={{ fontSize: "14px"}}>Attachment 2</h4>
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.eml"
                  onChange={handleFile2Change}
                  ref={fileInputRef} // Attach the ref to the input
                />
              </div>
              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAttachment2Submit}
                  style={{ fontSize: "14px"}}
                >
                  Upload
                </button>
              </div>
              
              <div id="allattachme">
                {attachments2.length > 0 ? (
                <div className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title" style={{ fontSize: "16px", fontWeight: "bold" }}>Uploaded Attachments</h5>
                    
                    {attachments2.map((attachment, index) => {
  // Ensure attachment data is an array
  const attachmentArray = Array.isArray(attachment.attachment)
    ? attachment.attachment
    : attachment.attachment.split(','); // Assuming comma-separated string

  return (
    <div 
      key={index} 
      className="d-flex justify-content-between align-items-start mb-3" 
      style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "10px" }}
    >
      <div style={{ flex: "1" }}>
        <h6 style={{ fontSize: "12px", margin: "0 0 5px 0" }}>By: {attachment.Lhiuser}</h6>
        <h6 style={{ fontSize: "12px", margin: "0 0 5px 0" }}>Date: {formatDate(attachment.created_date)}</h6>
        
        {/* Display each attachment item with format "File1.extension [filename.extension]" */}
        {attachmentArray.map((item, idx) => {
          const fileExtension = item.split('.').pop(); // Extract file extension
          const fileName = item.trim();

          return (
            <span
              key={idx}
              style={{
                color: "#007bff",
                cursor: "pointer",
                fontWeight: "500",
                display: "block",
                marginBottom: "3px",
              }}
              onClick={() => handleAttachment2Click(fileName)}
            >
              {`File${idx + 1}.${fileExtension}`}
            </span>
          );
        })}
      </div>
    </div>
  );
})}


                  </div>
                </div>
                
                ) : (
                  <p style={{ fontSize: "14px"}}>No attachments available</p>
                )}
              </div>
            </div>
          </div>

          {/* New Modal for Attachment 2 Preview */}
          {isModal2Open && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setIsModal2Open(false)}>
                  &times;
                </span>
                {currentAttachment2.toLowerCase().endsWith(".jpg") ||
                currentAttachment2.toLowerCase().endsWith(".jpeg") ||
                currentAttachment2.toLowerCase().endsWith(".png") ? (
                  <img
                    src={`${Base_Url}/uploads/${currentAttachment2}`}
                    alt="attachment"
                    style={{ width: "100%" }}
                  />
                ) : currentAttachment2.toLowerCase().endsWith(".mp4") ||
                  currentAttachment2.toLowerCase().endsWith(".mov") ||
                  currentAttachment2.toLowerCase().endsWith(".avi") ? (
                  <video controls style={{ width: "100%" }}>
                    <source
                      src={`${Base_Url}/uploads/${currentAttachment2}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : currentAttachment2.toLowerCase().endsWith(".mp3") ||
                  currentAttachment2.toLowerCase().endsWith(".wav") ? (
                  <audio controls>
                    <source
                      src={`${Base_Url}/uploads/${currentAttachment2}`}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio tag.
                  </audio>
                ) : currentAttachment2.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={`${Base_Url}/uploads/${currentAttachment2}`}
                    style={{ width: "100%", height: "500px" }}
                    title="PDF Document"
                  >
                    Your browser does not support PDFs.{" "}
                    <a href={`${Base_Url}/uploads/${currentAttachment2}`}>
                      Download the PDF
                    </a>
                  </iframe>
                ) : currentAttachment2.toLowerCase().endsWith(".doc") ||
                  currentAttachment2.toLowerCase().endsWith(".docx") || currentAttachment2.toLowerCase().endsWith(".eml") ? (
                  <iframe
                    src={`https://docs.google.com/gview?url=${Base_Url}/uploads/${currentAttachment2}&embedded=true`}
                    style={{ width: "100%", height: "500px" }}
                    title="Word Document"
                  >
                    Your browser does not support Word documents.{" "}
                    <a href={`${Base_Url}/uploads/${currentAttachment2}`}>
                      Download the Word document
                    </a>
                  </iframe>
                ) : currentAttachment2.toLowerCase().endsWith(".xls") ||
                  currentAttachment2.toLowerCase().endsWith(".xlsx") ? (
                  <iframe
                    src={`https://docs.google.com/gview?url=${Base_Url}/uploads/${currentAttachment2}&embedded=true`}
                    style={{ width: "100%", height: "500px" }}
                    title="Excel Document"
                  >
                    Your browser does not support Excel documents.{" "}
                    <a href={`${Base_Url}/uploads/${currentAttachment2}`}>
                      Download the Excel document
                    </a>
                  </iframe>
                ) : (
                  <p style={{ fontSize: "14px"}}>Unsupported file type.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
