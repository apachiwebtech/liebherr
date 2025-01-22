import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Base_Url, secretKey } from '../../Utils/Base_Url'
import { useNavigate, useParams } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import CryptoJS from 'crypto-js';
import { useOutletContext } from 'react-router-dom';
import DatePicker from "react-datepicker";


export function Registercomplaint(params) {

  const [customerEndId, setCustomerEndId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [hideticket, setHideticket] = useState(false)
  const [errors, setErrors] = useState({})
  const [serachval, setSearch] = useState('')
  const [serialid, setSerialid] = useState('')
  const [modelid, setModelid] = useState('')
  const [p_date, setpdate] = useState('')
  const [searchdata, setSearchData] = useState([])
  const [ProductCustomer, setProductCustomer] = useState([])
  const [warranty_status_data, setWarranty_status_data] = useState('OUT OF WARRANTY')
  const [DuplicateCustomerNumber, setDuplicateCustomerNumber] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [form, setForm] = useState(false)
  const [state, setState] = useState([])
  const [area, setdistricts] = useState([])
  const [city, setCity] = useState([])
  const [pincode, setPincode] = useState([])
  const [product, setProduct] = useState([])
  const [purchase_data, setpurchase_data] = useState('')
  const [ChildPartner, setChildPartner] = useState([])
  const [ModelNumber, setModelNumber] = useState([])
  const [duplicate, setDuplicate] = useState([]);
  const [ticket, setTicket] = useState([])
  const [ticketno, setTicketNo] = useState([])
  const [ticketid, setTicketid] = useState('')
  const [serialhide, setserialHide] = useState('')
  const [purchasehide, setpurchseHide] = useState('')
  const [classificationid, setClassification] = useState('')
  const token = localStorage.getItem("token");
  const fileInputRef = useRef();
  const { setHeaderState } = useOutletContext();
  const [checkboxes, setCheckboxes] = useState({
    awhatsaap: 0,
    mwhatsapp: 0,
  });

  const handleKeyDown = (e) => {
    // Prevent '+' and '-' keys
    if (e.key === "-" || e.key === "+") {
      e.preventDefault();
    }
  };


  const oncheckchange = (e) => {
    const { name, checked } = e.target;
    setCheckboxes((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0, // Convert to 1 or 0
    }));
  };




  let { Comp_id } = useParams()
  // alert("this is")
  try {
    Comp_id = Comp_id.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = CryptoJS.AES.decrypt(Comp_id, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    Comp_id = decrypted

  } catch (error) {
    console.log("Error".error)
  }

  const [files2, setFiles2] = useState([]); // New state for Attachment 2 files
  const [location, setLocation] = useState([])
  const created_by = localStorage.getItem("licare_code"); // Get user ID from localStorage
  const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage
  const [attachments2, setAttachments2] = useState([]);
  const [locations, setlocations] = useState([])
  const [serials, setserial] = useState([])
  const [currentAttachment2, setCurrentAttachment2] = useState(""); // Current attachment 2 for modal
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [add_new_ticketdata, setadd_new_ticketdata] = useState('')
  const { loaders, axiosInstance } = useAxiosLoader();


  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero
    const day = String(today.getDate()).padStart(2, '0'); // Add leading zero
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayDate());

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };



  const formatpurDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const sendtoedit123 = async (id) => {
    // alert(id)
    id = id.toString()
    let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
    encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    // navigate(`/quotation/${encrypted}`)
    navigate(`/complaintview/${encrypted}`)
  };



  //setting the values
  const currentDate = new Date().toISOString().split('T')[0];

  const [value, setValue] = useState({
    complaint_date: "" || currentDate,
    customer_name: "",
    contact_person: "",
    email: "",
    mobile: "",
    alt_mobile: "",
    address: "",
    state: "",
    city: "",
    area: "",
    pincode: "",
    mode_of_contact: "",
    ticket_type: "",
    cust_type: "",
    warrenty_status: "",
    invoice_date: "",
    call_charge: "",
    model: "",
    serial: "",
    purchase_date: "",
    master_service_partner: "",
    child_service_partner: "",
    customer_id: "",
    customerEndId: "",
    additional_remarks: "",
    specification: "",
    msp: "",
    csp: "",
    created_by: created_by,
    dealer_info: "",
    salutation: "",
    sales_partner: "",
    sales_partner2: "",
    classification: "",
    Priority: "REGULAR",
    callType: "",
    requested_by: "",
    requested_email: "",
    requested_mobile: "",

  })

  const handleDateChange = (date) => {


    if (date) {
      const formattedDate = formatDate(date);
      setpurchase_data(formattedDate)
    }

  };

  const handleDateChange2 = (date) => {
    if (date) {
      const formattedDate = formatDate(date);
  
      setValue((prevState) => ({
        ...prevState, // Preserve existing values
        complaint_date: formattedDate  // Update only complaint_date
      }));
  
      setDate(formattedDate);  // Set formatted date correctly
    }
  };


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
      currentDate.setDate(currentDate.getDate() + 1);
      const currentDateMinusOneDay = currentDate.toISOString().split('T')[0];

      // Compare lastDate and currentDateMinusOneDay
      if (lastDate < currentDateMinusOneDay) {
        setWarranty_status_data("OUT OF WARRANTY");
        setpurchase_data(value);
      } else {
        setpurchase_data(value);
        setWarranty_status_data("WARRANTY");
      }

    } catch (error) {
      console.error("Error processing date:", error.message);
      return null; // Return null for invalid dates
    }
  };






  //Validation

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // if (!value.complaint_date) {
    //     isValid = false;
    //     newErrors.complaint_date = "Date is required";
    // }
    if (!value.customer_name && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.customer_name = "Name is required";
    }

    // if (!value.serial && value.ticket_type !== 'Visit' && value.ticket_type !== 'Helpdesk') {
    //   isValid = false;
    //   newErrors.serial = "Serial No is required";
    // }
    // if (!value.model && value.ticket_type !== 'Visit' && value.ticket_type !== 'Helpdesk') {
    //   isValid = false;
    //   newErrors.model = "Model is required";
    // }
    // if (!purchase_data && value.ticket_type !== 'Visit' && value.ticket_type !== 'Helpdesk') {
    //   isValid = false;
    //   newErrors.purchase_date = "Date is required";
    // }
    // if (!warranty_status_data && value.ticket_type !== 'Visit' && value.ticket_type !== 'Helpdesk') {
    //   isValid = false;
    //   newErrors.warrenty_status = "Status is required";
    // }
    if (!value.salutation && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.salutation = "Salutation is required";
    }
    if (!value.contact_person && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.contact_person = "Contact Person is required";
    }
    const mobileRegex = /^\d{10}$/; // Matches exactly 10 digits

    const validateMobile = (mobile) => mobileRegex.test(mobile);

    if (!value.mobile && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.mobile = "Mobile is required";
    } else if (value.mobile && !validateMobile(value.mobile)) {
      isValid = false;
      newErrors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (value.alt_mobile && !validateMobile(value.alt_mobile)) {
      newErrors.alt_mobile = "Please enter a valid 10-digit mobile number.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value.email && !emailRegex.test(value.email)) {
      newErrors.email = "Email id is not valid";
    }


    if (!value.address && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.address = "Address is required";
    }
    if (!value.pincode && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.pincode = "Pincode is required";
    }
    if (!value.mode_of_contact && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.mode_of_contact = "This is required";
    }
    if (!value.ticket_type && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.ticket_type = "Ticket is required";
    }
    if (!value.cust_type && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.cust_type = "Type is required";
    }
    // if (!value.requested_by && value.ticket_type !== 'Visit' && value.ticket_type !== 'Helpdesk') {
    //   isValid = false;
    //   newErrors.requested_by = "This is required";
    // }
    // if (!value.requested_email && value.ticket_type !== 'Visit' && value.ticket_type !== 'Helpdesk') {
    //   isValid = false;
    //   newErrors.requested_email = "This is required";
    // }
    if (value.requested_mobile && !validateMobile(value.requested_mobile)) {
      isValid = false;
      newErrors.requested_mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (!value.classification && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.classification = "Classification is required";
    }
    if (!value.specification && value.ticket_type !== 'VISIT' && value.ticket_type !== 'HELPDESK') {
      isValid = false;
      newErrors.specification = "Description is required";
    }

    if (!value.additional_remarks && value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK') {
      isValid = false;
      newErrors.additional_remarks = "Remark is required";
    }

    // if (!value.Priority) {
    //     isValid = false;
    //     newErrors.Priority = "Priority is required";
    // }




    setErrors(newErrors);
    setTimeout(() => {
      setErrors("")
    }, 5000);
    return isValid;
  }
  // Add this state to manage the popup visibility and selected address
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');


  // Sample existing addresses (you can fetch this from your API)
  const existingAddresses = [
    "Address 1",
    "Address 2",
    "Address 3",
  ];

  // Function to handle the address change
  const handleAddressChange = (e) => {
    const { value } = e.target;
    setValue(prevState => ({
      ...prevState,
      address: value
    }));
    setNewAddress(value);

  };

  useEffect(() => {
    // Get current date in the format YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    setValue((prevValue) => ({
      ...prevValue,
      complaint_date: currentDate
    }));
  }, []);

  // Function to open the popup
  const openPopup = () => {
    setIsPopupOpen(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // Function to handle the address selection from dropdown
  const handleExistingAddressChange = (e) => {
    const selected = e.target.value;
    setSelectedAddress(selected);
    setValue(prevState => ({
      ...prevState,
      address: selected // Set the selected address to the input field
    }));
  };

  const handleNewAddressSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    try {
      // Prepare the payload with the new address and additional fields
      const payload = {
        address: newAddress,
        pincode_id: value.pincode || '',
        ccperson: value.contact_person || '', // Extract contact person from form data
        ccnumber: value.mobile || '', // Extract mobile from form data
        customer_id: customerEndId, // Use customerEndId or send empty if not available
      };

      const response = await axiosInstance.post(`${Base_Url}/postcustomerlocation`, payload, {
        headers: {
          Authorization: token,
        },
      });

      if (response.data) {


        // Optimistically update the addresses state
        setAddresses(prevAddresses => [
          ...prevAddresses,
          { address: newAddress, id: response.data.newAddressId } // Assuming response contains the ID of the new address
        ]);

        // Reset the new address input
        setNewAddress('');
        setPincode('');
        closePopup();
        alert("Data submitted")
      } else {
        console.error("Error submitting new address:", response.data.message);
      }
    } catch (error) {
      console.error("Error submitting new address:", error);
    }
    fetchAddresses(customerEndId);
  };


  const addInTab = (ticket_no, ticket_id) => {
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
  };

  //This is for State Dropdown

  async function getState(params) {
    axiosInstance.get(`${Base_Url}/getstate`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data) {

          setState(res.data)

        }
      })
  }

  // fetch address from end customerlocation

  async function fetchAddresses(customerEndId) {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getEndCustomerAddresses/${customerEndId}`, {
        headers: {
          Authorization: token, // Send token in headers if required
        },
      });

      if (response.data.address) {
        setAddresses(response.data);
      }

      else if (Array.isArray(response.data)) {
        setAddresses(response.data);
      }

    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }

  //This is for product

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

  // New handler for Attachment 2 preview
  const handleAttachment2Click = (attachment) => {
    setCurrentAttachment2(attachment);
    setIsModal2Open(true);
  };


  // New handler for Attachment 2
  const handleFile2Change = (e) => {
    setFiles2(e.target.files);
  };

  // New function to fetch Attachment 2 list
  const fetchAttachment2Details = async () => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getAttachment2Details/${Comp_id}`, {
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

  const handleAttachment2Submit = async (e) => {
    e.preventDefault();


    try {
      if (files2.length > 0) {
        const formData = new FormData();
        formData.append("ticket_no", Comp_id);
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

  //Master Service Partner
  /*async function getMasterPartner(params) {

      axiosInstance.get(`${Base_Url}/getmasterpartner`)
          .then((res) => {
              if (res.data) {

                  setMasterPartner(res.data)
              }
          })

  }*/



  async function getCompticket(params) {

    const data = {
      comp_no: Comp_id
    }

    axiosInstance.post(`${Base_Url}/getcomplaintticket`, data
      , {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
    )
      .then((res) => {
        if (res.data) {

          setModelNumber(res.data[0].ModelNumber)
          setTicketNo(res.data[0].ticket_no)
          setSerialid(res.data[0].serial_no)
          setModelid(res.data[0].ModelNumber)
          setpdate(res.data[0].purchase_date)
          getDateAfterOneYear(res.data[0].purchase_date)
          setValue({
            ...value,
            complaint_date: res.data[0].ticket_date || currentDate,
            contact_person: res.data[0].contact_person,
            customer_name: res.data[0].customer_name,
            email: res.data[0].customer_email,
            mobile: res.data[0].customer_mobile,
            address: res.data[0].address,
            customer_id: res.data[0].customer_id,
            alt_mobile: res.data[0].alt_mobile,
            state: res.data[0].state,
            city: res.data[0].city,
            area: res.data[0].area,
            pincode: res.data[0].pincode,
            mode_of_contact: res.data[0].mode_of_contact,
            ticket_type: res.data[0].ticket_type,
            cust_type: res.data[0].call_type,
            warrenty_status: res.data[0].warranty_status,
            invoice_date: res.data[0].invoice_date,
            call_charge: res.data[0].call_charges,
            purchase_date: res.data[0].purchase_date || "",
            serial: res.data[0].serial_no || "",
            master_service_partner: res.data[0].service_partner || "",
            child_service_partner: res.data[0].child_service_partner || "",
            model: res.data[0].ModelNumber,
            msp: res.data[0].franchisee,
            csp: res.data[0].childPartner,
            sales_partner: res.data[0].sales_partner,
            sales_partner2: res.data[0].sales_partner2,
            classification: res.data[0].customer_class,
            Priority: res.data[0].call_priority,
            callType: res.data[0].callType,
            specification: res.data[0].specification,
            requested_by: res.data[0].requested_by,
            requested_email: res.data[0].requested_email,
            requested_mobile: res.data[0].requested_mobile,
            additional_remarks: res.data[0].call_remark,
            salutation: res.data[0].salutation
          })

          setlocations({ childfranchiseem: res.data[0].child_service_partner, franchiseem: res.data[0].sevice_partner })

          setCheckboxes({
            mwhatsapp: res.data[0].mwhatsapp,
            awhatsaap: res.data[0].awhatsapp
          })


        }
      })

  }



  // Child Service Partner
  async function getChildPartner(MasterId) {
    try {
      const res = await axiosInstance.get(`${Base_Url}/getchildpartner/${MasterId}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      if (res.data) {
        setChildPartner(res.data);
      }
    } catch (err) {
      console.error("Error fetching child partners:", err);
    }
  }

  useEffect(() => {

    // if (DuplicateCustomerNumber) {
    //     fetchComplaintDuplicate(DuplicateCustomerNumber);
    // }
    //getState()
    getProduct()
    // getMasterPartner()
    if (Comp_id) {

      getCompticket()

    }
    // getChildPartner()
  }, [DuplicateCustomerNumber])



  //This function is for search

  const searchResult = () => {
    setHasSearched(true); // Set that a search has been performed
    setForm(false)

    setHeaderState(true)

    axiosInstance.post(`${Base_Url}/getticketendcustomer`, { searchparam: serachval }, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {

        if (res.data.information && res.data.information.length > 0) {
          const customerInfo = res.data.information[0];
          // console.log(res.data,"Search Data")
          // console.log(res.data[0],"Hide Ticket")
          setDuplicateCustomerNumber(res.data.information[0].customer_mobile);
          setSearchData(res.data.information[0])
          setProductCustomer(res.data.product)
          setDuplicate(res.data.information);
          setNewAddress(res.data.information[0].address)
          setHideticket(true)
          // setTicket(res.data)
          setValue({
            ...value,
            customer_name: res.data.information[0].customer_name,
            email: res.data.information[0].email,
            mobile: res.data.information[0].mobileno,
            address: res.data.information[0].address,
            customer_id: res.data.information[0].id,
            custo_id: res.data.information[0].customer_id,
            customerEndId: customerInfo.customer_id,
            pincode: res.data.information[0].pincode,
            state: res.data.information[0].state,
            city: res.data.information[0].city,
            area: res.data.information[0].area

          })
          // Fetch addresses of end customer from customer


          fetchAddresses(res.data.information[0].customer_id);
          setCustomerEndId(customerInfo.customer_id);

        } else {
          // If no results found, clear previous data
          setSearchData([])
          setHideticket(false)
          setTicket([])
        }
      })

  }



  const notify = () => toast.success('Data Submitted..');

  const navigate = useNavigate()


  const handlesubmit = (e) => {

    e.preventDefault()


    const confirm = window.confirm("Are you sure?")

    if (confirm) {

      const data = {
        complaint_date: value.complaint_date || currentDate,
        customer_name: value.customer_name || '',
        contact_person: value.contact_person || '',
        email: value.email || '',
        mobile: value.mobile || '',
        alt_mobile: value.alt_mobile || '',
        address: newAddress || value.address || '',
        state: value.state || '',
        city: value.city || '',
        area: value.area || '',
        pincode: value.pincode || '',
        mode_of_contact: value.mode_of_contact || '',
        ticket_type: value.ticket_type || '',
        cust_type: value.cust_type || '',
        warrenty_status: value.warrenty_status || '',
        invoice_date: value.invoice_date || '',
        call_charge: value.call_charge || '',
        cust_id: value.customer_id || "", // Fix customer ID handling
        model: value.model || '',
        serial: value.serial || '',
        purchase_date: purchase_data || value.purchase_date || '',
        master_service_partner: value.master_service_partner || '',
        child_service_partner: value.child_service_partner || '',
        additional_remarks: value.additional_remarks || '',
        specification: value.specification || '',
        salutation: value.salutation || '',
        created_by: created_by || '',
        classification: value.classification || '',
        priority: value.Priority || '',
        callType: value.callType || '',
        requested_by: value.requested_by || '',
        requested_email: value.requested_email || '',
        requested_mobile: value.requested_mobile || '',
        salutation: value.salutation || '',
        msp: value.msp || '',
        csp: value.csp || '',
        sales_partner: value.sales_partner || '',
        sales_partner2: value.sales_partner2 || '',
        mwhatsapp: String(checkboxes.mwhatsapp),
        awhatsapp: String(checkboxes.awhatsaap),
        ticket_id: String(ticketid)
      };



      if (validateForm()) {


        axiosInstance.post(`${Base_Url}/add_complaintt`, data, {
          headers: {
            Authorization: token, // Send token in headers
          },
        }
        )
          .then((res) => {
            if (res.data) {
              notify();
              setTimeout(() => {
                navigate('/complaintlist');
              }, 500);
            }
          })
          .catch(error => {
            console.error("Error submitting form:", error);
            toast.error('Error submitting data');
          });

      }

    }

  }



  const updatecomplaint = () => {


    const data = {
      complaint_date: value.complaint_date || "",
      customer_name: value.customer_name || "",
      contact_person: value.contact_person || "",
      email: value.email || "",
      mobile: value.mobile || "",
      alt_mobile: value.alt_mobile || "",
      address: value.address || "",
      state: value.state || "",
      city: value.city || "",
      area: value.area || "",
      pincode: value.pincode || "",
      mode_of_contact: value.mode_of_contact || "",
      ticket_type: value.ticket_type || "",
      cust_type: value.cust_type || "",
      warrenty_status: value.warrenty_status || "",
      invoice_date: value.invoice_date || "",
      call_charge: value.call_charge || "",
      cust_id: String(value.customer_id) || "", // Fix customer ID handling
      model: value.model || "",
      serial: String(value.serial),
      purchase_date: value.purchase_date || "",
      master_service_partner: value.master_service_partner || "",
      child_service_partner: value.child_service_partner || "",
      additional_remarks: value.additional_remarks || "",
      specification: value.specification || "",
      created_by: value.created_by || "",
      classification: value.classification || "",
      priority: value.Priority || "",
      callType: value.callType || "",
      requested_by: value.requested_by || "",
      requested_email: value.requested_email || "",
      requested_mobile: value.requested_mobile || "",
      sales_partner2: value.sales_partner2 || "",
      salutation: value.salutation || "",
      mwhatsapp: checkboxes.mwhatsapp || 0,
      awhatsapp: checkboxes.awhatsaap || 0,
      ticket_no: Comp_id
    };





    axiosInstance.post(`${Base_Url}/u_complaint`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data) {
          notify();

        }
      })
      .catch(error => {
        console.error("Error submitting form:", error);
        toast.error('Error submitting data');
      });
  }


  const fetchdistricts = async (geostateID) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getdistrictcity/${geostateID}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );
      setdistricts(response.data);
    } catch (error) {
      console.error("Error fetching disctricts:", error);
    }
  };

  const fetchCity = async (area_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getgeocities_p/${area_id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );
      setCity(response.data);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };

  const fetchPincodes = async (pin_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/citywise_pincode/${pin_id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setPincode(response.data);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };

  // Fix the onHandleChange function
  const onHandleChange = (e) => {
    const { name, value: inputValue } = e.target;


    setValue(prevState => ({
      ...prevState,
      [name]: inputValue
    }));

    switch (name) {
      case "master_service_partner":
        getChildPartner(inputValue);
        break;
      case "state":
        fetchdistricts(inputValue);
        break;
      case "area":
        fetchCity(inputValue);
        break;
      case "city":
        fetchPincodes(inputValue);
        break;
      case "pincode":
        fetchlocations(inputValue);
        setValue(prevState => ({
          ...prevState,
          city: "",
          state: "",
          area: ""
        }));
        break;
      case "serial":
        fetchserial(inputValue);
        setpurchase_data("");
        setValue(prevState => ({
          ...prevState,
          model: ""
        }));
        break;
      case "complaint_date":
        setDate(e.target.value);
        break;
    }



  };





  const fetchlocations = async (pincode) => {


    if ((pincode && pincode.length == 6) || value.pincode != undefined) {


      try {

        const response = await axiosInstance.get(
          `${Base_Url}/getmultiplelocation/${pincode || value.pincode}/${value.classification}`, {
          headers: {
            Authorization: token, // Send token in headers
          },
        }
        );

        if (response.data && response.data[0]) {


          setlocations({ franchiseem: response.data[0].mspname, childfranchiseem: response.data[0].cspname })

          setValue({
            ...value,
            state: response.data[0].state,
            city: response.data[0].city,
            area: response.data[0].district,
            pincode: response.data[0].pincode,
            master_service_partner: response.data[0].mspname,
            child_service_partner: response.data[0].cspname,
            csp: response.data[0].csp,
            msp: response.data[0].msp
          })

        }


      } catch (error) {
        console.error("Error fetching ticket details:", error);
      }
    }
  };





  const fetchserial = async (serial) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getserial/${serial || value.serial}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );

      setClassification(response.data[0].customerClassification)

      const purchase_date = response.data[0].purchase_date
      const date = new Date(purchase_date);
      // Format the date as YYYY-MM-DD
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      setpurchase_data(formattedDate)



      if (response.data && response.data[0]) {

        console.log("serial")
        const data = response.data[0];
        setValue({
          ...value,
          model: data.ModelNumber || "", // Default to an empty string if null/undefined
          serial: data.serial_no || "",
          sales_partner: data.SalesPartner || "",
          classification: data.customerClassification || "",
          salutation: data.salutation || "",
          customer_name: data.customer_fname || "",
          cust_type: data.customer_type || "",
          mobile: data.mobileno || "",
          alt_mobile: data.alt_mobileno || "",
          email: data.email || "",
          address: data.address || "",
          customer_id: data.CustomerID || "",
        });
      }


    } catch (error) {
      console.error("Error fetching serial details:", error);
    }
  };


  useEffect(() => {
    if (value.serial != undefined && !Comp_id && !classificationid) {
      fetchserial()

    }
  }, [value.serial])

  useEffect(() => {



    if (value.pincode != undefined && value.classification && !Comp_id) {

      fetchlocations()
    }


  }, [value.pincode, value.classification])





  const addnewticket = (product_id) => {

    setForm(true)
    const data = {
      customerId: searchdata.customer_id || '',
      customer_name: searchdata.customer_name || '',
      contact_person: searchdata.contact_person || '',
      email: searchdata.email || '',
      mobile: searchdata.mobile || '',
      cust_id: String(searchdata.id) || '',
      serial_no: String(searchdata.serial_no) || '',
      state: searchdata.state || '',
      city: searchdata.city || '',
      area: searchdata.area || '',
      pincode: searchdata.pincode || '',
      product_id: product_id
    }

    axiosInstance.post(`${Base_Url}/add_new_ticket`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    }
    )
      .then((res) => {
        setTicketid(res.data.id)
        setserialHide(res.data.rowdata[0].serial_no)
        setpurchseHide(res.data.rowdata[0].purchase_date)
        setadd_new_ticketdata(res.data.rowdata[0])
        setModelNumber(res.data.rowdata[0].ModelNumber)
        getDateAfterOneYear(res.data.rowdata[0].invoice_date)


      }).catch((err) => {
        console.log(err)
      })
  }


  const getcustomerinfo = (cust_id) => {


    setForm(true)
    const data = {
      cust_id: cust_id
    }

    axiosInstance.post(`${Base_Url}/getcustinfo`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data && res.data.length > 0) {

          const customerInfo = res.data[0];

          setValue((prevState) => ({
            ...prevState, // Spread existing state
            mobile: customerInfo.mobileno,
            cust_type: customerInfo.customer_type

          }));

        } else {
          console.error("No customer information found in response.");
        }
      })
  }

  useEffect(() => {
    setValue({
      model: add_new_ticketdata.ModelNumber,
      customer_name: add_new_ticketdata.customer_name,
      state: add_new_ticketdata.state,
      city: add_new_ticketdata.city,
      area: add_new_ticketdata.area,
      pincode: add_new_ticketdata.pincode,
      serial: add_new_ticketdata.serial_no
    })


  }, [add_new_ticketdata])

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
    pageid: String(42)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 





  return (
    <>
      {roleaccess > 1 ? < div className="p-3">
        {loaders && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SyncLoader loading={loaders} color="#FFFFFF" />
          </div>
        )}
        <div className="row ">
          <div className="complbread">
            <div className="row">
              <div className="col-md-3">
                {Comp_id ? < label className="breadMain">{Comp_id}</label> : < label className="breadMain">Register New Ticket</label>}
              </div>
            </div>
          </div>
        </div>
        <Toaster position="bottom-center"
          reverseOrder={false} />


        <div className="row mt-25">
          <div className="col-3">
            <div className="card mb-3">
              <div className="card-body">
                <div>
                  <p>Search by Ticket No. / Serial No. / Mobile No./ Customer Name / Customer Id / Email Id</p>
                  <div className="row g-3 align-items-center">
                    <div className="col-8">
                      <input
                        required
                        type="text"
                        name="searchtext"
                        id="searchtext"
                        className="form-control"
                        aria-describedby="passwordHelpInline"
                        value={serachval}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            searchResult(); // Trigger search when 'Enter' is pressed
                          }
                        }}
                        placeholder="Enter Mobile / Email / Customer Name"
                      />
                    </div>
                    <div className="col-4">
                      {roleaccess > 1 ? <button
                        id="inputSearch"
                        name="inputSearch"
                        type="submit"
                        className="btn btn-liebherr"
                        onClick={searchResult}
                      >
                        Search
                      </button> : null}
                    </div>
                  </div>
                </div>

              </div>
            </div>


            {hideticket ? <div id="searchResult" className="card">

              <div className="card-body">

                <div className="row">
                  <div className="col-md-12">
                    <p><strong>Customer Id :</strong> {searchdata.customer_id}</p>
                    <h4 className="pname">{searchdata.customer_name}</h4>
                  </div>
                </div>

                {/* Display addresses here */}
                {/* <p style={{fontSize: '12px'}}>{searchdata.address}</p> */}
                <div className="row">
                  <div className="col-md-12">

                    {addresses && addresses.length > 0 ? (
                      // Check if it's an array or a single object
                      Array.isArray(addresses) && addresses.length > 0 ? (
                        <p
                          key={addresses[0].id || 0}
                          style={{
                            fontSize: '12px',
                          }}
                        >
                          {addresses[0].address} , {addresses[0].pincode_id}
                        </p>
                      ) : (
                        <p
                          key="single-address"
                          style={{
                            fontSize: '12px',
                          }}
                        >
                          {addresses.address}
                        </p>
                      )
                    ) : (
                      <p style={{ fontSize: '12px' }}>No Address Available</p>
                    )}
                  </div>
                </div>


                <div className="row mb-3">
                  <div className="col-md-12">
                    <p><strong>Mobile :</strong> {searchdata.customer_mobile || searchdata.mobileno}</p>
                  </div>
                </div>

                {!form && ProductCustomer ? (
                  <>
                    <ul className="nav nav-tabs" id="myTab2" role="tablist">
                      <li className="nav-item">
                        <a className="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Products</a>

                      </li>
                    </ul>

                    <div className="tab-content mb-3">
                      <div className="tab-pane active" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        <table className="table table-striped">
                          <tbody>


                            <tr>
                              <td>New Product</td>
                              <td>
                                <div className="text-right pb-2">
                                  {roleaccess > 2 ? <button className="btn btn-sm btn-primary generateTicket" onClick={() => getcustomerinfo(searchdata.customer_id)}>New Ticket</button> : null}
                                </div>
                              </td>
                            </tr>

                            {ProductCustomer.map((item, index) => (
                              <tr key={index}>
                                <td><div>{item.ModelNumber}</div></td>
                                <td>
                                  <div className="text-right pb-2">
                                    {roleaccess > 2 ? <button onClick={() => addnewticket(item.ModelNumber)} className="btn btn-sm btn-primary generateTicket">New Ticket</button> : null}
                                  </div>
                                </td>
                              </tr>
                            ))}


                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : null}

                {searchdata.ticket_no ? <>
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item">
                      <a className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Previous Ticket</a>
                    </li>
                  </ul>

                  <div className="tab-content">
                    <div className="tab-pane active" id="home" role="tabpanel" aria-labelledby="home-tab">
                      <table className="table table-striped">
                        <tbody>
                          {duplicate.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <div style={{ fontSize: "14px" }}>{item.ticket_no}</div>
                                <span style={{ fontSize: "14px" }}>{formatDate(item.ticket_date)}</span>
                              </td>
                              <td style={{ fontSize: "14px" }}>{item.ModelNumber}</td>
                              <td>
                                <div style={{ fontSize: "14px" }}>{item.call_status}</div>
                                <span style={{ fontSize: "14px" }}><button
                                  className='btn'
                                  onClick={() => {
                                    navigate(`/complaintview/${item.id}`)
                                    addInTab(item.ticket_no, item.id)
                                    sendtoedit123(item.id)
                                  }}
                                  title="View Info"
                                  style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                >
                                  <FaEye />
                                </button></span>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                      </table>
                    </div>
                  </div>
                </> : null}



              </div>

            </div> : <div className="card">
              <div className="card-body">
                {/* Only show "No Result Found" if a search was performed and no results were found */}
                {hasSearched && searchdata.length === 0 && <p className="text-danger ">No Result Found</p>}
                <button onClick={() => setForm(true)} className="btn btn-sm btn-primary">New Ticket</button>
              </div>


            </div>}





          </div>
          {(Comp_id || form) && <>
            <div className="col-6">
              <div className="card" id="formInfo">
                <div className="card-body">
                  <div className="row">

                    <div className="col-md-3">
                      <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Serial No </p>

                      {!serialid ?
                        <div className="mb-3">
                          <input
                            type="text"
                            name="serial"
                            value={value.serial}
                            onChange={onHandleChange}
                            className="form-control"
                            placeholder="Enter.."
                            disabled={serialhide == '' ? false : true}
                          />
                          {errors.serial && <span style={{ fontSize: "12px" }} className="text-danger">{errors.serial}</span>}
                        </div> : <div>{value.serial}</div>}

                    </div>

                    <div className="col-md-3">
                      <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Model</p>

                      {!modelid ?

                        <div className="">
                          <input className="form-control" onChange={onHandleChange} value={value.model} name="model" disabled></input>
                          {errors.model && <span style={{ fontSize: "12px" }} className="text-danger">{errors.model}</span>}
                        </div> :
                        <div>{ModelNumber}</div>
                      }
                    </div>
                    {/* Add Purchase Date field */}
                    <div className="col-md-3">
                      <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Purchase Date</p>

                      {/* {!p_date ?
                        <div className="mb-3">
                          <input
                            type="date"
                            name="purchase_date"
                            onChange={(e) => {
                              onHandleChange(e);
                              getDateAfterOneYear(e.target.value);
                            }}
                            value={purchase_data}
                            max={new Date().toISOString().split("T")[0]} // Set the maximum selectable date to today
                            className="form-control"
                            disabled={purchasehide == '' ? false : true}
                          />
                          {errors.purchase_date && <span style={{ fontSize: "12px" }} className="text-danger">{errors.purchase_date}</span>}
                        </div> : <div>{purchase_data == (null || '') ? null : formatpurDate(purchase_data)}</div>} */}

                        {!p_date ? 
                        <div className="mb-3">
                        <DatePicker
                          selected={purchase_data}
                          onChange={(date) =>{
                            handleDateChange(date)
                            getDateAfterOneYear(date);
                           }}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="purchase_date"
                          aria-describedby="Anidate"
                          disabled={purchasehide == '' ? false : true}
                          maxDate={new Date().toISOString().split("T")[0]}
                        /> 
                           {errors.purchase_date && <span style={{ fontSize: "12px" }} className="text-danger">{errors.purchase_date}</span>}
                        </div>: <div>{purchase_data == (null || '') ? null : formatpurDate(purchase_data)}</div>}
                        


                    </div>

                    {/* Add Warranty Status field */}
                    <div className="col-md-3">
                      <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Warranty Status</p>
                      <div className="mb-3">
                        <select className="form-control" onChange={onHandleChange} value={warranty_status_data} name="warrenty_status" disabled={warranty_status_data == '' ? false : true}>
                          <option value="">Select Option</option>
                          <option value="WARRANTY">IN WARRANTY</option>
                          <option value="OUT OF WARRANTY">OUT OF WARRANTY</option>
                          <option value="NA">NA</option>
                        </select>
                        {errors.warrenty_status && <span style={{ fontSize: "12px" }} className="text-danger">{errors.warrenty_status}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <h3 className="mainheade">Ticket <span id="compaintno">:{ticketno} </span></h3>
                    </div>
                  </div>

                  <form className="row" onSubmit={handlesubmit}>

                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Ticket Type{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <select className="form-control" onChange={onHandleChange} disabled={Comp_id ? true : false} value={value.ticket_type} name="ticket_type">
                          <option value="">Select</option>
                          <option value="INSTALLATION">Installation</option>
                          <option value="BREAKDOWN">Breakdown</option>
                          <option value="VISIT">Visit</option>
                          <option value="HELPDESK">Helpdesk</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="DEMO">Demo</option>
                        </select>
                        {errors.ticket_type && <span style={{ fontSize: "12px" }} className="text-danger">{errors.ticket_type}</span>}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Ticket Date{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        {/* <input type="date" name="complaint_date" onChange={onHandleChange} value={value.complaint_date || new Date().toISOString().split('T')[0]} className="form-control" disabled={Comp_id ? true : false} min={new Date().toISOString().split('T')[0]} /> */}

                        <DatePicker
                          selected={value.complaint_date || new Date().toISOString().split('T')[0]}
                          onChange={handleDateChange2}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="complaint_date"
                          aria-describedby="Anidate"
                          disabled={Comp_id ? true : false}
                          minDate={new Date().toISOString().split('T')[0]}
                        />

                        {errors.complaint_date && <span style={{ fontSize: "12px" }} className="text-danger">{errors.complaint_date}</span>}
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="mb-3">
                        <label className="form-label">Salutation{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <select className="form-control" onChange={onHandleChange} value={value.salutation} name="salutation">
                          <option value="">Salutation</option>
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Miss">Miss</option>
                          <option value="M.">M.</option>
                          <option value="Lhi">Lhi</option>
                          <option value="Dl">Dl</option>
                        </select>
                        {errors.salutation && <span style={{ fontSize: "12px" }} className="text-danger">{errors.salutation}</span>}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Customer Name{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <input type="text" name="customer_name" onChange={onHandleChange} value={value.customer_name} className="form-control" placeholder="Enter Customer Name" />
                        {errors.customer_name && <span style={{ fontSize: "12px" }} className="text-danger">{errors.customer_name}</span>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Contact Person{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <input type="text" className="form-control" name="contact_person" value={value.contact_person} onChange={onHandleChange} placeholder="Enter Contact Person Name" />
                        {errors.contact_person && <span style={{ fontSize: "12px" }} className="text-danger">{errors.contact_person}</span>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Email Id</label>
                        <input type="email" value={value.email} name="email" onChange={onHandleChange} className="form-control" placeholder="Enter Email Id" />
                        {errors.email && <span style={{ fontSize: "12px" }} className="text-danger">{errors.email}</span>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Mobile No. {value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}<input type="checkbox" name='mwhatsapp' onChange={oncheckchange} checked={checkboxes.mwhatsapp === 1} />Whatsapp</label>
                        <input type="number" onKeyDown={handleKeyDown} value={value.mobile} name="mobile" onChange={(e) => {
                          if (e.target.value.length <= 10) {
                            onHandleChange(e);
                          }
                        }} className="form-control" placeholder="Enter Mobile" />
                        {errors.mobile && <span style={{ fontSize: "12px" }} className="text-danger">{errors.mobile}</span>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Alt. Mobile No. <input type="checkbox" name="awhatsaap" onChange={oncheckchange} checked={checkboxes.awhatsaap === 1} />Whatsapp</label>
                        <input type="number" onKeyDown={handleKeyDown} className="form-control" value={value.alt_mobile} name="alt_mobile" onChange={(e) => {
                          if (e.target.value.length <= 10) {
                            onHandleChange(e);
                          }
                        }} placeholder="Enter Mobile" />
                        {errors.alt_mobile && <span style={{ fontSize: "12px" }} className="text-danger">{errors.alt_mobile}</span>}
                      </div>
                    </div>

                    {/* <div className="col-md-12">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Address</label>
                                            <textarea className="form-control" value={value.address} name="address" onChange={onHandleChange} placeholder="Enter Address">Customer Address</textarea>
                                        </div>
                                    </div> */}
                    <>
                      <style>
                        {`
        .popup {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .popup-content {
            background: rgb(240, 240, 240);
            padding: 20px;
            border-radius: 10px;
            width: 600px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        h3 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #007bff;
            text-align: center;
        }

        select, textarea {
            width: 100%;
            height: 45px;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid black; /* Changed border color to black */
            border-radius: 5px;
            background: white;
            color: #555;
            font-size: 16px;
        }

        button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #0056b3;
        }

        .addressbtn {
            background: none;
            color: #222;
            border: none;
            padding: 0;
            font-size: 13px;
            margin-top: 5px !important;
            text-align: right;
            position: absolute;
            right: 20px;
        }

        .addressbtn:hover {
            color:blue;
            background:none;

        }
    `}
                      </style>

                      <div className="col-md-12">
                        <div className="mb-3">
                          <label htmlFor="exampleFormControlInput1" className="form-label">Address {value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                          <button onClick={openPopup} type="button" className="addressbtn">Add Address</button>
                          <textarea
                            className="form-control"
                            value={value.address}
                            name="address"
                            onChange={handleAddressChange}
                            placeholder="Enter Address"
                          ></textarea>
                          {errors.address && <span style={{ fontSize: "12px" }} className="text-danger">{errors.address}</span>}

                        </div>
                      </div>

                      {isPopupOpen && (
                        <div className="popup">
                          <div className="popup-content">
                            <h3>Change Address</h3>
                            <select id="existingAddress" onChange={handleExistingAddressChange} value={selectedAddress}>
                              <option value="">Select Existing Address</option>
                              {addresses.map((addressItem) => (
                                <option key={addressItem.id} value={addressItem.address}>
                                  {addressItem.address}
                                </option>
                              ))}
                            </select>
                            <h3>Add New Address</h3>
                            <textarea
                              className="form-control"
                              value={newAddress}
                              onChange={(e) => {
                                setNewAddress(e.target.value); // Update new address in state
                                // onhashchange(e);
                              }}
                              placeholder="Enter New Address"
                            />
                            <button onClick={handleNewAddressSubmit} className="btn btn-primary mt-2" type="button">Add</button>
                            <button onClick={closePopup} className="btn btn-secondary mt-2" type="button" style={{ marginLeft: '10px' }}>Close</button>
                          </div>
                        </div>
                      )}
                    </>

                    {!duplicate ? <>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">Pincode{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                          <select className="form-control" value={value.pincode} name="pincode" onChange={onHandleChange}>
                            <option value="">Select Pincode</option>
                            {pincode.map((item) => {
                              return (
                                <option value={item.id} key={item.id}>{item.pincode}</option>
                              );
                            })}
                          </select>
                          {errors.pincode && <span style={{ fontSize: "12px" }} className="text-danger">{errors.pincode}</span>}
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <select className="form-control" value={value.state} name="state" onChange={onHandleChange}>
                            <option value="">Select State</option>
                            {state.map((item) => {
                              return (

                                <option value={item.id}>{item.title}</option>
                              )
                            })}
                          </select>
                          {errors.state && <span style={{ fontSize: "12px" }} className="text-danger">{errors.state}</span>}
                        </div>
                      </div>


                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">District</label>
                          <select className="form-control" onChange={onHandleChange} name="area" value={value.area}>
                            <option value="">Select Area</option>
                            {area.map((item) => {
                              return (
                                <option value={item.id} key={item.id}>{item.title}</option>
                              );
                            })}
                          </select>
                          {errors.area && <span style={{ fontSize: "12px" }} className="text-danger">{errors.area}</span>}
                        </div>
                      </div>

                      {/* city */}
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <select className="form-control" value={value.city} name="city" onChange={onHandleChange}>
                            <option value="">Select City</option>
                            {city.map((item) => {
                              return (
                                <option value={item.id} key={item.id}>{item.title}</option>
                              );
                            })}
                          </select>
                          {errors.city && <span style={{ fontSize: "12px" }} className="text-danger">{errors.city}</span>}
                        </div>
                      </div>

                    </> : <>

                      <div className="col-md-3">
                        <div className="mb-3">
                          <label htmlFor="exampleFormControlInput1" className="form-label">Pincode {value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                          <input type="number" className="form-control" value={value.pincode} name="pincode" onChange={onHandleChange} placeholder="" />
                          {errors.pincode && <span style={{ fontSize: "12px" }} className="text-danger">{errors.pincode}</span>}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label htmlFor="exampleFormControlInput1" className="form-label">State</label>
                          <input type="text" className="form-control" value={value.state} name="state" onChange={onHandleChange} placeholder="" disabled />
                          {errors.state && <span style={{ fontSize: "12px" }} className="text-danger">{errors.state}</span>}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label htmlFor="exampleFormControlInput1" className="form-label">District</label>
                          <input type="text" className="form-control" value={value.area} name="area" onChange={onHandleChange} placeholder="" disabled />
                          {errors.area && <span style={{ fontSize: "12px" }} className="text-danger">{errors.area}</span>}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label htmlFor="exampleFormControlInput1" className="form-label">City</label>
                          <input type="text" className="form-control" value={value.city} name="city" onChange={onHandleChange} placeholder="" disabled />
                          {errors.city && <span style={{ fontSize: "12px" }} className="text-danger">{errors.city}</span>}
                        </div>
                      </div>

                    </>}

                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Requested by </label>
                        <input type="text" className="form-control" value={value.requested_by} name="requested_by" onChange={onHandleChange} placeholder="" />
                        {errors.requested_by && <span style={{ fontSize: "12px" }} className="text-danger">{errors.requested_by}</span>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Requested Email </label>
                        <input type="email" className="form-control" value={value.requested_email} name="requested_email" onChange={onHandleChange} placeholder="" />
                        {errors.requested_email && <span style={{ fontSize: "12px" }} className="text-danger">{errors.requested_email}</span>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Requested Mobile </label>
                        <input type="number" className="form-control" value={value.requested_mobile} name="requested_mobile" onKeyDown={handleKeyDown} onChange={(e) => {
                          if (e.target.value.length <= 10) {
                            onHandleChange(e);
                          }
                        }} placeholder="" />
                        {errors.requested_mobile && <span style={{ fontSize: "12px" }} className="text-danger">{errors.requested_mobile}</span>}
                      </div>
                    </div>




                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Mode of Contact{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <select className="form-control" onChange={onHandleChange} value={value.mode_of_contact} name="mode_of_contact">
                          <option value="">Select</option>
                          <option value="Call">Call</option>
                          <option value="SMS">SMS</option>
                          <option value="Email">Email</option>
                          <option value="In Person">In Person</option>
                        </select>
                        {errors.mode_of_contact && <span style={{ fontSize: "12px" }} className="text-danger">{errors.mode_of_contact}</span>}
                      </div>
                    </div>


                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Customer Type{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <select className="form-control" onChange={onHandleChange} value={value.cust_type} name="cust_type">
                          <option value="">Select </option>
                          <option value="END CUSTOMER">END CUSTOMER</option>
                          <option value="DISPLAY/EVENT">DISPLAY / EVENTS</option>
                        </select>
                        {errors.cust_type && <span style={{ fontSize: "12px" }} className="text-danger">{errors.cust_type}</span>}
                      </div>
                    </div>
                    {/* <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Warrenty Status</label>
                                            <select className="form-control" onChange={onHandleChange} value={value.warrenty_status} name="warrenty_status">
                                                <option value="">Select </option>
                                                <option value="WARRANTY">Yes</option>
                                                <option value="OUT OF WARRANTY">No</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Invoice Date</label>
                                            <input type="date" className="form-control" onChange={onHandleChange} value={value.invoice_date} name="invoice_date" placeholder="" />
                                        </div>
                                    </div>*/}
                    <input type="hidden" onChange={onHandleChange} value={value.invoice_date} name="invoice_date"></input>



                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Call Chargeable{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <select className="form-control" onChange={onHandleChange} value={value.call_charge} name="call_charge">
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.call_charge && <span style={{ fontSize: "12px" }} className="text-danger">{errors.call_charge}</span>}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Customer Classification{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <select className="form-control" onChange={onHandleChange} value={value.classification} name="classification" disabled={value.serial == undefined || value.serial == '' ? false : true}>
                          <option value="">Select</option>
                          <option value="Consumer">Consumer</option>
                          <option value="Import">Import</option>
                        </select>
                        {errors.classification && <span style={{ fontSize: "12px" }} className="text-danger">{errors.classification}</span>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Priority{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</label>
                        <select className="form-control" onChange={onHandleChange} value={value.Priority || "REGULAR"} name="Priority">
                          <option value="">Select</option>
                          <option value="REGULAR">Regular</option>
                          <option value="HIGH">High</option>
                        </select>
                        {errors.Priority && <span style={{ fontSize: "12px" }} className="text-danger">{errors.Priority}</span>}
                      </div>
                    </div>



                    <div className="col-md-12">
                      {Comp_id ? <button style={{ float: "right" }} type="button" disabled={roleaccess > 3 ? false : true} onClick={() => updatecomplaint()} className="btn btn-liebherr">Submit</button>
                        : <button style={{ float: "right" }} className="btn btn-liebherr" disabled={roleaccess > 2 ? false : true}>Submit</button>}
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-3">

              <>
                <div className="card mb-3" id="productInfo">
                  <div className="card-body">

                    <h4 className="pname">Master Service Partner</h4>
                    <p>{locations.franchiseem}</p>


                    <h4 className="pname">Child Service Partner</h4>
                    <p>{locations.childfranchiseem}</p>

                  </div>
                </div>

                <div className="card mb-3" id="engineerInfo">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <h4 className="pname">Primary Dealer : </h4>
                      </div>
                    </div>

                    <div className="mb-3">
                      <input type="text" className="form-control" name="sub_dealer" value={value.sales_partner} onChange={onHandleChange} placeholder="Primary Dealer" disabled />
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <h4 className="pname">Secondary Dealer : </h4>
                      </div>
                    </div>

                    <div className="mb-3">
                      <input type="text" className="form-control" name="sales_partner2" value={value.sales_partner2} onChange={onHandleChange} placeholder="Secondary Dealer" />
                    </div>
                  </div>
                </div>


                <div className="card mb-3" id="engineerInfo">
                  <div className="card-body">
                    <h4 className="pname">Fault Description{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? null : <span className="text-danger">*</span>}</h4>
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        name="specification"
                        value={value.specification}
                        onChange={onHandleChange}
                        placeholder="Enter Fault Description..."
                      ></textarea>
                      {errors.specification && <span style={{ fontSize: "12px" }} className="text-danger">{errors.specification}</span>}
                    </div>
                  </div>
                </div>

                <div className="card mb-3" id="engineerInfo">
                  <div className="card-body">
                    <h4 className="pname">Additional Info{value.ticket_type == 'VISIT' || value.ticket_type == 'HELPDESK' ? <span className="text-danger">*</span> : null}</h4>
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        name="additional_remarks"
                        value={value.additional_remarks}
                        onChange={onHandleChange}
                        placeholder="Enter additional info..."
                      ></textarea>
                      {errors.additional_remarks && <span style={{ fontSize: "12px" }} className="text-danger">{errors.additional_remarks}</span>}
                    </div>
                  </div>
                </div>

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
                        ref={fileInputRef} // Attach the ref to the input
                      />
                    </div>
                    <div className="d-flex justify-content-end mb-3">
                      {roleaccess > 2 ? <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAttachment2Submit}
                        style={{ fontSize: "14px" }}
                      >
                        Upload
                      </button> : null}

                    </div>


                  </div>
                </div>


              </>

            </div>
          </>
          }




        </div>



      </div> : null}

    </>
  )
}
