import axios from "axios";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { FaEye } from "react-icons/fa";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { array } from "js-md5";
import { FaDownload } from "react-icons/fa6";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import { error } from "jquery";
import { useDispatch, useSelector } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import DatePicker from "react-datepicker";
import Jobcardpdf from "../Reports/Jobcardpdf";
import { pdf } from '@react-pdf/renderer';
import MyDocument8 from "../Reports/MyDocument8";

export function CspTicketView(params) {

  const token = localStorage.getItem("token");
  const [activeTicket, setActiveTicket] = useState(null);
  const [addedSpareParts, setAddedSpareParts] = useState([]);
  const [uniquesparepart, setuniquesparepart] = useState([]);
  const [quotation, setQuotation] = useState([]);
  const [activity, setactivity] = useState([]);
  const [engremark, setEngRemark] = useState([]);
  const [model, setModel] = useState('');
  let { complaintid } = useParams();
  const [data, setData] = useState([])
  const [warranty_status_data, setWarranty_status_data] = useState('OUT OF WARRANTY')
  const uniqueParts = new Set();
  const [purchase_date, setpurchase_date] = useState('')
  try {
    complaintid = complaintid.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = CryptoJS.AES.decrypt(complaintid, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    complaintid = parseInt(decrypted, 10)
  } catch (error) {
    console.log("Error".error)
  }
  const [quantity, setQuantity] = useState("");
  const [closestatus, setCloseStatus] = useState("");
  const [subclosestatus, setsubCloseStatus] = useState("");
  const [spareid, setspareid] = useState("");
  const [allocation, setallocation] = useState('');
  const [updatedata, setUpdatedata] = useState([])
  const [ticketTab, setTicketTab] = useState(JSON.parse(localStorage.getItem('tabticket')) || []);
  const { loaders, axiosInstance } = useAxiosLoader();
  const [errors, setErrors] = useState({})
  const [dealercustid, setDealercust] = useState('')
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
    city: "",
    activity_code: "",
    class_city: "",
    gas_chargs: "",
    gas_transportation: '',
    mandays: '',
    mandaysprice: '',
    transportation: "",
    transportation_charge: "",
    visit_count: "",
    csp: "",
    customer_class: "",
    customer_id: '',
    gascheck: 'No',
    transportcheck: 'No',
    closed_date : '',
    area: '',
    region: '',
    item_code : ''
  });




  const [quotationcheck, setquotationcheck] = useState(false)
  const [sserial_no, setsserial_no] = useState([]);
  const [product, setProduct] = useState([]);
  const [engineer, setEngineer] = useState([]); // Initialize as empty array
  const [spare, setSpare] = useState([]); // Initialize as empty array
  const [note, setNote] = useState(""); // Input field value
  const [files, setFiles] = useState([]); // Store selected files
  const [remarks, setRemarks] = useState([]);
  const [duplicate, setDuplicate] = useState([]);
  const [mandays, setMandays] = useState(false);
  const [transport, settransport] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [engtype, setEngType] = useState("");
  const [groupstatusid, setgroupstatusid] = useState("");
  const [groupdefect, setGroupDefect] = useState([]);
  const [addedEngineers, setAddedEngineers] = useState([]);
  const [updatedeng, setEngList] = useState([]);
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
  const [callid, setCallid] = useState(""); // Current attachment for modal
  const created_by = localStorage.getItem("licare_code"); // Get user ID from localStorage
  const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage
  const [GroupDefectsite, setGroupDefectsite] = useState([]);
  const [GroupDefecttype, setGroupDefecttype] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [spare12, setSpare12] = useState([]) // for quatation pdf
  const [cspdata, setCsp] = useState({}) // for quatation pdf
  const [show, setShow] = useState(false)
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)
  const [TicketUpdateSuccess, setTicketUpdateSuccess] = useState({
    message: '',
    visible: false,
    type: 'success' // can be 'success' or 'error'
  });


  const handlefeilddatechange = (date) => {
    setComplaintview((prev) => ({
      ...prev,
      closed_date: date, // Ensure date is stored as a Date object
    }));
  };

  const handleChange = (e) => {
    setComplaintview((prev) => ({ ...prev, [e.target.name]: e.target.value }))



    if (e.target.name == 'mandays') {
      setMandays(e.target.checked)
    }

    if (e.target.name == 'transportation') {
      settransport(e.target.checked)
    }



    const { name, checked } = e.target;
    setComplaintview((prev) => ({
      ...prev,
      [name]: checked ? 'Yes' : 'No',
    }));

  }







  // const handlevisitchange = (e) => {
  //   const { value } = e.target;

  //   setComplaintview((prevState) => ({
  //     ...prevState,
  //     visit_count: value, // Update the visit_count field
  //   }));


  //   axiosInstance.post(`${Base_Url}/updatevisitcount`, { count: value, ticket_no: complaintview.ticket_no }, {
  //     headers: {
  //       Authorization: token
  //     }
  //   })
  //     .then((res) => {
  //       alert("Visit Count Changed")
  //     })
  // };


  async function getProduct(params) {

    axiosInstance.get(`${Base_Url}/product_master`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data) {

          setProduct(res.data)
        }
      })

  }



  const getDateAfterOneYear = (value) => {
    try {
      // Ensure value is in a recognized format
      const purchase_date = new Date(value);

      if (isNaN(purchase_date)) {
        throw new Error("Invalid date format");
      }

      // Add one year to the date
      purchase_date.setFullYear(purchase_date.getFullYear() + 1);

      // Format the date as YYYY-MM-DD
      const lastDate = purchase_date.toISOString().split('T')[0];

      // Get current date and subtract one day
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate());
      const currentDateMinusOneDay = currentDate.toISOString().split('T')[0];

      // Compare lastDate and currentDateMinusOneDay
      if (lastDate < currentDateMinusOneDay) {
        setWarranty_status_data("OUT OF WARRANTY");
        setComplaintview((prev) => ({
          ...prev,
          purchase_date: value
        }))

        axiosInstance.post(`${Base_Url}/updatewarrentystate`, { warrenty: 'OUT OF WARRANTY', ticket_no: String(complaintid) }, {
          headers: {
            Authorization: token
          }
        })
          .then((res) => {
            if (res.data && res.data[0].warranty_status) {
              setWarranty_status_data(res.data[0].warranty_status)
              setComplaintview((prev) => ({
                ...prev,
                warranty_status: res.data[0].warranty_status
              }))
            }
          })
      } else {
        setComplaintview((prev) => ({
          ...prev,
          purchase_date: value
        }))
        setWarranty_status_data("WARRANTY");

        axiosInstance.post(`${Base_Url}/updatewarrentystate`, { warrenty: 'WARRANTY', ticket_no: String(complaintid) }, {
          headers: {
            Authorization: token
          }
        })
          .then((res) => {
            if (res.data && res.data[0].warranty_status) {
              setWarranty_status_data(res.data[0].warranty_status)
              setComplaintview((prev) => ({
                ...prev,
                warranty_status: res.data[0].warranty_status
              }))
            }
          })
      }

    } catch (error) {
      console.error("Error processing date:", error.message);
      return null; // Return null for invalid dates
    }
  };

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
  async function getLHIEngineer(params) {

    try {
      const res = await axiosInstance.get(`${Base_Url}/getlhiengineer`, {
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
        // Decrypt the response data
        const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

        setGroupDefect(decryptedData);
      } else {
        console.error("Expected array from API but got:", typeof res.data);
        setGroupDefect([]); // Set empty array as fallback
      }

    } catch (error) {
      console.error("Error fetching engineers:", error);
      setGroupDefect([]); // Set empty array on error
    }
  }

  async function getactivity(params) {
    try {
      const res = await axiosInstance.get(`${Base_Url}/getactivity`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      if (res.data) {
        const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
        setactivity(decryptedData);
      } else {
        console.error("Expected array from API but got:", typeof res.data);
        setactivity([]); // Set empty array as fallback
      }

    } catch (error) {
      console.error("Error fetching engineers:", error);
      setactivity([]); // Set empty array on error
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
          const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
          const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
          const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
          setGroupDefecttype(decryptedData);
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
        const res = await axiosInstance.get(`${Base_Url}/getsite`, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });



        if (res.data) {
          const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
          const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
          const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
          setGroupDefectsite(decryptedData);
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
    setsubCallstatus([])


    if (value != '') {
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

    const payload = {
      ...selectedEngineer,
      id: String(selectedEngineer.id),  // Convert id to string if needed
      created_by: String(created_by),
      complaintid: String(complaintview.ticket_no)
    }


    axios.post(`${Base_Url}/adduniqueengineer`, payload, {
      headers: {
        Authorization: token
      }
    })
      .then((res) => {
        console.log("test")

        getupdateengineer(complaintview.ticket_no)
      })

    if (
      selectedEngineer &&
      !addedEngineers.some((eng) => eng.id === selectedEngineer.id)
    ) {
      setAddedEngineers([...addedEngineers, selectedEngineer]);
      setComplaintview({ ...complaintview, engineer_id: '' }); // Reset the dropdown
    }

  };



  const addInTab = (ticket_no, ticket_id) => {
    console.log(ticket_no, ticket_id, "ticket_no, ticket_id");

    // Retrieve the existing array of ticket numbers, or initialize as an empty array
    const prevTickets = JSON.parse(localStorage.getItem('tabticket')) || [];

    // Check if the ticket already exists in the array
    const isTicketExists = prevTickets.some(
      (ticket) => ticket.ticket_id === ticket_id
    );

    // Add the current ticket number to the array only if it doesn't already exist
    if (!isTicketExists) {
      prevTickets.push({
        ticket_id: ticket_id,
        ticket_no: ticket_no,
      });

      // Store the updated array back in localStorage
      localStorage.setItem('tabticket', JSON.stringify(prevTickets));
    }

    // navigate(`/complaintview/${ticket_id}`)
    sendtoedit(ticket_id)
  };


  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };


    if (!complaintview.defect_type && complaintview.defect_type != "null" && complaintview.defect_type != null && complaintview.call_status == 'Closed') {
      isValid = false;
      newErrors.defect_type = "Name is required";
    }



    setErrors(newErrors);
    setTimeout(() => {
      setErrors("")
    }, 5000);
    return isValid;
  }





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
      quantity: parseInt(quantity), // Add quantity field
    };


    setAddedSpareParts([newPart]);



    let finaldata = { data: newPart, ticket_no: complaintview.ticket_no }

    finaldata = JSON.stringify(finaldata)



    const data = {
      finaldata: finaldata,
    };

    axiosInstance.post(`${Base_Url}/add_uniqsparepart`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
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
    const finaldata = { data: combinedSpareParts, ticket_no: complaintview.ticket_no, ModelNumber: complaintview.ModelNumber, customer_id: complaintview.customer_id, Customername: complaintview.customer_name, state: complaintview.state, city: complaintview.city, csp_code: complaintview.csp, Engineer: addedEngineers.map((item) => item.engineer_id) || complaintview.engineer_id };

    // Prepare the data object
    const data = {
      finaldata: finaldata,
    };

    // Send the POST request
    axiosInstance.post(`${Base_Url}/add_quotation`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((response) => {

        alert("Quotation generated")
        setTimeout(() => {

          window.location.reload()
        }, 1000);

      })
      .catch((error) => {
        console.error("Error adding quotation:", error);
      });
  };



  const handleRemoveSparePart = (id) => {

    const confirm = window.confirm("Are you sure?")

    if (confirm) {
      axiosInstance.post(`${Base_Url}/removesparepart`, { spare_id: id }, {
        headers: {
          Authorization: token, // Send token in headers
        },
      })
        .then((res) => {

          // setAddedSpareParts(addedSpareParts.filter((part) => part.id !== id));
          getsparelist(complaintview.ticket_no)
        })
    }



  };

  const handleRemoveEngineer = (id) => {
    const updatedEngineers = addedEngineers.filter((eng) => eng.id !== id);
    setAddedEngineers(updatedEngineers); // Update the state (assuming you use React's useState)


    axiosInstance.post(`${Base_Url}/getremoveengineer`, { id: id }, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        console.log(res)
        getupdateengineer(complaintview.ticket_no)
      })
      .then((err) => {
        console.log(err)
      })

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

      setpurchase_date(response.data.purchase_date)
      setUpdatedata(response.data)
      setComplaintview(response.data);
      setgroupstatusid(response.data.group_code)
      // getsubcallstatus(response.data.call_status_id)
      getEngineerRemark(response.data.ticket_no)
      setCloseStatus(response.data.call_status)
      setsubCloseStatus(response.data.sub_call_status)
      setActiveTicket(complaintid);
      if (response.data.call_status != null) {
        setCallstatusid(response.data.call_status)
      }
      if (response.data.engineer_id != null) {
        getupdateengineer(response.data.ticket_no)
      }


      setComplaintview((prev) => ({
        ...prev,
        call_status: "",
        sub_call_status: "",
      }))





      getupdatespare(response.data.ticket_no)
      getsparelist(response.data.ticket_no)
      getSpare(response.data.item_code)

      if (response.data.serial_no != "") {
        setsserial_no(response.data.serial_no);

      }
    } catch (error) {
      console.error("Error fetching ticket view:", error);
    }
  };

  // async function getupdateengineer(id) {
  //   axiosInstance.post(`${Base_Url}/getupdateengineer`, { eng_id: id }, {
  //     headers: {
  //       Authorization: token,
  //     },
  //   })
  //     .then((res) => {

  //       setAddedEngineers(res.data)
  //     })
  // }


  async function getupdateengineer(ticket_no) {
    axiosInstance.post(`${Base_Url}/getuniqueengineer`, { ticket_no: ticket_no }, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {

        setAddedEngineers(res.data)
        setEngList(res.data)
      })
      .then((err) => {
        console.log(err)
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

        setuniquesparepart(res.data)
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
            Authorization: token, // Send token in headers

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


    if (name === 'serial_no') {
      if (value.length === 9) { // Check if the value has exactly 9 digits
        handlegetmodel(value);
      }
    }

    if (name == 'call_status' && value == 'Approve') {
      setShow(true)
    }


  };


  const handlegetmodel = async (value) => {
    try {
      const serial = value?.serial_no || value;

      const response = await axios.get(`${Base_Url}/getcheckserial/${serial}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      if (!response.data || response.data.length === 0) {
        alert("This serial does not exist.");
        setComplaintview((prevstate) => ({
          ...prevstate,
          ModelNumber: '',
          serial_no: '',
          item_code : ''
        }));
        return;
      }




      const serialData = response.data[0];


      if (serialData?.ModelNumber) {
        if (!serialData.customer_id) {
          alert("New serial no");
          setallocation(serialData.allocation);
          setComplaintview((prevstate) => ({
            ...prevstate,
            ModelNumber: serialData.ModelNumber,
            item_code: serialData.ItemNumber
          }));

        }
        else if (serialData.salutation == 'Dl' ) {
          alert("Serial no transfer to customer")
          setallocation('Available');
          setDealercust(serialData.customer_id)

          const purchaseDate = new Date(serialData.purchase_date);
          if (!isNaN(purchaseDate)) {
            getDateAfterOneYear(purchaseDate);
          } else {
            console.error("Invalid purchase_date format", serialData.purchase_date);
          }
          setComplaintview((prevstate) => ({
            ...prevstate,
            ModelNumber: serialData.ModelNumber,
            purchase_date: serialData.purchase_date,
            item_code: serialData.ItemNumber
          }));
        }
        else if (serialData.customer_id == complaintview.customer_id) {
          alert("Serial no matched");

          const purchaseDate = new Date(serialData.purchase_date);
          if (!isNaN(purchaseDate)) {
            getDateAfterOneYear(purchaseDate);
          } else {
            console.error("Invalid purchase_date format", serialData.purchase_date);
          }
          setComplaintview((prevstate) => ({
            ...prevstate,
            ModelNumber: serialData.ModelNumber,
            purchase_date: serialData.purchase_date,
            item_code: serialData.ItemNumber
          }));
        } else {
          alert("This serial no already allocated");
          setComplaintview((prevstate) => ({
            ...prevstate,
            ModelNumber: '',
            serial_no: '',
            item_code : ''
          }));
        }
      }

      if (!serialData?.customer_classification || serialData.customer_classification == complaintview.customer_class) {
        console.log("Matched");
      } else {
        alert("Classification is different");
        setComplaintview((prevstate) => ({
          ...prevstate,
          ModelNumber: '',
          serial_no: '',
          item_code : ''
        }));
      }
    } catch (error) {
      console.error("Error fetching serial details:", error);
    }
  };



  //handlesubmitticketdata strat for serial no,model number, engineer_id and call_status and form data
  // const handleSubmitTicketFormData = (e) => {
  //   e.preventDefault();


  //   if (addedEngineers.length > 0) {

  //     const data = {
  //       serial_no: String(complaintview.serial_no) || '',
  //       ModelNumber: complaintview.ModelNumber || '',
  //       engineer_id: complaintview.engineer_id || '',
  //       call_status: callstatusid || '',
  //       sub_call_status: complaintview.sub_call_status || '',
  //       updated_by: created_by || '',
  //       ticket_no: complaintview.ticket_no || '',
  //       group_code: groupstatusid || '',
  //       site_defect: complaintview.site_defect || '',
  //       defect_type: complaintview.defect_type || '',
  //       engineerdata: addedEngineers.map((item) => item.engineer_id),
  //       engineername: addedEngineers.map((item) => item.title),
  //       activity_code: complaintview.activity_code || ''
  //     };

  //     axiosInstance.post(`${Base_Url}/ticketFormData`, data, {
  //       headers: {
  //         Authorization: token, // Send token in headers
  //       },
  //     })
  //       .then((response) => {
  //         // setComplaintview({
  //         //   ...complaintview,
  //         //   serial_no: '',
  //         //   ModelNumber: '',
  //         //   engineer_id: '',
  //         //   call_status: '',
  //         // });
  //         // fetchComplaintview(complaintid);
  //         fetchComplaintDetails(complaintid)

  //         setTicketUpdateSuccess({
  //           message: 'Enginerer added successfully!',
  //           visible: true,
  //           type: 'success',
  //         });

  //         // Hide the message after 3 seconds
  //         setTimeout(() => {
  //           setTicketUpdateSuccess({
  //             message: '',
  //             visible: false,
  //             type: 'success',
  //           });
  //         }, 3000);
  //       })
  //       .catch((error) => {
  //         console.error('Error updating ticket:', error);
  //         setTicketUpdateSuccess({
  //           message: 'Error updating ticket. Please try again.',
  //           visible: true,
  //           type: 'error',
  //         });

  //         setTimeout(() => {
  //           setTicketUpdateSuccess({
  //             message: '',
  //             visible: false,
  //             type: 'error',
  //           });
  //         }, 3000);
  //       });
  //   } else {


  //     if (addedEngineers.length === 0) {
  //       alert('Please Add the Engineer');
  //     }
  //   }



  // };

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

    const isValidValue = (value) => value !== null && value !== 'null' && value !== '';


    // Make `sub_call_status` mandatory if `call_status` is selected
    if (isValidValue(callstatusid) && !isValidValue(complaintview.sub_call_status)) {
      alert("Please select the Sub Call Status");
      return;
    }


    if (complaintview.serial_no && String(complaintview.serial_no).length !== 9) {
      alert("Serial number should be exactly 9 digits!");
      return;
    }
    
    
    if (complaintview.sub_call_status === 'Technician on-route') {
      if (addedEngineers.length === 0) {
        // Handle the case where no engineers are added
        alert('Please add the engineer');
        return; // Prevent further execution if needed
      }
    }





    if (

      complaintview.call_status === 'Closed'
        ? (complaintview.ticket_type === 'MAINTENANCE' || isValidValue(complaintview.defect_type)) &&
        (complaintview.ticket_type === 'MAINTENANCE' || isValidValue(complaintview.site_defect)) &&
        (complaintview.ticket_type === 'MAINTENANCE' || isValidValue(complaintview.activity_code)) &&
        (complaintview.ticket_type === 'MAINTENANCE' || isValidValue(complaintview.visit_count)) &&
        (complaintview.ticket_type === 'MAINTENANCE' || groupstatusid) &&
        (complaintview.ticket_type === 'VISIT' || isValidValue(complaintview.serial_no)) &&
        (complaintview.ticket_type !== "VISIT" ? isValidValue(complaintview.purchase_date) : true) &&
        addedEngineers.length > 0 &&
        isValidValue(complaintview.closed_date)
        : true
    ) {


      // Check only for note being empty
      if (!note) {
        setErrorMessage("Please select Compulsary Field.");

        return;
      }

      try {
        const complaintRemarkData = {
          ticket_no: complaintview.ticket_no,
          complete_date: complaintview.closed_date,
          customer_mobile: complaintview.customer_mobile,
          customer_id: complaintview.customer_id,
          dealercustid: dealercustid,
          customer_name: complaintview.customer_name,
          address: complaintview.address,
          region: complaintview.region,
          state: complaintview.state,
          city: complaintview.city,
          area: complaintview.area,
          pincode: complaintview.pincode,
          customer_class: complaintview.customer_class,
          totp: complaintview.totp,
          ticket_type: complaintview.ticket_type,
          ticket_start_date: complaintview.created_date,
          call_city: complaintview.class_city,
          visit_count: complaintview.visit_count || 0,
          call_status: callstatusid || '',
          call_status_id: callid || '',
          sub_call_status: complaintview.sub_call_status || '',
          group_code: groupstatusid || '',
          site_defect: complaintview.site_defect || '',
          defect_type: complaintview.defect_type || '',
          activity_code: complaintview.activity_code || '',
          serial_no: String(complaintview.serial_no),
          ModelNumber: complaintview.ModelNumber,
          purchase_date: complaintview.purchase_date,
          warrenty_status: complaintview.warranty_status || warranty_status_data,
          engineerdata: addedEngineers.map((item) => item.engineer_id),
          engineername: addedEngineers.map((item) => item.title),
          mandays: complaintview.mandays,
          mandaysprice: complaintview.mandaysprice,
          gas_chargs: complaintview.gas_chargs,
          gas_transportation: complaintview.gas_transportation,
          transportation: complaintview.transportation,
          transportation_charge: complaintview.transportation_charge,
          allocation: allocation,
          note,
          created_by,
        };

        const remarkResponse = await axiosInstance.post(
          `${Base_Url}/addcomplaintremark`,
          complaintRemarkData
          , {
            headers: {
              Authorization: token, // Send token in headers
            },
          });

        if (remarkResponse.data) {
          fetchComplaintview(complaintid)
          // window.location.reload()
        }

        if (quotationcheck == true) {
          GenerateQuotation()
        }



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
              Authorization: token,

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
    } else {
      const isInvalidValue = (value) => !value || value === 'null';

      if (complaintview.ticket_type !== 'MAINTENANCE' && !groupstatusid) {
        alert('Please select the group code');
      } else if (complaintview.call_status === 'Closed') {
        if (complaintview.ticket_type !== 'MAINTENANCE' && isInvalidValue(complaintview.defect_type)) {
          alert('Please select the Defect type');
        } else if (complaintview.ticket_type !== 'MAINTENANCE' && isInvalidValue(complaintview.site_defect)) {
          alert('Please select the site defect');
        } else if (complaintview.ticket_type !== 'MAINTENANCE' && isInvalidValue(complaintview.activity_code)) {
          alert('Please select activity code');
        }
        else if (complaintview.ticket_type !== 'MAINTENANCE' && isInvalidValue(complaintview.visit_count)) {
          alert('Please select visit count');
        }
        else if (isInvalidValue(complaintview.closed_date)) {
          alert('Please select complete date');
        }
        else if (complaintview.ticket_type !== 'VISIT' && isInvalidValue(complaintview.serial_no)) {
          alert('Please select the Serial No');
        } else if (complaintview.ticket_type !== 'VISIT' && !complaintview.purchase_date) {
          alert('Please select the Purchase Date');
        } else if (addedEngineers.length === 0) {  // Fixed validation here
          alert('Please add the engineer');
        }
      }
    }




  };





  useEffect(() => {
    if (ticketTab.length == 0) {
      navigate(`/csp/ticketlist`);
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

    const storedTabTicket = JSON.parse(localStorage.getItem('tabticket')) || [];
    setTicketTab(storedTabTicket);

    setActiveTicket(complaintid); // Set the active ticket ID




  }, [complaintid, complaintview.ticket_no, complaintview.customer_mobile]);

  useEffect(() => {
    if (engtype == "Franchisee") {

      getEngineer();
    } else if (engtype == "LHI") {

      getLHIEngineer();

    } else {
      setEngineer([])
    }


  }, [engtype])

  useEffect(() => {
    getcallstatus()
    // getsubcallstatus()

    getgroupdefect()
    getdefecttype()
    getsitecode()
  }, [])


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
        navigate(`/csp/ticketview/${newTicketList[0].ticket_id}`);
      } else {
        setActiveTicket(null);
        navigate(`/csp/ticketlist`);
      }
    }
    setTicketTab(newTicketList);
  };


  const sendtoedit = async (id) => {
    // alert(id)
    id = id.toString()
    let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
    encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    // navigate(`/quotation/${encrypted}`)
    // alert(encrypted)
    navigate(`/csp/ticketview/${encrypted}`)
  };


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
    pageid: String(43)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])


  async function getEngineerRemark(ticket_no) {

    axios.post(`${Base_Url}/getengineerremark`, { ticket_no: ticket_no }, {
      headers: {
        Authorization: token
      }
    })
      .then((res) => {
        setEngRemark(res.data)
      })
      .then((err) => {
        console.log(err)
      })
  }


  //For Pdf

  async function downloadPDF(id) {

    Blob()
  }


  const Blob = async () => {

    try {
      const blob = await pdf(<Jobcardpdf attachments={attachments} data={updatedata} duplicate={duplicate} spare={addedSpareParts} engineer={addedEngineers} engremark={engremark} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };


  async function getquotedetails123(oid) {
    try {
      const res = await axiosInstance.post(`${Base_Url}/getquotedetails`, { quotaion_id: oid }, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      // Decrypt the response data
      const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

      const spareData = await getquotespare(decryptedData[0].quotationNumber);
      const cspData = await getcspformticket(decryptedData[0].ticketId);

      // Pass all data to Blobs
      await Blobs(decryptedData[0], spareData, cspData);

    } catch (error) {
      console.error('Error fetching quote details:', error);
    }
  }

  async function getquotespare(quote_id) {
    try {
      const res = await axiosInstance.post(`${Base_Url}/getquotationspare`, { quote_id: quote_id }, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      // Decrypt the response data
      const encryptedData = res.data.encryptedData;
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));


      return decryptedData;

    } catch (error) {
      console.error('Error fetching quote spare details:', error);
      return null; // Return null in case of error to avoid breaking execution
    }
  }

  async function getcspformticket(ticketId) {
    try {
      const res = await axiosInstance.post(`${Base_Url}/getcspformticket`, { ticket_no: ticketId }, {
        headers: {
          Authorization: token
        }
      });

      // Decrypt the response data
      const encryptedData = res.data.encryptedData;
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

      return decryptedData[0]; // Assuming you need the first object

    } catch (error) {
      console.error('Error fetching CSP form ticket:', error);
      return null;
    }
  }

  const Blobs = async (data, spare112, cspdata1) => {
    try {


      const blob = await pdf(<MyDocument8 data={data} spare={spare112} csp={cspdata1} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };






  return (
    <>

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
                  <span style={{ fontSize: "14px" }}>Ticket : {complaintview.ticket_no} </span>
                </label>
              </div>
              <div className="col-md-9 text-right pt-2" style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
                {ticketTab.map((item) => (
                  <Chip
                    key={item.ticket_id}
                    label={item.ticket_no}
                    variant={activeTicket == item.ticket_id ? "filled" : "outlined"}
                    color={activeTicket == item.ticket_id ? "primary" : "default"}
                    onClick={() => {
                      setComplaintview({})
                      setAddedEngineers([])
                      setsubCallstatus([])
                      sendtoedit(item.ticket_id)
                    }}
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
                  <b>Mother Branch</b> : {complaintview.mother_branch}
                </p>
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
                                    onClick={() => {
                                      addInTab(item.ticket_no, item.id)

                                    }}
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
                {closestatus == 'Closed' && subclosestatus == "Fully" || closestatus == 'Cancelled' ? null : <div>
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.eml"
                      onChange={handleFile2Change}
                      disabled={closestatus == 'Closed' && subclosestatus == "Fully" || closestatus == 'Cancelled' ? true : false}
                      ref={fileInputRef} // Attach the ref to the input
                    />
                  </div>
                  {/* <div className="d-flex justify-content-end mb-3">
                      {roleaccess > 2 ? <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAttachment2Submit}
                        disabled={closestatus == 'Closed' && subclosestatus == "Fully" || closestatus == 'Cancelled' ? true : false}
                        style={{ fontSize: "14px" }}
                      >
                        Upload
                      </button> : null}

                    </div> */}
                </div>}


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
                                  const result = fileName.substring(fileName.indexOf('-') + 1);

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
                                        {result}
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

                    <></>
                  ) : currentAttachment2.toLowerCase().endsWith(".xls") ||
                    currentAttachment2.toLowerCase().endsWith(".xlsx") ? (

                    <></>
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
                <div className="row ">

                  {/* <div className="col-md-4">
                                      <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Model</p>
                                      <p style={{ fontSize: "14px"}}>{complaintview.ModelNumber}</p>
                                  </div> */}

                  <div className="col-md-2">
                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>
                      Serial No
                    </p>
                    {closestatus === "Closed" && subclosestatus === 'Fully' && sserial_no == 0 ? (
                      <p style={{ fontSize: "14px" }}>{complaintview.serial_no} </p>
                    ) : sserial_no != 0 ? (
                      <p style={{ fontSize: "14px" }}>{complaintview.serial_no}</p>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        name="serial_no"
                        value={complaintview.serial_no || ""}
                        placeholder="Enter Serial No"
                        style={{ fontSize: "14px", width: "100%" }}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers and limit to 9 digits
                          if (/^\d{0,9}$/.test(value)) {
                            handleModelChange(e);
                          }
                        }}
                      />
                    )}
                  </div>


                  <div className="col-md-3">
                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Model </p>
                    {complaintview.ModelNumber ? <p>{complaintview.ModelNumber}</p> : null}


                  </div>




                  <div className="col-md-4">
                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Purchase Date</p>
                    <p style={{ fontSize: "14px" }}>{purchase_date == null || purchase_date == '' ? <DatePicker
                      selected={complaintview.purchase_date}
                      onChange={(date) => {

                        getDateAfterOneYear(date);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="DD-MM-YYYY"
                      className='form-control'
                      name="purchase_date"
                      aria-describedby="Anidate"

                      maxDate={new Date().toISOString().split("T")[0]}
                    /> : formatDate(complaintview.purchase_date)}</p>
                  </div>

                  <div className="col-md-3">
                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Warranty Status</p>
                    <p style={{ fontSize: "14px" }}>{complaintview.warranty_status ? complaintview.warranty_status : warranty_status_data} </p>
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

                      {(closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled') ? null :
                        <form onSubmit={handleSubmit}>
                          <div className="card-body p-4">
                            <div className="row">
                              <div className="mb-3 col-lg-4">
                                <h4 className="pname" style={{ fontSize: "14px" }}>Call Status</h4>
                                <select
                                  name="call_status"
                                  className="form-control"
                                  disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                  style={{ fontSize: "14px" }}
                                  // value={complaintview.call_status}
                                  onChange={(e) => {
                                    const selectedname = e.target.value; // Get the id
                                    const selectedid = callstatus.find(item => item.Callstatus == selectedname)?.id; // Find the corresponding Callstatus value
                                    getsubcallstatus(selectedid); // Send the id to fetch sub-call statuses
                                    // Log or use the Callstatus value
                                    setComplaintview((prev) =>({
                                      ...prev,
                                      sub_call_status : ""
                                    }))
                                    setCallstatusid(selectedname)
                                    setCallid(selectedid)
                                    handleModelChange(e)
                                  }}
                                >
                                  <option value="">Select </option>
                                  {callstatus.map((item) => (
                                    <option key={item.id} value={item.Callstatus}>
                                      {item.Callstatus}
                                    </option>
                                  ))}
                                </select>

                              </div>
                              <div className="mb-3 col-lg-4">
                                <h4 className="pname" style={{ fontSize: "14px" }}>Sub Call Status</h4>
                                <select name="sub_call_status" disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false} className="form-control" style={{ fontSize: "14px" }} onChange={handleModelChange}>
                                  <option value="" >Select </option>
                                  {subcallstatus.map((item) => {
                                    return (

                                      <option value={item.SubCallstatus}>{item.SubCallstatus}</option>
                                    )
                                  })}


                                </select>
                              </div>
                              <div className="mb-3 col-lg-4">
                                <h4 className="pname" style={{ fontSize: "14px" }}>Field complete date</h4>
                                <DatePicker
                                  selected={complaintview.closed_date}
                                  onChange={handlefeilddatechange}
                                  dateFormat="dd-MM-yyyy"
                                  placeholderText="DD-MM-YYYY"
                                  className='form-control'
                                  name="closed_date"
                                  disabled={complaintview.call_status == 'Closed' ? false : true}
                                  aria-describedby="Anidate"
                                  minDate={complaintview.ticket_date}
                                  maxDate={new Date().toISOString().split("T")[0]}
                                />

                              </div>
                              {(complaintview.call_status == 'Spares' || ((complaintview.call_status == 'Approval' && complaintview.sub_call_status == 'Customer Approval / Quotation'))) &&

                                <div className=" py-1 my-2">
                                  <h4 className="pname" style={{ fontSize: "14px" }}>Spare Parts:</h4>
                                  <div className="row align-items-center">


                                    <div className="col-lg-6">
                                      <Autocomplete
                                        size="small"
                                        options={spare || []}
                                        getOptionLabel={(option) =>
                                          option.article_code + " - " + option.article_description
                                        }
                                        value={
                                          spare.find((part) => part.id === spareid) || null
                                        } // Set the selected value
                                        onChange={(event, newValue) =>
                                          handlesparechange(newValue ? newValue.id : "")
                                        }
                                        disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled'}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label="Select Spare Part"
                                            variant="outlined"
                                            fullWidth

                                          />
                                        )}
                                        noOptionsText="No spare parts available"
                                        sx={{
                                          background: "#fff"
                                        }}

                                      />
                                    </div>

                                    <div className="col-lg-4 ">
                                      <input
                                        type="number"
                                        className="form-control"
                                        name="quantity"
                                        placeholder="Qty"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled'}
                                        min="1"
                                      />
                                    </div>

                                    <div className="col-lg-2 ">

                                      <button
                                        className="btn btn-primary btn-sm"
                                        disabled={closestatus == "Closed" && subclosestatus == 'Fully' || closestatus == 'Cancelled'}
                                        onClick={handleAddSparePart}
                                      >
                                        Add
                                      </button>

                                    </div>
                                  </div>

                                  <div className="mt-3" style={{ overflowX: "scroll" }}>
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


                                        {addedSpareParts.filter(part => {
                                          if (uniqueParts.has(part.article_code)) {
                                            return false; // Skip duplicate
                                          }
                                          uniqueParts.add(part.article_code);
                                          return true; // Include unique
                                        }).map((part) => {
                                          return (
                                            <tr key={part.id}>
                                              <td>{part.article_code} - {part.article_description}</td>
                                              <td>{part.quantity || 0}</td>
                                              <td>
                                                <button
                                                  className="btn btn-sm btn-danger"
                                                  style={{ padding: "0.2rem 0.5rem" }}
                                                  disabled={closestatus === 'Closed' && subclosestatus === 'Fully' || closestatus === 'Cancelled'}
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
                                    {complaintview.call_status == 'Approval' && complaintview.sub_call_status == 'Customer Approval / Quotation' ? (
                                      <>
                                        <input type="checkbox" name="quotationcheck" checked={quotationcheck} id="quotationcheck" onChange={(e) => setquotationcheck(e.target.checked)} className="" /> <span>Generate Quotation</span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>

                              }

                              {(complaintview.call_status == 'Closed') &&
                                <div className=" py-1 my-2">
                                  <div className="row">
                                    <hr />
                                    <div className="mt-3 col-lg-6">
                                      <h4 className="pname" style={{ fontSize: "14px" }}>Defect Group Code:</h4>
                                      <select
                                        name="group_code"
                                        className="form-control"
                                        disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                        style={{ fontSize: "14px" }}
                                        value={groupstatusid}
                                        onChange={(e) => {
                                          const selectedcode = e.target.value; // Get the id
                                          // const selectedid = groupdefect.find(item => item.Callstatus == selectedname)?.id; // Find the corresponding Callstatus value
                                          getdefecttype(selectedcode); // Send the id to fetch sub-call statuses
                                          getsitecode(selectedcode); // Send the id to fetch sub-call statuses
                                          setgroupstatusid(selectedcode)
                                          handleModelChange(e)
                                        }}
                                      >
                                        <option value="">Select </option>
                                        {groupdefect.map((item) => (
                                          <option key={item.id} value={item.defectgroupcode}>
                                            {item.defectgroupcode} - {item.defectgrouptitle}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="mt-3 col-lg-6">
                                      <h4 className="pname" style={{ fontSize: "14px" }}>Type of Defect Code:</h4>
                                      <select
                                        name="defect_type"
                                        className="form-control"
                                        disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                        style={{ fontSize: "14px" }}
                                        value={complaintview.defect_type}
                                        onChange={handleModelChange}
                                      >
                                        <option value="">Select </option>
                                        {GroupDefecttype.map((item) => (
                                          <option key={item.id} value={item.defect_code}>
                                            {item.defect_code} - {item.defect_title}
                                          </option>
                                        ))}
                                      </select>
                                      {error.defect_type && <span className="text-danger">{error.defect_type}</span>}
                                    </div>
                                    <div className="mt-3 col-lg-6">
                                      <h4 className="pname" style={{ fontSize: "14px" }}>Site Defect Code:</h4>
                                      <select
                                        name="site_defect"
                                        className="form-control"
                                        disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                        style={{ fontSize: "14px" }}
                                        value={complaintview.site_defect}
                                        onChange={handleModelChange}
                                      >
                                        <option value="">Select </option>
                                        {GroupDefectsite.map((item) => (
                                          <option key={item.id} value={item.dsite_code}>
                                            {item.dsite_code} - {item.dsite_title}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="my-3 col-lg-6">
                                      <h4 className="pname" style={{ fontSize: "14px" }}>Activity Code</h4>
                                      <select
                                        name="activity_code"
                                        className="form-control"
                                        disabled={
                                          (closestatus === 'Closed' && subclosestatus === 'Fully') || closestatus === 'Cancelled'
                                        }
                                        style={{ fontSize: "14px" }}
                                        value={complaintview.activity_code}
                                        onChange={handleModelChange}
                                      >
                                        <option value="">Select</option>
                                        {activity.map((item) => (
                                          <option key={item.id} value={item.code}>
                                            {item.code} - {item.title}
                                          </option>
                                        ))}
                                      </select>
                                    </div>





                                  </div>


                                </div>
                              }

                              {(complaintview.call_status == 'Closed') &&
                                <>
                                  <div className="my-3 col-lg-6">
                                    <input type="checkbox" onChange={handleChange} name="gascheck" checked={complaintview.gascheck == 'Yes' ? true : false} /> <label>Gas Charges</label>
                                  </div>

                                  <div className="my-3 col-lg-6">
                                    <input type="checkbox" onChange={handleChange} name="transportcheck" checked={complaintview.transportcheck == 'Yes' ? true : false} /> <label>Gas Transport Charges</label>
                                  </div>

                                  <div className="my-3 col-lg-6">
                                    <input type="checkbox" onChange={handleChange} name="mandays" /> <label>Mandays</label>
                                    {mandays && <input
                                      type="number"
                                      name="mandaysprice"
                                      className="form-control"
                                      onChange={handleModelChange}
                                    />}

                                  </div>

                                  <div className="my-3 col-lg-6">
                                    <input type="checkbox" onChange={handleChange} name="transportation" /> <label>Tranportation</label>
                                    {transport && <input
                                      type="number"
                                      name="transportation_charge"
                                      className="form-control"
                                      onChange={handleModelChange}
                                    />}

                                  </div>

                                  <div className="my-3 col-lg-6">
                                    <h4 className="pname" style={{ fontSize: "14px" }}>Visit Count</h4>
                                    <select
                                      name="visit_count"
                                      className="form-control"
                                      disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                      style={{ fontSize: "14px" }}
                                      value={complaintview.visit_count}
                                      onChange={handleModelChange}
                                    >
                                      <option value="">Select </option>
                                      <option value='0'>0</option>
                                      <option value='1'>1</option>
                                      <option value='2'>2</option>
                                      <option value='3'>3</option>
                                      <option value='4'>4</option>
                                    </select>
                                  </div>
                                </>
                              }


                              <div className="form-outline mb-2">
                                <label
                                  htmlFor="uploadFiles"
                                  className="form-label mp-0"
                                  style={{ fontSize: "14px" }}
                                >
                                  <b>Remark</b><span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  id="addANote"
                                  name="note"
                                  className="form-control"
                                  placeholder="Type comment..."
                                  disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                  value={note}
                                  onChange={(e) => setNote(e.target.value)}
                                />
                              </div>
                              {/* Consolidated error message */}
                              {errorMessage && (
                                <div className="text-danger mt-2">{errorMessage}</div>
                              )}

                              {/* Right-aligned submit button */}

                              {/* File upload field for images, videos, and audio */}
                              <div className="form-outline mb-4">
                                <label
                                  htmlFor="uploadFiles"
                                  className="form-label mp-0"
                                  style={{ fontSize: "14px" }}
                                >
                                  <b> Upload Files (Images, Videos, Audios)</b>
                                </label>
                                <input
                                  type="file"
                                  id="uploadFiles"
                                  name="attachment"
                                  className="form-control"
                                  multiple
                                  accept="image/*,video/*,audio/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.eml"
                                  onChange={handleFileChange}
                                  disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                  ref={fileInputRef2} // Attach the ref to the input
                                />
                              </div>



                              <div className="d-flex justify-content-end">


                                <button
                                  type="submit"
                                  className="btn btn-primary"
                                  style={{ fontSize: "14px" }}
                                  onClick={handleSubmit}
                                  disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                                >
                                  Upload Remark
                                </button>

                              </div>
                            </div>


                          </div>

                        </form>
                      }



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
                            <p style={{ fontSize: "14px", margin: 0 }} dangerouslySetInnerHTML={{ __html: remark.remark }}></p>

                          </div>

                          {/* By and Date Section - 20% */}
                          <div style={{ flex: "0 0 20%", textAlign: "right" }}>

                            {remark.title == '' || remark.title == null ? null : <h3 className="mainheade important-margin" style={{ fontSize: "12px", margin: 0 }}>
                              By: {remark.title}
                            </h3>}

                            {remark.created_date == '' || remark.created_date == null ? null : <h3 className=" date-header" >
                              Date:  {formatDate1(remark.created_date)}
                            </h3>}
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

                                      const result = fileName.substring(fileName.indexOf('-') + 1);


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
                                            {result} {/* Display the new file name */}
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

                      <></>
                    ) : currentAttachment.toLowerCase().endsWith(".xls") ||
                      currentAttachment.toLowerCase().endsWith(".xlsx") ? (

                      <></>
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
              <div className="m-1">
                <button className="btn btn-primary btn-sm float-end" onClick={() => downloadPDF()}>Download Job Card</button>
              </div>
              <div className="card-body">
                <h4 className="pname" style={{ fontSize: "14px" }}>Call Status</h4>
                <div className="mb-3">


                  <input className="form-control" style={{ fontSize: "14px" }} disabled type="text" value={updatedata.call_status} />

                </div>

                <h4 className="pname" style={{ fontSize: "14px" }}>Sub Call Status</h4>
                <div className="mb-3">

                  <input className="form-control" style={{ fontSize: "14px" }} disabled type="text" value={updatedata.sub_call_status} />
                </div>

                {closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? null : <div className="d-flex mb-3">

                  <div className="form-check me-3">
                    <input
                      type="radio"
                      className="form-check-input"
                      disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
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
                      disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
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

                </div>}


                {(closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled') ? null : <h4 className="pname" style={{ fontSize: "14px" }}>Engineer</h4>}

                {(closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled') ? null :
                  <div className="row">
                    <div className="col-lg-9">


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
                        disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                        onClick={AddEngineer}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                }


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
                          <td>{eng.employee_code || "N/A"}</td> {/* Display user type or "N/A" */}
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              style={{ padding: "0.2rem 0.5rem" }}
                              disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
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

                <div className="d-flex justify-content-end py-2">
                  {/* 
                    {roleaccess > 2 ?
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ fontSize: "14px", marginTop: '5px' }}
                        onClick={handleSubmitTicketFormData}
                        disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                      >
                        Submit
                      </button> : null} */}


                </div>

                <div className="my-3 ">
                  <h4 className="pname" style={{ fontSize: "14px" }}>Visit Count</h4>
                  <select
                    name="visit_count"
                    className="form-control"
                    disabled
                    style={{ fontSize: "14px" }}
                    value={updatedata.visit_count}
                    onChange={handleModelChange}
                  >
                    <option value='0'>0</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                  </select>
                </div>





                {(complaintview.call_status == 'Closed' || (complaintview.group_code != null && complaintview.group_code != "")) &&
                  <>
                    <div className="mt-3">
                      <h4 className="pname" style={{ fontSize: "14px" }}>Defect Group Code:</h4>
                      <select
                        name="group_code"
                        className="form-control"
                        // disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                        disabled
                        style={{ fontSize: "14px" }}
                        value={updatedata.group_code}
                        onChange={(e) => {
                          const selectedcode = e.target.value; // Get the id
                          getdefecttype(selectedcode); // Send the id to fetch sub-call statuses
                          getsitecode(selectedcode); // Send the id to fetch sub-call statuses
                          setgroupstatusid(selectedcode)
                          handleModelChange(e)
                        }}
                      >
                        <option value="">Select </option>
                        {groupdefect.map((item) => (
                          <option key={item.id} value={item.defectgroupcode}>
                            {item.defectgroupcode} - {item.defectgrouptitle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3">
                      <h4 className="pname" style={{ fontSize: "14px" }}>Type of Defect Code:</h4>
                      <select
                        name="defect_type"
                        className="form-control"
                        // disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                        disabled
                        style={{ fontSize: "14px" }}
                        value={updatedata.defect_type}
                        onChange={handleModelChange}
                      >
                        <option value="">Select </option>
                        {GroupDefecttype.map((item) => (
                          <option key={item.id} value={item.defect_code}>
                            {item.defect_code} - {item.defect_title}
                          </option>
                        ))}
                      </select>
                      {error.defect_type && <span className="text-danger">{error.defect_type}</span>}
                    </div>
                    <div className="mt-3">
                      <h4 className="pname" style={{ fontSize: "14px" }}>Site Defect Code:</h4>
                      <select
                        name="site_defect"
                        className="form-control"
                        // disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled' ? true : false}
                        disabled
                        style={{ fontSize: "14px" }}
                        value={updatedata.site_defect}
                        onChange={handleModelChange}
                      >
                        <option value="">Select </option>
                        {GroupDefectsite.map((item) => (
                          <option key={item.id} value={item.dsite_code}>
                            {item.dsite_code} - {item.dsite_title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3">
                      <h4 className="pname" style={{ fontSize: "14px" }}>Activity Code</h4>
                      <select
                        name="activity_code"
                        className="form-control"
                        // disabled={
                        //   (closestatus === 'Closed' && subclosestatus === 'Fully') || closestatus === 'Cancelled'
                        // }
                        disabled
                        style={{ fontSize: "14px" }}
                        value={updatedata.activity_code}
                        onChange={handleModelChange}
                      >
                        <option value="">Select</option>
                        {activity.map((item) => (
                          <option key={item.id} value={item.code}>
                            {item.code} - {item.title}
                          </option>
                        ))}
                      </select>
                    </div>


                  </>
                }







                {TicketUpdateSuccess.visible && (
                  <div style={successMessageStyle}>
                    {TicketUpdateSuccess.message}
                  </div>
                )}

              </div>
            </div>

            {(uniquesparepart.length > 0) && <div className="card mb-3">
              <div className="card-body">

                <div className="mt-3" >

                  {/* Display added spare parts */}
                  <div className="mt-3" style={{ overflowX: "scroll" }}>
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


                        {uniquesparepart.map((part) => {
                          return (
                            <tr key={part.id}>
                              <td>{part.article_code} - {part.article_description}</td>
                              <td>{part.quantity || 0}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ padding: "0.2rem 0.5rem" }}
                                  disabled={closestatus === 'Closed' && subclosestatus === 'Fully' || closestatus === 'Cancelled'}
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

                  {/* {addedSpareParts.length > 0 &&
                      <div className="d-flex justify-content-end py-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ fontSize: "14px" }}
                          onClick={GenerateQuotation}
                          disabled={closestatus == 'Closed' && subclosestatus == 'Fully' || closestatus == 'Cancelled'}
                        >
                          Generate Quotation
                        </button>
                      </div>
                    } */}

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
                          {/* <th>Engineer</th>
                            <th>Status</th> */}
                          <th style={{ width: "20%" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.map((part) => (
                          <tr key={part.id}>
                            <td>{part.quotationNumber}</td>
                            {/* <td>{part.assignedEngineer}</td> */}
                            {/* <td>{part.status}</td> */}
                            <td><button type="button" className="btn btn-primary btn-sm" onClick={() => getquotedetails123(part.id)} >View</button></td>
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





          </div>
        </div>
      </div>

    </>

  );
}
