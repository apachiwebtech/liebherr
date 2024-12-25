import axios from "axios";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Base_Url } from "../../Utils/Base_Url";
import { FaEye } from "react-icons/fa";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { array } from "js-md5";
import { FaDownload } from "react-icons/fa6";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";

export function Complaintviewmsp(params) {
  const token = localStorage.getItem("token");
  const [activeTicket, setActiveTicket] = useState(null);
  const [addedSpareParts, setAddedSpareParts] = useState([]);
  const [quotation, setQuotation] = useState([]);
  const { complaintid } = useParams();
  const [quantity, setQuantity] = useState("");
  const [closestatus, setCloseStatus] = useState("");
  const [spareid, setspareid] = useState("");
  const [ticketTab, setTicketTab] = useState(JSON.parse(localStorage.getItem('tabticket')) || []);
  const { loaders, axiosInstance } = useAxiosLoader();

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
    purchase_date: '',
    serial_no: '',
    call_status: '',
    engineer_id: '',
    sub_call_status: '',
    defect_type: '',
    site_defect: "",
    spare_part_id: "",
    quantity: "",
    state: "",
    city: ""
  });



  const [sserial_no, setsserial_no] = useState([]);
  const [product, setProduct] = useState([]);
  const [engineer, setEngineer] = useState([]); // Initialize as empty array
  const [spare, setSpare] = useState([]); // Initialize as empty array
  const [note, setNote] = useState(""); // Input field value
  const [files, setFiles] = useState([]); // Store selected files
  const [remarks, setRemarks] = useState([]);
  const [duplicate, setDuplicate] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [engtype, setEngType] = useState("");
  const [groupstatusid, setgroupstatusid] = useState("");
  const [groupdefect, setGroupDefect] = useState([]);
  const [addedEngineers, setAddedEngineers] = useState([]);
  const [files2, setFiles2] = useState([]); // New state for Attachment 2 files
  const fileInputRef = useRef(); // Ref for Attachment 1 input
  const fileInputRef2 = useRef(); // Create a ref for the file input
  const [attachments2, setAttachments2] = useState([]); // New state for Attachment 2 list
  const [isModal2Open, setIsModal2Open] = useState(false); // New modal state
  const [currentAttachment2, setCurrentAttachment2] = useState(""); // Current attachment 2 for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [currentAttachment, setCurrentAttachment] = useState(""); // Current attachment for modal
  const [callstatus, setCallstatus] = useState([]); // Current attachment for modal
  const [subcallstatus, setsubCallstatus] = useState([]); // Current attachment for modal
  const [callstatusid, setCallstatusid] = useState(""); // Current attachment for modal
  const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
  const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage
  const [GroupDefectsite, setGroupDefectsite] = useState([]);
  const [GroupDefecttype, setGroupDefecttype] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [activity, setactivity] = useState([]);
  const [TicketUpdateSuccess, setTicketUpdateSuccess] = useState({
    message: '',
    visible: false,
    type: 'success' // can be 'success' or 'error'
  });

  async function getProduct(params) {

    axiosInstance.get(`${Base_Url}/product_master`)
      .then((res) => {
        if (res.data) {

          setProduct(res.data)
        }
      })

  }


    async function getactivity(params) {
      try {
        const res = await axiosInstance.get(`${Base_Url}/getactivity`, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });

        if (res.data) {
          setactivity(res.data);
        } else {
          console.error("Expected array from API but got:", typeof res.data);
          setactivity([]); // Set empty array as fallback
        }

      } catch (error) {
        console.error("Error fetching engineers:", error);
        setactivity([]); // Set empty array on error
      }
    }

  async function getEngineer(params) {

    try {
      const res = await axiosInstance.get(`${Base_Url}/getcvengineer/${complaintview.pincode}/${complaintview.msp}/${complaintview.csp}`, {
        headers: {
          Authorization: token, // Send token in headers
        },

      });



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


  async function getSpare(params) {


    try {
      const res = await axiosInstance.get(`${Base_Url}/getSpareParts/${params}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });


      if (res.data) {
        setSpare(res.data);
      } else {
        console.error("Expected array from API but got:", typeof res.data);
        setSpare([]); // Set empty array as fallback
      }





    } catch (error) {
      console.error("Error fetching engineers:", error);
      setEngineer([]); // Set empty array on error
    }


  }

  async function getgroupdefect(params) {


    try {

      const res = await axiosInstance.get(`${Base_Url}/getcom`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      if (res.data) {
        setGroupDefect(res.data);
      } else {
        console.error("Expected array from API but got:", typeof res.data);
        setGroupDefect([]); // Set empty array as fallback
      }





    } catch (error) {
      console.error("Error fetching engineers:", error);
      setGroupDefect([]); // Set empty array on error
    }


  }

  async function getdefecttype(params) {


    if (params) {


      try {
        const res = await axiosInstance.post(`${Base_Url}/getDefectCodewisetype`, { defect_code: params }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });



        if (res.data) {
          setGroupDefecttype(res.data);
        } else {
          console.error("Expected array from API but got:", typeof res.data);
          setGroupDefecttype([]); // Set empty array as fallback
        }





      } catch (error) {
        console.error("Error fetching engineers:", error);
        setGroupDefecttype([]); // Set empty array on error
      }

    } else {

      try {
        const res = await axiosInstance.get(`${Base_Url}/gettypeofdefect`, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });



        if (res.data) {
          setGroupDefecttype(res.data);
        } else {
          console.error("Expected array from API but got:", typeof res.data);
          setGroupDefecttype([]); // Set empty array as fallback
        }





      } catch (error) {
        console.error("Error fetching engineers:", error);
        setGroupDefecttype([]); // Set empty array on error
      }
    }



  }

  async function getsitecode(params) {


    if (params) {

      try {
        const res = await axiosInstance.post(`${Base_Url}/getDefectCodewisesite`, { defect_code: params }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });



        if (res.data) {
          setGroupDefectsite(res.data);
        } else {
          console.error("Expected array from API but got:", typeof res.data);
          setGroupDefectsite([]); // Set empty array as fallback
        }





      } catch (error) {
        console.error("Error fetching engineers:", error);
        setGroupDefectsite([]); // Set empty array on error
      }
    } else {

      try {
        const res = await axiosInstance.get(`${Base_Url}/getsitedefect`, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });



        if (res.data) {
          setGroupDefectsite(res.data);
        } else {
          console.error("Expected array from API but got:", typeof res.data);
          setGroupDefectsite([]); // Set empty array as fallback
        }





      } catch (error) {
        console.error("Error fetching engineers:", error);
        setGroupDefectsite([]); // Set empty array on error
      }
    }



  }

  async function getcallstatus(params) {


    try {
      const res = await axiosInstance.get(`${Base_Url}/getcallstatus`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });


      if (res.data) {
        setCallstatus(res.data)
      }


    } catch (error) {
      console.error("Error fetching engineers:", error);
      setEngineer([]); // Set empty array on error
    }


  }

  const getsubcallstatus = async (value) => {
    if (value !== undefined) {
      try {
        const res = await axiosInstance.post(
          `${Base_Url}/getsubcallstatus`,
          { Status_Id: value },
          {
            headers: {
              Authorization: token, // Send token in headers
            },
          }
        );

        if (res.data) {
          setsubCallstatus(res.data); // Set sub-call statuses from POST response
        }
      } catch (error) {
        console.error("Error fetching sub-call statuses via POST:", error);
        setsubCallstatus([]); // Set empty array on error
      }
    } else {
      try {
        const res = await axiosInstance.get(`${Base_Url}/getsubcallstatusdata`, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });

        if (res.data) {
          setsubCallstatus(res.data); // Set sub-call statuses from GET response
        }
      } catch (error) {
        console.error("Error fetching sub-call statuses via GET:", error);
        setsubCallstatus([]); // Set empty array on error
      }
    }
  };


  const AddEngineer = () => {
    const selectedEngineer = engineer.find(
      (eng) => eng.id === parseInt(complaintview.engineer_id)
    );
    if (
      selectedEngineer &&
      !addedEngineers.some((eng) => eng.id === selectedEngineer.id)
    ) {
      setAddedEngineers([...addedEngineers, selectedEngineer]);
      setComplaintview({ ...complaintview, engineer_id: '' }); // Reset the dropdown
    }

  };




  const handlesparechange = (value) => {
    setspareid(value)
  }

  const handleAddSparePart = () => {
    const selectedSparePart = spare.find(
      (part) => part.id === parseInt(spareid)
    );


    if (!selectedSparePart) {
      alert("Please select a spare part.");
      return;
    }

    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }





    const newPart = {
      ...selectedSparePart,
      // quantity: parseInt(quantity), // Add quantity field
    };


    setAddedSpareParts([newPart]);



    const finaldata = { data: newPart, ticket_no: complaintview.ticket_no }

    const data = {
      finaldata: finaldata,
    };

    axiosInstance.post(`${Base_Url}/add_uniqsparepart`, data)
      .then((res) => {

        getsparelist(complaintview.ticket_no)

      })


    setQuantity(""); // Reset quantity input
  };

  const GenerateQuotation = () => {


    // Collect all spare part IDs
    let combinedSpareParts = addedSpareParts.map((item) => ({
      id: item.id,
      title: item.article_code,
      ItemDescription: item.article_description,
      product_code: item.spareId,
      price: "100"
    }));



    // Combine spare parts, ticket number, and model number into a single array
    const finaldata = { data: combinedSpareParts, ticket_no: complaintview.ticket_no, ModelNumber: complaintview.ModelNumber, customer_id: complaintview.customer_id, Customername: complaintview.customer_name, state: complaintview.state, city: complaintview.city, Engineer: addedEngineers.map((item) => item.engineer_id) || complaintview.engineer_id };

    // Prepare the data object
    const data = {
      finaldata: finaldata,
    };

    // Send the POST request
    axiosInstance.post(`${Base_Url}/add_quotation`, data)
      .then((response) => {

        alert("Quotation generated")
        window.location.reload()

      })
      .catch((error) => {
        console.error("Error adding quotation:", error);
      });
  };



  const handleRemoveSparePart = (id) => {

    const confirm = window.confirm("Are you sure?")

    if (confirm) {
      axiosInstance.post(`${Base_Url}/removesparepart`, { spare_id: id })
        .then((res) => {

          // setAddedSpareParts(addedSpareParts.filter((part) => part.id !== id));
          getsparelist(complaintview.ticket_no)
        })
    }



  };

  const handleRemoveEngineer = (id) => {
    const updatedEngineers = addedEngineers.filter((eng) => eng.id !== id);
    setAddedEngineers(updatedEngineers); // Update the state (assuming you use React's useState)
  };




  const fetchComplaintDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getComplaintDetails/${complaintview.ticket_no}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );


      setRemarks(response.data.remarks);
      setAttachments(response.data.attachments);

    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };


  const fetchComplaintview = async (complaintid) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getcomplaintview/${complaintid}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );

      setComplaintview(response.data);

      setCloseStatus(response.data.call_status)

      if (response.data.call_status != null) {
        setCallstatusid(response.data.call_status)
      }
      if (response.data.engineer_id != null) {
        getupdateengineer(response.data.engineer_id)
      }




      getupdatespare(response.data.ticket_no)
      getsparelist(response.data.ticket_no)
      getSpare(response.data.ModelNumber)

      if (response.data.serial_no != "") {
        setsserial_no(response.data.serial_no);

      }
    } catch (error) {
      console.error("Error fetching ticket view:", error);
    }
  };

  async function getupdateengineer(id) {
    axiosInstance.post(`${Base_Url}/getupdateengineer`, { eng_id: id }, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {

        setAddedEngineers(res.data)
      })
  }
  async function getupdatespare(id) {

    axiosInstance.post(`${Base_Url}/getupdatesparelist`, { ticket_no: id }, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {

        setQuotation(res.data)
      })
  }
  async function getsparelist(id) {

    axiosInstance.post(`${Base_Url}/getuniquespare`, { ticket_id: id }, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {

        setAddedSpareParts(res.data)
      })
  }

  const fetchComplaintDuplicate = async () => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getComplaintDuplicate/${complaintview.customer_mobile}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );
      setDuplicate(response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };

  // New function to fetch Attachment 2 list
  const fetchAttachment2Details = async () => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getAttachment2Details/${complaintview.ticket_no}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
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

  const handleengchange = (value) => {


    setEngType(value)
  }


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

        await axiosInstance.post(`${Base_Url}/uploadAttachment2`, formData, {
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
        `Error submitting files: ${error.response ? error.response.data.error : error.message
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
      call_status: callstatusid,
      sub_call_status: complaintview.sub_call_status,
      updated_by: 1,
      ticket_no: complaintview.ticket_no,
      group_code: groupstatusid,
      site_defect: complaintview.site_defect,
      defect_type: complaintview.defect_type,
      engineerdata: addedEngineers.map((item) => item.engineer_id),
      engineername: addedEngineers.map((item) => item.title),
    };

    axiosInstance.post(`${Base_Url}/ticketFormData`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then(response => {

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

      const remarkResponse = await axiosInstance.post(
        `${Base_Url}/addcomplaintremark`,
        complaintRemarkData
      );


      const remarkId = remarkResponse.data.remark_id;

      if (files.length > 0 && remarkId > 0) {
        const formData = new FormData();
        formData.append("ticket_no", complaintview.ticket_no);
        formData.append("remark_id", remarkId);
        formData.append("created_by", created_by);

        Array.from(files).forEach((file) => {
          formData.append("attachment", file);
        });

        await axiosInstance.post(`${Base_Url}/uploadcomplaintattachments`, formData, {
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

      alert("Ticket remark and files submitted successfully!");

      fetchComplaintDetails();
    } catch (error) {
      console.error("Error submitting ticket remark or files:", error);
      alert(
        `Error submitting data: ${error.response ? error.response.data.error : error.message
        }`
      );
    }
  };


  useEffect(() => {
    if (ticketTab.length == 0) {
      navigate(`/complaintlist`);
    }

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
    getactivity();

    setActiveTicket(complaintid); // Set the active ticket ID




  }, [complaintid, complaintview.ticket_no, complaintview.customer_mobile]);

  useEffect(() => {
    if (engtype == "Franchisee") {

      getEngineer();
    } else {
      setEngineer([])
    }


  }, [engtype])

  useEffect(() => {
    getcallstatus()

    getsubcallstatus()
    getgroupdefect()
    getdefecttype()
    getsitecode()
  }, [])

  const handleAttachmentClick = (attachment) => {

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

  const formatDate1 = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hour = date.getHours();
    const min = date.getMinutes();

    return `${day}-${month}-${year} ${hour}:${min}`;
  }

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


  //Attachments Download


  const downloadZip = async (fileNames) => {
    const zip = new JSZip();

    try {
      // Loop through all file names and fetch their content
      const fileFetchPromises = fileNames.map(async (fileName) => {
        const trimmedFileName = fileName.trim(); // Trim any whitespace
        const fileUrl = `${Base_Url}/uploads/${trimmedFileName}`; // Construct the full URL

        // Fetch the file from the server
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${trimmedFileName}`);
        }

        const blob = await response.blob(); // Get file content as a blob
        zip.file(trimmedFileName, blob); // Add the file to the zip archive
      });

      // Wait for all files to be fetched and added to the zip
      await Promise.all(fileFetchPromises);

      // Generate the zip file and trigger download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'attachments.zip'); // Save as "attachments.zip"
    } catch (error) {
      console.error('Error generating zip:', error);
    }
  };


  const downloadAllZip = (allAttachments) => {
    const zip = new JSZip();
    const folder = zip.folder("attachments"); // Create a folder inside the ZIP

    // Extract all files from all attachments
    const allFiles = allAttachments.flatMap((attachment) =>
      attachment.split(",").map((file) => file.trim())
    );



    // Add all files to the ZIP
    const promises = allFiles.map((file, index) => {
      const fileName = file.split("/").pop(); // Extract file name from URL

      // Fetch file data and add to ZIP
      return fetch(file)
        .then((response) => {
          if (response.ok) return response.blob();
          throw new Error(`Failed to fetch file: ${fileName}`);
        })
        .then((blob) => {
          folder.file(`file${index + 1}_${fileName}`, blob); // Add file with new name to the ZIP
        });
    });

    // Once all files are added, generate and trigger the ZIP download
    Promise.all(promises)
      .then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, "all_attachments.zip"); // Save the ZIP file
        });
      })
      .catch((error) => console.error("Error while creating ZIP:", error));
  };

  const downloadFile = (fileName) => {
    const fileUrl = `${Base_Url}/uploads/${fileName}`; // Construct the file URL
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('File download failed');
        }
        return response.blob(); // Convert response to a blob
      })
      .then((blob) => {
        // Create a temporary download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName; // Set the file name
        document.body.appendChild(a);
        a.click(); // Trigger the download
        window.URL.revokeObjectURL(url); // Clean up the URL object
        a.remove(); // Remove the temporary link from DOM
      })
      .catch((error) => {
        console.error('Error downloading the file:', error);
      });
  };





  let allAttachments = [];
  attachments.forEach(item => {
    const fileNames = item.attachment.split(',');
    const filewithurl = `${Base_Url}/uploads/${fileNames}`
    allAttachments = allAttachments.concat(filewithurl);
  });


  // This is for Ticket Tab


  const handleDeleteTab = (ticket_id) => {
    const updatedTickets = JSON.parse(localStorage.getItem('tabticket')) || [];
    const newTicketList = updatedTickets.filter(
      (ticket) => ticket.ticket_id !== ticket_id
    );
    localStorage.setItem('tabticket', JSON.stringify(newTicketList));
    if (ticket_id == activeTicket) {
      if (newTicketList.length > 0) {
        setActiveTicket(newTicketList[0].ticket_id);
        navigate(`/complaintview/${newTicketList[0].ticket_id}`);
      } else {
        setActiveTicket(null);
        navigate(`/complaintlist`);
      }
    }
    setTicketTab(newTicketList);
  };





  return (
    <div className="p-3">
          {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
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
                <span style={{ fontSize: "14px" }}>Ticket : {complaintview.ticket_no}</span>
              </label>
            </div>
            <div className="col-md-9 text-right pt-2">
              {ticketTab.map((item) => (
                <Chip
                  key={item.ticket_id}
                  label={item.ticket_no}
                  variant={activeTicket == item.ticket_id ? "filled" : "outlined"}
                  color={activeTicket == item.ticket_id ? "primary" : "default"}
                  onClick={() => navigate(`/complaintview/${item.ticket_id}`)}
                  onDelete={() => handleDeleteTab(item.ticket_id)}
                  className="mx-2"
                />
              ))}


            </div>
          </div>
        </div>
      </div>

      <div className="row mp0 mt-25">
        <div className="col-3">
          <div id="customerInfo" className="card">
            <div className="card-body">
              <p style={{ fontSize: "14px" }}>
                <b>Customer Id</b> : {complaintview.customer_id}
              </p>
              <div className="row">
                <div className="col-md-12">
                  <h4 className="pname" style={{ fontSize: "14px" }}>{complaintview.customer_name}</h4>
                </div>
              </div>

              <p style={{ fontSize: "14px" }}>
                {complaintview.address}, Pincode: {complaintview.pincode}
              </p>
              <p style={{ fontSize: "14px" }}>M : {complaintview.customer_mobile}</p>

              <p style={{ fontSize: "14px" }}>Ticket Type: {complaintview.ticket_type}</p>
              {/* <p style={{ fontSize: "14px" }}>Call Type: {complaintview.call_type}</p>
              <p style={{ fontSize: "14px" }}>Warranty Status: {complaintview.warranty_status}</p> */}
              <p style={{ fontSize: "14px" }}>Customer Classification: {complaintview.customer_class}</p>
              {complaintview.call_priority && (
                <p style={{ fontSize: "14px" }}>Call Priority: {complaintview.call_priority}</p>
              )}

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
                    style={{ fontSize: "14px" }}
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
                      {duplicate
                        .map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div style={{ fontSize: "14px" }}>{item.ticket_no}</div>
                              <span style={{ fontSize: "14px" }}>{formatDate(item.ticket_date)}</span>
                            </td>
                            <td style={{ fontSize: "14px" }}>{item.ModelNumber}</td>
                            <td>
                              <div style={{ fontSize: "14px" }}>{item.call_status}</div>
                              <span style={{ fontSize: "14px" }}>
                                <button
                                  className="btn"
                                  onClick={() => navigate(`/complaintview/${item.id}`)}
                                  title="View"
                                  style={{ backgroundColor: "transparent", border: "none", color: "blue", fontSize: "20px" }}
                                >
                                  <FaEye />
                                </button>

                              </span>
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
          <br></br>
          {/* <div>
            <h5>Added Spare Parts</h5>
            <ul>
              {selectedSpareParts.map((part) => (
                <li key={part.id}>{part.name}</li>
              ))}
            </ul>
          </div> */}

          {/* // */}
          <div className="card" id="attachmentInfocs">
            <div className="card-body">
              <h4 className="pname" style={{ fontSize: "14px" }}>Attachment</h4>
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.eml"
                  onChange={handleFile2Change}
                  disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                  ref={fileInputRef} // Attach the ref to the input
                />
              </div>
              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAttachment2Submit}
                  disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                  style={{ fontSize: "14px" }}
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
                                  <div className="d-flex align-items-center">
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

                                    <a
                                      onClick={() => downloadFile(fileName)}
                                      style={{
                                        marginLeft: "10px",
                                        textDecoration: "none",
                                      }}
                                    >
                                      <FaDownload className="text-dark" />


                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}


                    </div>
                  </div>

                ) : (
                  <p style={{ fontSize: "14px" }}>No attachments available</p>
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
                  <p style={{ fontSize: "14px" }}>Unsupported file type.</p>
                )}
              </div>
            </div>
          )}

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


                <div className="col-md-4">
                  <h4 className="pname" style={{ fontSize: "11px" }}>Model</h4>

                  {complaintview.ModelNumber ? <p>{complaintview.ModelNumber}</p> : <select
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
                  </select>}



                </div>





                <div className="col-md-2">
                  <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Purchase Date</p>
                  <p style={{ fontSize: "14px" }}>{formatDate(complaintview.purchase_date)}</p>
                </div>
                <div className="col-md-4">
                  <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Warranty Status</p>
                  <p style={{ fontSize: "14px" }}>{complaintview.warranty_status}</p>
                </div>

                {/* <div className="col-md-12">
                  <h3 className="mainheade" style={{ fontSize: "14px" }}>
                    Ticket{" "}
                    <span style={{ fontSize: "14px" }} id="compaintno1">: {complaintview.ticket_no}</span>
                  </h3>
                </div> */}
              </div>

              <div className="row d-flex justify-content-center">
                <div className="col-md-12 col-lg-12">

                  <div
                    className="card shadow-0 border"
                    style={{ backgroundColor: "#f0f2f5" }}
                  >
                    {allAttachments.length != 0 ? (
                      <>
                        <span
                          onClick={() => downloadAllZip(allAttachments)} // Pass file list to ZIP function
                          className=" float-right download-btn "
                        >
                          Download All as ZIP <FaDownload style={{ color: "black" }} />
                        </span>
                      </>
                    ) : null}

                    <form onSubmit={handleSubmit}>
                      <div className="card-body p-4">
                        <div className="form-outline mb-2">
                          <input
                            type="text"
                            id="addANote"
                            name="note"
                            className="form-control"
                            placeholder="Type comment..."
                            disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>

                        {/* File upload field for images, videos, and audio */}
                        <div className="form-outline mb-4">
                          <label
                            htmlFor="uploadFiles"
                            className="form-label mp-0"
                            style={{ fontSize: "14px" }}
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
                            disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
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
                            style={{ fontSize: "14px" }}
                            onClick={handleSubmit}
                            disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
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
                <div className="">
                  <h3 className="mainheade" style={{ fontSize: "14px" }}>
                    Remarks :

                  </h3>

                </div>

              </div>
            </div>

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
                            By: {remark.title}
                          </h3>

                          <h3 className="mainheade" style={{ fontSize: "12px", margin: 0 }}>
                            Date: {formatDate1(remark.created_date)}
                          </h3>
                        </div>
                      </div>




                      {attachments.filter((att) => att.remark_id == remark.id).length > 0 && (
                        <div className="attachments mt-2">
                          <h3 className="mainheade" style={{ fontSize: "14px" }}>Attachments</h3>

                          {attachments
                            .filter((att) => att.remark_id === remark.id)
                            .map((attachment, index) => {
                              const fileNames = attachment.attachment.split(','); // Split the attachment string into an array

                              return (
                                <div key={attachment.id} className="attachment-group d-flex">
                                  {/* Display the Download Zip button only once for the attachment group */}
                                  <button
                                    onClick={() => downloadZip(fileNames)}
                                    style={{
                                      marginLeft: "10px",
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      border: "none",
                                      padding: "5px 10px",
                                      cursor: "pointer",
                                      margin: "0px 5px",

                                    }}
                                    className="btn-sm"
                                  >
                                    Download Zip
                                  </button>

                                  {fileNames.map((fileName, fileIndex) => {
                                    const trimmedFileName = fileName.trim();
                                    const fileExtension = trimmedFileName.split('.').pop();
                                    const newFileName = `File${index * fileNames.length + fileIndex + 1}.${fileExtension}`;

                                    return (
                                      <div
                                        key={`${attachment.attachment}-${fileIndex}`} // Unique key for each file
                                        className="attachment"
                                        style={{
                                          display: "block", // Display attachments in new lines
                                          marginTop: "5px",
                                          marginRight: "8px"
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "blue",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => {
                                            setCurrentAttachment(trimmedFileName); // Set current attachment for modal view
                                            setIsModalOpen(true); // Open the modal
                                          }}
                                        >
                                          {newFileName} {/* Display the new file name */}
                                        </span>
                                        <a
                                          onClick={() => downloadFile(trimmedFileName)}
                                          style={{
                                            marginLeft: "10px",
                                            textDecoration: "none",
                                          }}
                                        >
                                          <FaDownload className="text-dark" />
                                        </a>
                                        <span>,</span>
                                      </div>
                                    );
                                  })}


                                </div>
                              );
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
              <h4 className="pname" style={{ fontSize: "14px" }}>Call Status</h4>
              <div className="mb-3">
                <select
                  name="call_status"
                  className="form-control"
                  disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                  style={{ fontSize: "14px" }}
                  value={complaintview.call_status}
                  onChange={(e) => {
                    const selectedname = e.target.value; // Get the id
                    const selectedid = callstatus.find(item => item.Callstatus == selectedname)?.id; // Find the corresponding Callstatus value
                    getsubcallstatus(selectedid); // Send the id to fetch sub-call statuses
                    // Log or use the Callstatus value
                    setCallstatusid(selectedname)
                    handleModelChange(e)
                  }}
                >
                  <option value="">Select Status</option>
                  {callstatus.map((item) => (
                    <option key={item.id} value={item.Callstatus}>
                      {item.Callstatus}
                    </option>
                  ))}
                </select>

              </div>
              <h4 className="pname" style={{ fontSize: "14px" }}>Sub Call Status</h4>
              <div className="mb-3">
                <select name="sub_call_status" value={complaintview.sub_call_status} disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false} className="form-control" style={{ fontSize: "14px" }} onChange={handleModelChange}>
                  <option value="" >Select Status</option>
                  {subcallstatus.map((item) => {
                    return (

                      <option value={item.SubCallstatus}>{item.SubCallstatus}</option>
                    )
                  })}


                </select>
              </div>

              <div className="d-flex mb-3">

                <div className="form-check me-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                    id="lhi"
                    name="engineer_type"
                    value="LHI"
                    onChange={(e) => handleengchange(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="lhi" style={{ fontSize: "14px" }}>
                    LHI
                  </label>
                </div>

                <div className="form-check">
                  <input
                    type="radio"
                    disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                    className="form-check-input"
                    id="franchisee"
                    name="engineer_type"
                    value="Franchisee"
                    onChange={(e) => handleengchange(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="franchisee" style={{ fontSize: "14px" }}>
                    Service Partner
                  </label>
                </div>

              </div>

              <h4 className="pname" style={{ fontSize: "14px" }}>Engineer</h4>

              <div className="row">
                <div className="col-lg-9">
                  {/* <select
                    className="form-select dropdown-select"
                    name="engineer_id"
                    value={complaintview.engineer_id}
                    disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
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
                      <option value="" disabled>
                        No engineers available
                      </option>
                    )}
                  </select> */}

<Autocomplete
  options={engineer}
  size="small"
  getOptionLabel={(option) => option.title || ""} // Display engineer title in dropdown
  value={engineer.find((e) => e.id === complaintview.engineer_id) || null}
  onChange={(event, newValue) =>
    handleModelChange({
      target: {
        name: "engineer_id",
        value: newValue?.id || "", // Update with engineer_id, not title
      },
    })
  }
  inputValue={inputValue}
  onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
  renderInput={(params) => <TextField {...params} label="Select Engineer" />}

  // Render option with custom styling (or whatever you want to show in the dropdown)
  renderOption={(props, option) => (
    <li {...props} key={option.engineer_id}> {/* Assign unique key using engineer_id */}
      <span>{option.title}</span> {/* Display title (name) */}
    </li>
  )}

  isOptionEqualToValue={(option, value) => option.engineer_id === value.engineer_id} // Use engineer_id to compare values
  getOptionSelected={(option, value) => option.engineer_id === value.engineer_id} // Ensure option is selected using engineer_id
/>



                </div>

                <div className="col-lg-3">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                    onClick={AddEngineer}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Display added engineers */}
              <div className="mt-3">
                <h4 className="pname" style={{ fontSize: "14px" }}>Added Engineers:</h4>
                <table className="table table-bordered" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>User Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addedEngineers.map((eng) => (
                      <tr key={eng.id}>
                        <td>{eng.title}</td>
                        <td>{eng.userType || "N/A"}</td> {/* Display user type or "N/A" */}
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ padding: "0.2rem 0.5rem" }}
                            disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                            onClick={() => handleRemoveEngineer(eng.id)}
                          >
                            ✖
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(complaintview.call_status == 'Closed' || complaintview.group_code != null) && <>
                <div className="mt-3">
                  <h4 className="pname" style={{ fontSize: "14px" }}>Defect Group Code:</h4>
                  <select
                    name="group_code"
                    className="form-control"
                    disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                    style={{ fontSize: "14px" }}
                    value={complaintview.group_code}
                    onChange={(e) => {
                      const selectedcode = e.target.value; // Get the id
                      // const selectedid = groupdefect.find(item => item.Callstatus == selectedname)?.id; // Find the corresponding Callstatus value
                      getdefecttype(selectedcode); // Send the id to fetch sub-call statuses
                      getsitecode(selectedcode); // Send the id to fetch sub-call statuses
                      setgroupstatusid(selectedcode)
                      handleModelChange(e)
                    }}
                  >
                    <option value="">Select Status</option>
                    {groupdefect.map((item) => (
                      <option key={item.id} value={item.defectgroupcode}>
                        {item.defectgrouptitle}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3">
                  <h4 className="pname" style={{ fontSize: "14px" }}>Type of Defect Code:</h4>
                  <select
                    name="defect_type"
                    className="form-control"
                    disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                    style={{ fontSize: "14px" }}
                    value={complaintview.defect_type}
                    onChange={handleModelChange}
                  >
                    <option value="">Select </option>
                    {GroupDefecttype.map((item) => (
                      <option key={item.id} value={item.defect_code}>
                        {item.defect_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3">
                  <h4 className="pname" style={{ fontSize: "14px" }}>Site Defect Code:</h4>
                  <select
                    name="site_defect"
                    className="form-control"
                    disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                    style={{ fontSize: "14px" }}
                    value={complaintview.site_defect}
                    onChange={handleModelChange}
                  >
                    <option value="">Select </option>
                    {GroupDefectsite.map((item) => (
                      <option key={item.id} value={item.dsite_code}>
                        {item.dsite_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3">
                    <h4 className="pname" style={{ fontSize: "14px" }}>Activity Code</h4>
                    <select
                      name="site_defect"
                      disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
                      className="form-control"
                      style={{ fontSize: "14px" }}
                    >
                      <option value="">Select </option>
                      {activity.map((item) => (
                        <option key={item.id} value={item.title}>
                          {item.code} - {item.title}
                        </option>
                      ))}
                    </select>
                  </div>
              </>}





              <div className="d-flex justify-content-end py-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: "14px", marginTop: '5px' }}
                  onClick={handleSubmitTicketFormData}
                  disabled={closestatus == 'Closed' || closestatus == 'Cancelled' ? true : false}
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

          {(complaintview.call_status == 'Spares' || addedSpareParts.length > 0) && <div className="card mb-3">
            <div className="card-body">

              <div className="mt-3">
                <h4 className="pname" style={{ fontSize: "14px" }}>Spare Parts:</h4>

                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <select
                      className="form-select dropdown-select m-0"
                      name="spare_part_id"
                      value={spareid}
                      disabled={closestatus === "Closed" || closestatus == 'Cancelled'}
                      onChange={(e) => handlesparechange(e.target.value)}
                    >
                      <option value="">Select Spare Part</option>
                      {Array.isArray(spare) && spare.length > 0 ? (
                        spare.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.article_code + '-' + part.article_description}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No spare parts available
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="col-lg-3">
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      placeholder="Qty"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={closestatus === "Closed" || closestatus == 'Cancelled'}
                      min="1"
                    />
                  </div>

                  <div className="col-lg-3">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={closestatus === "Closed" || !quantity || closestatus == 'Cancelled'}
                      onClick={handleAddSparePart}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Display added spare parts */}
                <div className="mt-3">
                  <h4 className="pname" style={{ fontSize: "14px" }}>Added Spare Parts:</h4>
                  <table className="table table-bordered" style={{ fontSize: "12px" }}>
                    <thead>
                      <tr>
                        <th>Spare Part</th>
                        <th>Quantity</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedSpareParts.map((part) => {



                        return (
                          <tr key={part.id}>
                            <td>{part.article_code} - {part.article_description}</td>
                            <td>1</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                style={{ padding: "0.2rem 0.5rem" }}
                                disabled={closestatus === "Closed" || closestatus == 'Cancelled'}
                                onClick={() => handleRemoveSparePart(part.id)}
                              >
                                ✖
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end py-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: "14px" }}
                    onClick={GenerateQuotation}
                    disabled={closestatus === "Closed" || closestatus == 'Cancelled'}
                  >
                    Generate Quotation
                  </button>
                </div>
              </div>
            </div>
          </div>}


          {quotation.length > 0 && <div className="card mb-3">
            <div className="card-body">
              <div className="mt-3">
                {/* Display added spare parts */}
                <div className="mt-3">
                  <h4 className="pname" style={{ fontSize: "14px" }}>Quotation List:</h4>
                  <table className="table table-bordered" style={{ fontSize: "12px" }}>
                    <thead>
                      <tr>
                        <th>Q.No</th>
                        <th>Engineer</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.map((part) => (
                        <tr key={part.id}>
                          <td>{part.quotationNumber}</td>
                          <td>{part.assignedEngineer}</td>
                          <td>
                            {part.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


              </div>
            </div>
          </div>}



          {TicketUpdateSuccess.visible && (
            <div style={successMessageStyle}>
              {TicketUpdateSuccess.message}
            </div>
          )}



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


        </div>
      </div>
    </div>
  );
}
