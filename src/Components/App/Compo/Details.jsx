import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import { Base_Url } from '../../Utils/Base_Url';
import { Complaintview } from '../../Pages/Complaint/Complaintview';
import DatePicker from 'react-datepicker';

function Details() {
  const navigate = useNavigate();
  const [done, setdone] = useState(true)
  const [data, setdata] = useState([])
  const [spare, setspare] = useState(false);
  const [sparelist, setSparelist] = useState([])
  const [sparedata, setsparedata] = useState([]);
  const [symptomsode, setsymptomsode] = useState([])
  const [causecode, setcausecode] = useState([])
  const [actioncode, setactioncode] = useState([])
  const [subcatcode, setsubcatcode] = useState([])
  const [calltype, setcalltype] = useState([])
  const [spareadd, setspareadd] = useState(true)
  const [GroupDefectsite, setGroupDefectsite] = useState([]);
  const [callstatus, setcallstatus] = useState([])
  const [remark, setremark] = useState([])
  const { id } = useParams();
  const [activity, setactivity] = useState([]);
  const [otppart, setotppart] = useState(true);
  const [iscomplate, setIscomplate] = useState(false)
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [otp, setotp] = useState([]);
  const [serial_no, setserial] = useState('');
  const [purchase_date, setPurchaseDate] = useState('');
  const [allocation, setallocation] = useState('');
  const [item_code, setItemcode] = useState('');
  const [modelno, setModelNumber] = useState('');
  const [errors, setErrors] = useState({})
  const [files, setFiles] = useState({
    spare_doc: null,
    spare_doc_two: null,
    spare_doc_three: null,
  });


  const [checklist, setChecklist] = useState({
    picking_damages: "No",
    product_damages: "No",
    missing_part: "No",
    leg_adjustment: "No",
    water_connection: "No",
    abnormal_noise: "No",
    ventilation_top: "No",
    ventilation_bottom: "No",
    ventilation_back: "No",
    voltage_supply: "No",
    earthing: "No",
    gas_charges: 'No',
    transpotation: "No"
  });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles((prevState) => ({
      ...prevState,
      [name]: files[0], // Store the first selected file
    }));
  };

  const [Value, setValue] = useState({
    com_id: id,
    symptomcode: '',
    causecode: '',
    actioncode: '',
    activity_code: '',
    spare: '',
    other_charge: '',
    service_charges: '',
    warranty_status: '',
    call_type: '',
    site_defect: '',
    otps: '',
    otps_error: '',
    call_status: '',
    serial_no: '',
    ModelNumber: '',
    call_remark: '',
    spare_qty: '',
    purchase_date: '',
    check_remark: '',
    customer_mobile: '',
    item_code: '',
    ticketno: ''
  })






  const handleChange = (e) => {
    setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }))


    if (e.target.name == 'spare_required') {
      setspare(e.target.checked)
    }

    if (e.target.name == 'symptomcode') {
      getDefectCodewisetype_app(e.target.value)
      getDefectCodewisesite_app(e.target.value)
    }



  }

  const resendotp = () => {

    const data = {
      ticket_no : Value.ticketno,
      customer_mobile : Value.customer_mobile
    }


    axios.post(`${Base_Url}/resend_otp`, data, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        console.log(res);
        alert("OTP sent")
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleCheckChange = (e) => {
    const { name, checked } = e.target;
    setChecklist((prevState) => ({
      ...prevState,
      [name]: checked ? "Yes" : "No",
    }));
  };


  async function getprice(modelno, warrenty_status) {

    axios.post(`${Base_Url}/getServiceCharges`, { ModelNumber: modelno, warrenty_status: warrenty_status }, {
      headers: {
        Authorization: token
      }
    })
      .then((res) => {
        console.log(res.data)

        if (res.data && res.data[0]) {
          setValue((prev) => ({
            ...prev,
            service_charges: res.data[0].warranty_amount
          }))
        }


      })
  }




  async function getactivity() {
    try {
      const res = await axios.get(`${Base_Url}/getactivity_app`, {
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

  const handleRemoveSparePart = (id) => {

    const confirm = window.confirm("Are you sure?")

    if (confirm) {
      axios.post(`${Base_Url}/removeappsparepart`, { spare_id: id }, {
        headers: {
          Authorization: token, // Send token in headers
        },
      })
        .then((res) => {

          getuniquespare(data.ticket_no)

        })
    }



  };



  const validateForm = () => {

    let isValid = true;
    const newErrors = { ...errors };


    if (!Value.call_remark) {
      isValid = false;
      newErrors.call_remark = "Remark is required";
    }



    if (Value.call_status == "Spares") {
      if (sparelist.length <= 0) {
        isValid = false;
        newErrors.spare = "Add Spares";
      }

    }

    if (!serial_no && !data.serial_no) {
      isValid = false;
      newErrors.serial_no = "Serial No is required";
    }




    // // Additional validations only when call_status is 'Completed'
    if (Value.call_status == "Completed") {


      if (!Value.activity_code || Value.activity_code == 'null') {
        isValid = false;
        newErrors.activity_code = "Activity is required";
      }
      if (!Value.otps) {
        isValid = false;
        newErrors.otps = "OTP is required";
      }
      if (!Value.causecode || Value.causecode == 'null') {
        isValid = false;
        newErrors.causecode = "Defect code is required";
      }
      if (!Value.symptomcode || Value.symptomcode == 'null') {
        isValid = false;
        newErrors.symptomcode = "Defect group is required";
      }
      if (!Value.actioncode || Value.actioncode == 'null') {
        isValid = false;
        newErrors.actioncode = "Action code is required";
      }



    }


    setErrors(newErrors);
    setTimeout(() => {
      setErrors("");
    }, 15000);



    return isValid;
  };





  const handleSubmit = (e) => {
    e.preventDefault();


    if (validateForm()) {

      if (Value.call_status == 'Completed') {
        if (Value.otps == data.totp) {

          const formData = new FormData();

          formData.append('otp', Value.otps);
          formData.append('symptomcode', Value.symptomcode);
          formData.append('causecode', Value.causecode);
          formData.append('actioncode', Value.actioncode);
          formData.append('activitycode', Value.activity_code);
          formData.append('service_charges', Value.service_charges);
          formData.append('call_status', Value.call_status);
          formData.append('call_type', Value.call_type);
          formData.append('other_charge', Value.other_charge);
          formData.append('warranty_status', Value.warranty_status);
          formData.append('com_id', data.id);
          formData.append('call_remark', Value.call_remark);
          formData.append('check_remark', Value.check_remark);
          formData.append('purchase_date', Value.purchase_date && formatpurchasedate(Value.purchase_date));
          formData.append('ticket_no', data.ticket_no);
          formData.append('allocation', allocation);
          formData.append('item_code', item_code);
          formData.append('Model', modelno || data.ModelNumber);
          formData.append('serial_no', serial_no || data.serial_no);
          formData.append('user_id', localStorage.getItem('userid'));
          formData.append('serial_data', JSON.stringify(data));
          formData.append('picking_damages', checklist.picking_damages == 'null' ? 'No' : checklist.picking_damages);
          formData.append('product_damages', checklist.product_damages == 'null' ? 'No' : checklist.product_damages);
          formData.append('missing_part', checklist.missing_part == 'null' ? 'No' : checklist.missing_part);
          formData.append('leg_adjustment', checklist.leg_adjustment == 'null' ? 'No' : checklist.leg_adjustment);
          formData.append('water_connection', checklist.water_connection == 'null' ? 'No' : checklist.water_connection);
          formData.append('abnormal_noise', checklist.abnormal_noise == 'null' ? 'No' : checklist.abnormal_noise);
          formData.append('ventilation_top', checklist.ventilation_top == 'null' ? 'No' : checklist.ventilation_top);
          formData.append('ventilation_bottom', checklist.ventilation_bottom == 'null' ? 'No' : checklist.ventilation_bottom);
          formData.append('ventilation_back', checklist.ventilation_back == 'null' ? 'No' : checklist.ventilation_back);
          formData.append('voltage_supply', checklist.voltage_supply == 'null' ? 'No' : checklist.voltage_supply);
          formData.append('earthing', checklist.earthing == 'null' ? 'No' : checklist.earthing);
          formData.append('gas_charges', checklist.gas_charges == 'null' ? 'No' : checklist.gas_charges);
          formData.append('transpotation', checklist.transpotation == 'null' ? 'No' : checklist.transpotation);
          formData.append('customer_mobile', Value.customer_mobile);
          sparelist.forEach((item, index) => {
            formData.append(`sparedata[${index}]`, item.article_code);
            formData.append(`spareqty[${index}]`, item.quantity);
          });
          



          if (Value.spare_required) {
            formData.append('spare_detail', Value.spare_detail);
          }
          // Append the file if it exists


          if (files.spare_doc) {
            formData.append('spare_doc', files.spare_doc);
          }

          if (files.spare_doc_two) {
            formData.append('spare_doc_two', files.spare_doc_two);
          }

          if (files.spare_doc_three) {
            formData.append('spare_doc_three', files.spare_doc_three);
          }



          axios.post(`${Base_Url}/updatecomplaint`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          })
            .then((res) => {
              if(res.data.status == 0){
                alert(res.data.message)
              }else{
                navigate('/mobapp/dash');
                
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          alert("Wrong Otp")

        }

      } else {
        const formData = new FormData();

        formData.append('otp', Value.otps);
        formData.append('symptomcode', Value.symptomcode);
        formData.append('causecode', Value.causecode);
        formData.append('actioncode', Value.actioncode);
        formData.append('activitycode', Value.activity_code);
        formData.append('service_charges', Value.service_charges);
        formData.append('call_status', Value.call_status);
        formData.append('call_type', Value.call_type);
        formData.append('other_charge', Value.other_charge);
        formData.append('warranty_status', Value.warranty_status);
        formData.append('purchase_date', Value.purchase_date && formatpurchasedate(Value.purchase_date));
        formData.append('com_id', data.id);
        formData.append('call_remark', Value.call_remark);
        formData.append('check_remark', Value.check_remark);
        formData.append('ticket_no', data.ticket_no);
        formData.append('allocation', allocation);
        formData.append('item_code', item_code);
        formData.append('Model', modelno || data.ModelNumber);
        formData.append('serial_no', serial_no || data.serial_no);
        formData.append('user_id', localStorage.getItem('userid'));
        formData.append('serial_data', JSON.stringify(data));
        formData.append('picking_damages', checklist.picking_damages == 'null' ? 'No' : checklist.picking_damages);
        formData.append('product_damages', checklist.product_damages == 'null' ? 'No' : checklist.product_damages);
        formData.append('missing_part', checklist.missing_part == 'null' ? 'No' : checklist.missing_part);
        formData.append('leg_adjustment', checklist.leg_adjustment == 'null' ? 'No' : checklist.leg_adjustment);
        formData.append('water_connection', checklist.water_connection == 'null' ? 'No' : checklist.water_connection);
        formData.append('abnormal_noise', checklist.abnormal_noise == 'null' ? 'No' : checklist.abnormal_noise);
        formData.append('ventilation_top', checklist.ventilation_top == 'null' ? 'No' : checklist.ventilation_top);
        formData.append('ventilation_bottom', checklist.ventilation_bottom == 'null' ? 'No' : checklist.ventilation_bottom);
        formData.append('ventilation_back', checklist.ventilation_back == 'null' ? 'No' : checklist.ventilation_back);
        formData.append('voltage_supply', checklist.voltage_supply == 'null' ? 'No' : checklist.voltage_supply);
        formData.append('earthing', checklist.earthing == 'null' ? 'No' : checklist.earthing);
        formData.append('gas_charges', checklist.gas_charges == 'null' ? 'No' : checklist.gas_charges);
        formData.append('transpotation', checklist.transpotation == 'null' ? 'No' : checklist.transpotation);

        if (Value.spare_required) {
          formData.append('spare_detail', Value.spare_detail);
        }

        if (files.spare_doc) {
          formData.append('spare_doc', files.spare_doc);
        }

        if (files.spare_doc_two) {
          formData.append('spare_doc_two', files.spare_doc_two);
        }

        if (files.spare_doc_three) {
          formData.append('spare_doc_three', files.spare_doc_three);
        }



        axios.post(`${Base_Url}/updatecomplaint`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        })
          .then((res) => {
            console.log(res);
            navigate('/mobapp/dash');
          })
          .catch((err) => {
            console.log(err);
          });
      }




    } else {
      alert("Please fill required feilds")
    }




  }


  async function getcomplaintdetails() {
    axios.get(`${Base_Url}/getcomplaintdetails?cid=${id}`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {

          setdata(res.data.data[0])
          getremark(res.data.data[0].ticket_no)
          getuniquespare(res.data.data[0].ticket_no)
          getspare(res.data.data[0].item_code)
          getprice(res.data.data[0].ModelNumber, res.data.data[0].warranty_status)
          setPurchaseDate(res.data.data[0].purchase_date)
          setItemcode(res.data.data[0].item_code)
          // console.log(Value.symptomcode);
          if (res.data.data[0].group_code != "") {
            getDefectCodewisetype_app(res.data.data[0].group_code)
            getDefectCodewisesite_app(res.data.data[0].group_code)
          }

          setValue({
            symptomcode: res.data.data[0].group_code,
            causecode: res.data.data[0].defect_type,
            actioncode: res.data.data[0].site_defect,
            activity_code: res.data.data[0].activity_code,
            call_type: res.data.data[0].ticket_type,
            warranty_status: res.data.data[0].warranty_status,
            call_status: res.data.data[0].call_status,
            purchase_date: res.data.data[0].purchase_date,
            customer_mobile: res.data.data[0].customer_mobile,
            ticketno : res.data.data[0].ticket_no
          })


          setChecklist({
            picking_damages: res.data.data[0].picking_damages,
            product_damages: res.data.data[0].product_damages,
            missing_part: res.data.data[0].missing_part,
            leg_adjustment: res.data.data[0].leg_adjustment,
            water_connection: res.data.data[0].water_connection,
            abnormal_noise: res.data.data[0].abnormal_noise,
            ventilation_top: res.data.data[0].ventilation_top,
            ventilation_bottom: res.data.data[0].ventilation_bottom,
            ventilation_back: res.data.data[0].ventilation_back,
            voltage_supply: res.data.data[0].voltage_supply,
            earthing: res.data.data[0].earthing,
            gas_charges: res.data.data[0].gascheck,
            transpotation: res.data.data[0].transportcheck
          })


          getsparelistapp(res.data.data[0].ticket_no)

          console.log(res.data.data[0].call_status);

          if (res.data.data[0].call_status === 'Completed') {
            setdone(false)
            setIscomplate(true)
          } else {
            setIscomplate(false)
            if (res.data.data[0].totp != null) {
              setotp(res.data.data[0].totp)
              setotppart(false)
            }
          }

        }
      })
      .catch((err) => {
        console.log(err)

      })

  }
  async function getremark(id) {
    axios.get(`${Base_Url}/getremark?cid=${id}`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          setremark(res.data.data[0])

        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  async function getsitecode(params) {


    if (params) {

      try {
        const res = await axios.post(`${Base_Url}/appgetDefectCodewisetype`, { defect_code: params }, {
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
        const res = await axios.get(`${Base_Url}/getsite`);



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




  async function addspare() {
    const eata = {
      ticket_no: data.ticket_no,
      ItemDescription: sparedata[Value.spare].article_description,
      title: sparedata[Value.spare].article_code,
      product_code: sparedata[Value.spare].spareId,
      spare_qty: Value.spare_qty,
      price: sparedata[Value.spare].price
    }
    // console.log(data);

    axios.post(`${Base_Url}/addspareapp`, eata, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        console.log(res.data.message);

        getuniquespare(data.ticket_no)

        setspareadd(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  async function getuniquespare(ticket_no) {
    const eata = {
      ticket_no: ticket_no,
    }
    // console.log(data);4

    axios.post(`${Base_Url}/getuniquesparelist`, eata, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {

        setSparelist(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }



  async function subcat() {
    axios.get(`${Base_Url}/awt_subcat`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          setsubcatcode(res.data.data)

        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  async function CallStatus() {
    axios.get(`${Base_Url}/CallStatus`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          setcallstatus(res.data.data)

        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  async function CallType() {
    axios.get(`${Base_Url}/CallType`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          setcalltype(res.data.data)

        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  async function getcom_app() {
    axios.get(`${Base_Url}/getcom_app`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          setsymptomsode(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  async function getDefectCodewisetype_app(data) {

    axios.post(`${Base_Url}/getDefectCodewisetype_app12`, { defect_code: data }, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          setcausecode(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  async function getDefectCodewisesite_app(data) {

    axios.post(`${Base_Url}/getDefectCodewisesite_app`, { defect_code: data }, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          setactioncode(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  async function getspare(data) {
    axios.get(`${Base_Url}/getSpareParts_app/${data}`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          // setactioncode(res.data)
          setsparedata(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  async function getsparelistapp(ticket) {

    axios.post(`${Base_Url}/getsparelistapp`, { ticket: ticket }, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data != 0) {
          console.log(res.data);
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }


  useEffect(() => {
    getactivity()
    getcomplaintdetails()
    CallStatus()
    subcat()
    CallType()
    getcom_app()

  }, [])








  const formatDate1 = (dateString) => {
    if (!dateString) {
      return dateString; // Return an empty string or a placeholder if dateString is undefined or null
    }

    const date = new Date(dateString.split(" ")[0]);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const formatpurchasedate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };




  const handlegetmodel = async (value) => {

    setserial(value)


    try {
      const response = await axios.get(
        `${Base_Url}/getmobserial/${value || value.serial_no}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );



      if (!response.data || response.data.length === 0) {
        alert("This serial does not exist.");
        setserial(''); // Resetting serial number to 0
        setModelNumber(''); // Clearing the model number
        return;
      }

      if (response.data && response.data[0] && response.data[0].ModelNumber) {



        if (response.data[0].customer_id == 'null' || response.data[0].customer_id == null) {
          alert("New serial no")
          getspare(response.data[0].ItemNumber)
          getprice(response.data[0].ModelNumber)
          setModelNumber(response.data[0].ModelNumber)
          setallocation(response.data[0].allocation)
          setItemcode(response.data[0].ItemNumber)
        }
        else if (response.data[0].customer_id == data.customer_id) {
          alert("Serial no matched")
          getspare(response.data[0].ItemNumber)
          getprice(response.data[0].ModelNumber)
          setModelNumber(response.data[0].ModelNumber)
          setItemcode(response.data[0].ItemNumber)
        }
        else {
          setserial('')
          setModelNumber('')
          alert("This serial no already allocated")
        }

      }



      if ((response.data && response.data[0] && response.data[0].customer_classification == 'null') || (response.data && response.data[0] && response.data[0].customer_classification == null)) {
        console.log("Classification not found")
      }
      else if (response.data && response.data[0] && response.data[0].customer_classification == data.customer_class) {

        console.log("Matched")

      } else {
        alert("Classification is different")
        setserial('')
        setsparedata('')
        setModelNumber('')
      }




    } catch (error) {
      console.error("Error fetching serial details:", error);
    }
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
        setValue((prev) => ({
          ...prev,
          warranty_status: "OUT OF WARRANTY",
          purchase_date: value
        }))



        axios.post(`${Base_Url}/updatewarrentystate`, { warrenty: 'OUT OF WARRANTY', ticket_no: String(data.id) }, {
          headers: {
            Authorization: token
          }
        })
          .then((res) => {
            if (res.data && res.data[0].warranty_status) {
              setValue((prev) => ({
                ...prev,
                warranty_status: res.data[0].warranty_status
              }))
            }
          })
      } else {

        setValue((prev) => ({
          ...prev,
          purchase_date: value,
          warranty_status: "WARRANTY"
        }))


        axios.post(`${Base_Url}/updatewarrentystate`, { warrenty: 'WARRANTY', ticket_no: String(data.id) }, {
          headers: {
            Authorization: token
          }
        })
          .then((res) => {
            if (res.data && res.data[0].warranty_status) {
              setValue((prev) => ({
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



  return (
    <>
      <Header />

      <main class="container mt-5 pt-3">
        <div className='d-flex mt-2 justify-content-between bg-light rounded p-2' >
          <h3 class="headh4 m-2 "><a href="/mobapp/dash">Back</a></h3>
          <h3 class="headh4 m-2 "><a href={`/mobapp/history/${data.customer_id}`}>History</a></h3>
        </div>


        <form onSubmit={handleSubmit}>
          <div class="row mt-4">

            <div className="col-12">
              <div
                className="bg-white  p-4 rounded shadow-sm border"
                style={{ maxWidth: "600px", margin: "auto" }}
              >
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h6 className="text-primary mb-0" style={{ fontWeight: 600 }}>
                    Complaint No: <span id="compaintno1">{data.ticket_no}</span>
                  </h6>
                  <span className="text-muted small">{formatDate1(data.co)}</span>
                </div>

                {/* Name Section */}
                <h6 className=" mb-3">
                  <strong>Name:</strong> <span style={{ textTransform: "capitalize" }}> {data.customer_name}</span>
                </h6>

                {/* Model Number */}
                <h6 className="text-dark mb-3" style={{ fontWeight: 600 }}>
                  Model Number: <span>{data.ModelNumber || modelno}</span>
                </h6>

                {/* Address Section */}
                <h6 className="text-secondary small mb-3">
                  <strong>Address:</strong> {data.address}, {data.area}, {data.city},{" "}
                  {data.pincode}
                </h6>
                {/* Details Section */}
                <div className=" mb-2">

                  {data.serial_no ? <p className="mb-2 small">
                    <strong>Serial No:</strong> {data.serial_no}
                  </p> : <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode"><strong>Serial No</strong></label>
                      <input
                        type="number"
                        className="form-control"
                        maxLength="9"
                        value={serial_no}
                        onInput={(e) => {
                          if (e.target.value.length > 9) {
                            e.target.value = e.target.value.slice(0, 9);
                          }
                        }}
                        onChange={(e) => {
                          const input = e.target.value;

                          // Limit the value to 9 characters
                          if (input.length <= 9) {
                            setserial(input);

                            // Call API when the length is exactly 9
                            if (input.length === 9) {
                              handlegetmodel(input);
                            }
                          }
                        }}
                        name="serial_no"
                        id="spare_doc"
                      />

                    </div>
                    {errors.serial_no && <span className='text-danger'>{errors.serial_no}</span>}
                  </div>}

                  <p className="mb-0 small">
                    <strong>Ticket Type:</strong> {data.ticket_type}
                  </p>
                </div>

                <div className=" mb-2">
                  <p className="mb-0 small">
                    <strong>Customer Class:</strong> <span style={{ textTransform: "uppercase" }}> {data.customer_class}</span>
                  </p>
                </div>


                {purchase_date == null || purchase_date == '' ? <>
                  <p className="mb-2 small"><strong>Purchase Date:</strong></p>
                  <div>
                    <DatePicker
                      selected={Value.purchase_date}
                      onChange={(date) => {

                        getDateAfterOneYear(date);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="DD-MM-YYYY"
                      className='form-control'
                      disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}
                      name="purchase_date"
                      aria-describedby="Anidate"
                      maxDate={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </> : <><strong>Purchase Date:</strong> {formatDate(Value.purchase_date)} </>}

                {/* Priority Section */}
                <p className="mt-3  small" style={{ fontWeight: 600 }}>
                  Call Priority: <span className='text-danger'>{data.call_priority}</span>
                </p>
              </div>
            </div>

            <div class="col-12 mt-2">
              <div class="col-12">
                <div class="bg-light mb-3 p-2 rounded">
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-spare_remark"><strong>Fault Description</strong></label>
                      <p id="val_cc_remark " style={{ marginTop: '7px' }} >{data.specification}</p>
                    </div>
                  </div>






                </div>
              </div>
            </div>

            <div class="col-12 mt-2">
              <div class="col-12">
                <div class="bg-light mb-3 p-2 rounded">

                  <div class="mb-3">
                    <label for="Country" class="form-label">Defect Group Code</label>
                    <select value={Value.symptomcode} id="country" onChange={handleChange} name="symptomcode" class="form-select" aria-label=".form-select-lg example" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}>
                      <option value=''>Select Defect Group Code</option>
                      {symptomsode.map((item) => {
                        return (
                          <option value={item.defectgroupcode}>{item.defectgroupcode}-{item.defectgrouptitle}</option>
                        )
                      })}
                    </select>
                    {errors.symptomcode && <span className='text-danger'>{errors.symptomcode}</span>}
                  </div>

                  <div class="mb-3">
                    <label for="Region" class="form-label">Type of Defect Code</label>
                    <select id="Region" value={Value.causecode} onChange={handleChange} name="causecode" class="form-select" aria-label=".form-select-lg example" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}>
                      <option value="">Select Type of Defect Code</option>
                      {causecode.map((item) => {
                        return (
                          <option value={item.defect_code}>{item.defect_code}-{item.defect_title}</option>
                        )
                      })}
                    </select>
                    {errors.causecode && <span className='text-danger'>{errors.causecode}</span>}
                  </div>

                  <div class="mb-3">
                    <label for="geostate" class="form-label">Site Defect Code</label>
                    <select id="geostate" value={Value.actioncode} onChange={handleChange} name="actioncode" class="form-select" aria-label=".form-select-lg example" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}>
                      <option value="">Select Site Defect Code</option>
                      {actioncode.map((item) => {
                        return (
                          <option value={item.dsite_code}>{item.dsite_code}-{item.dsite_title}</option>
                        )
                      })}
                    </select>
                    {errors.actioncode && <span className='text-danger'>{errors.actioncode}</span>}
                  </div>
                  <div class="mb-3">
                    <label for="geostate" class="form-label">Activity Code</label>
                    <select id="geostate" value={Value.activity_code} onChange={handleChange} name="activity_code" class="form-select" aria-label=".form-select-lg example" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}>
                      <option value="">Select Site Defect Code</option>
                      {activity.map((item) => (
                        <option key={item.id} value={item.code}>
                          {item.code} - {item.title}
                        </option>
                      ))}
                    </select>
                    {errors.activity_code && <span className='text-danger'>{errors.activity_code}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-2">
              <div class="col-12">
                <div class="bg-light mb-3 p-2 rounded">



                  <div class="mb-3" hidden>
                    <div class="form-group">
                      <label for="val-actioncode">Ticket Type</label>
                      <select name="call_type" onChange={handleChange} value={Value.call_type} class="form-control" id="val_call_type">
                        <option value="">Select Ticket Type</option>
                        <option value="Installation">Installation</option>
                        <option value="Breakdown">Breakdown</option>
                        <option value="Visit">Visit</option>
                        <option value="Helpdesk">Helpdesk</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Demo">Demo</option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Warranty Status</label>
                      <select name="warranty_status" disabled onChange={handleChange} value={Value.warranty_status} class="form-control" id="val_warranty_status">
                        {/* <option>Select Warranty Status</option> */}
                        <option value="OUT OF WARRANTY" selected>Out Warranty</option>
                        <option value="WARRANTY">In Warranty</option>
                      </select>
                    </div>
                  </div>

                  {data.call_charges == 'Yes' ? <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Service Charges</label>
                      <input type="text" onChange={handleChange} class="form-control" value={Value.service_charges} name="service_charges" id="service_charges" disabled />
                    </div>
                  </div> : null}


                  <div class="mb-3" hidden>
                    <div class="form-group">
                      <label for="val-actioncode">Other Charges</label>
                      <input type="text" class="form-control" onChange={handleChange} name="other_charge" id="other_charge" />
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Invoice Upload</label>
                      <input type="file" class="form-control" name="spare_doc" id="spare_doc" onChange={handleFileChange} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} />
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Serial No. Upload</label>
                      <input type="file" class="form-control" name="spare_doc_two" id="spare_doc_two" onChange={handleFileChange} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} />
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Image & Video Upload</label>
                      <input type="file" class="form-control" name="spare_doc_three" id="spare_doc_three" onChange={handleFileChange} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} />
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="form-group">
                      <input type="checkbox" onChange={handleChange} name="spare_required" id="spare-required" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Select Spare</label>
                    </div>
                  </div>
                  {spare ? (
                    <div id="sparedt" class="mb-3 row justify-content-between align-content-center">

                      <div class="form-group col-6">
                        <label for="val-actioncode">Spare Details</label>
                        {/* <input  type="text" onChange={handleChange} class="form-control" name="spare_detail" id="val-spare_detail" value="" /> */}
                        <select required id="geostate" onChange={handleChange} name="spare" class="form-select" aria-label=".form-select-lg example">
                          <option value="">Select Spare Details Type</option>
                          {sparedata.map((item, key) => {
                            return (
                              <option value={key}>{item.article_code}-{item.article_description}</option>
                            )
                          })}
                        </select>
                      </div>

                      <div class="form-group col-3">
                        <label for="val-actioncode">Qty</label>
                        <input type="number" onChange={handleChange} class="form-control" value={Value.spare_qty} name="spare_qty" id="val-spare_detail" />
                      </div>

                      <div className='col-3'>
                        <button type='button' onClick={addspare} className='btn btn-primary mt-3 '>ADD</button>
                      </div>

                    </div>
                  ) : null}

                  <div className='card'>
                    <table className='table'>
                      <thead>
                        <tr>
                          <td>Spare Part</td>
                          <td>Qty</td>
                          <td>Action</td>
                        </tr>
                      </thead>
                      <tbody>
                        {sparelist.map((item) => {
                          return (
                            <tr>
                              <td>{item.article_code}-{item.article_description}</td>
                              <td>{item.quantity}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ padding: "0.2rem 0.5rem" }}
                                  disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}
                                  onClick={() => handleRemoveSparePart(item.id)}
                                >
                                  ✖
                                </button>
                              </td>
                            </tr>
                          )
                        })}

                      </tbody>
                    </table>
                  </div>
                </div>
                {errors.spare && <span className='text-danger'>{errors.spare}</span>}

                <table hidden className="table table-striped table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">#</th>
                      <th className="text-center">Title</th>
                      <th className="text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center">1</td>
                      <td className="text-center">bhavesh</td>
                      <td className="text-center">12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="col-12 mt-2">
              <div class="col-12">
                <div class="bg-light mb-3 p-2 rounded">
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-spare_remark"><strong>Extra Charges</strong></label>
                    </div>
                    <div className='row mt-2'>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="gas_charges" checked={checklist.gas_charges == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Gas Charges</label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="transpotation" checked={checklist.transpotation == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Transpotation</label>
                      </div>
                    </div>

                  </div>



                </div>
              </div>
            </div>

            <div class="col-12 mt-2">
              <div class="col-12">
                <div class="bg-light mb-3 p-2 rounded">
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-spare_remark"><strong>Check List</strong></label><span style={{ width: '10px', height: "10px", border: "1px solid black" }}></span>
                    </div>
                    <div className='row mt-2'>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="picking_damages" checked={checklist.picking_damages == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Any Picking Damages</label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="product_damages" checked={checklist.product_damages == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Any Product Damages </label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="missing_part" checked={checklist.missing_part == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Any Missing Parts</label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="leg_adjustment" checked={checklist.leg_adjustment == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Leg Adjustment Done</label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="water_connection" checked={checklist.water_connection == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Water Connection</label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="abnormal_noise" checked={checklist.abnormal_noise == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Any abnormal noise </label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="ventilation_top" checked={checklist.ventilation_top == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Ventilation Top</label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="ventilation_bottom" checked={checklist.ventilation_bottom == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Ventilation Bottom
                        </label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="ventilation_back" checked={checklist.ventilation_back == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Ventilation Back
                        </label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="voltage_supply" checked={checklist.voltage_supply == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Voltage Supply OK
                        </label>
                      </div>
                      <div class="form-group col-6">
                        <input type="checkbox" onChange={handleCheckChange} name="earthing" checked={checklist.earthing == 'Yes' ? true : false} disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} /> <label>Earthing Proper
                        </label>
                      </div>
                    </div>

                  </div>



                </div>
              </div>
            </div>

            <div class="col-12 mt-2">
              <div class="col-12">
                <div class="bg-light mb-3 p-2 rounded">
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-spare_remark"><strong>Additional Remarks</strong></label>
                      <p id="val_cc_remark" style={{ marginTop: '7px' }} >{data.call_remark}</p>
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-spare_remark">Checklist Remark</label>
                      <textarea class="form-control" onChange={handleChange} name="check_remark" id="check_remark" rows="3" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}></textarea>
                      {errors.check_remark && <span className='text-danger'>{errors.check_remark}</span>}
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-spare_remark">Technician Feedback<span className='text-danger'>*</span></label>
                      <textarea class="form-control" onChange={handleChange} name="call_remark" id="call_remark" rows="3" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}></textarea>
                      {errors.call_remark && <span className='text-danger'>{errors.call_remark}</span>}
                    </div>
                  </div>


                  <>
                    <div class="mb-3">
                      <div class="form-group">
                        <label for="val-spare_status">Call Status</label>
                        <select required name="call_status" value={Value.call_status} onChange={handleChange} id="val-spare_status" class="form-control select2-hidden-accessible" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}>
                          <option value="2">Select Status</option>


                          <option value='Completed'>Completed / Partially</option>
                          <option value='Spares'>Spares / Required</option>
                          <option value='Approval'>Approval / Customer / Quotation</option>
                          <option value='Approval-Int'>Approval / Internal</option>

                        </select>
                        {errors.call_status && <span className='text-danger'>{errors.call_status}</span>}
                      </div>
                    </div>

                    <>

                      {Value.call_status == 'Completed' && <div class="mb-3">
                        <div class="form-group">
                          <label for="val-actioncode">Enter OTP - <span className='text-primary' onClick={resendotp} style={{ cursor: "pointer" }}>Resend OTP</span> </label>
                          <input type="text" onChange={handleChange} value={Value.otps} class="form-control" name="otps" id="otps" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false} />
                          {errors.otps && <span className='text-danger'>{errors.otps}</span>}
                        </div>
                      </div>}



                    </>

                    <div class="mb-3">
                      <button type="submit" name="spare_submit" class="btn btn-primary float-right" disabled={data.call_status == 'Closed' || data.call_status == 'Completed' ? true : false}>Submit</button>
                    </div>
                  </>

                </div>
              </div>
            </div>

          </div>
        </form>
      </main>

    </>
  )
}

export default Details
