import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import { Base_Url } from '../../Utils/Base_Url';

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
  const [remark, setremark] = useState([])
  const [callstatus, setcallstatus] = useState([])
  const { id } = useParams();
  const [activity, setactivity] = useState([]);
  const [otppart, setotppart] = useState(true);
  const [iscomplate, setIscomplate] = useState(false)
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [otp, setotp] = useState([]);
  const [serial_no, setserial] = useState('');
  const [modelno, setModelNumber] = useState('');
  const [files, setFiles] = useState({
    spare_doc: null,
    spare_doc_two: null,
    spare_doc_three: null,
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
    ModelNumber: ''
  })

  const [GroupDefectsite, setGroupDefectsite] = useState([]);





  const handleChange = (e) => {
    setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }))


    if (e.target.name == 'spare_required') {
      setspare(e.target.checked)
    }
    if (e.target.name == 'symptomcode') {
      getDefectCodewisetype_app(e.target.value)
      getDefectCodewisesite_app(e.target.value)
    }


    if (e.target.value == 'Completed' || e.target.value === 'Approve' || e.target.value === 'Spares') {
      setIscomplate(false)
      setotppart(false)
    }
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


  const handleSubmit = (e) => {
    e.preventDefault();




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
    formData.append('ticket_no', data.ticket_no);
    formData.append('ModelNumber', modelno || data.ModelNumber);
    formData.append('serial_no', serial_no || data.serial_no);
    formData.append('user_id', localStorage.getItem('userid'));
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

    // const fileInput = document.getElementById('spare_doc');
    // console.log(fileInput,'file')
    // if (fileInput.files[0]) {
    //   formData.append('spare_doc', fileInput.files[0]);
    // }
    // const fileInput2 = document.getElementById('spare_doc_two');
    // if (fileInput2.files[0]) {
    //   formData.append('spare_doc_two', fileInput2.files[0]);
    // }
    // const fileInput3 = document.getElementById('spare_doc_three');
    // if (fileInput3.files[0]) {
    //   formData.append('spare_doc_three', fileInput3.files[0]);
    // }

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
          getspare(res.data.data[0].ModelNumber)
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
    // console.log(data);

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





  const gogootp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    setotp(otp)
    const eata = {
      otp: otp,
      orderid: data.id
    }
    axios.post(`${Base_Url}/getotpapp`, eata)
      .then((res) => {
        console.log(res.data.message);

        if (res.data.message == 'done') {
          setotppart(false)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }


  const formatDate = (dateString) => {
    if (!dateString) {
      return dateString; // Return an empty string or a placeholder if dateString is undefined or null
    }

    const date = new Date(dateString.split(" ")[0]);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };


  const handlegetmodel = async (value) => {

    setserial(value)


    try {
      const response = await axios.get(
        `${Base_Url}/getserial/${value || value.serial_no}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      }
      );

      if ( response.data && response.data[0].ModelNumber) {

        setModelNumber(response.data[0].ModelNumber)

      }




    } catch (error) {
      console.error("Error fetching serial details:", error);
    }
  }


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
                  <span className="text-muted small">{formatDate(data.co)}</span>
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
                      <input type="number" class="form-control" onChange={(e) => handlegetmodel(e.target.value)} name="spare_doc" id="spare_doc" />
                    </div>
                  </div>}

                  <p className="mb-0 small">
                    <strong>Ticket Type:</strong> {data.ticket_type}
                  </p>
                </div>

                <div className=" mb-2">
                  <p className="mb-2 small">
                    <strong>Call Type:</strong> {data.call_type}
                  </p>
                  <p className="mb-0 small">
                    <strong>Customer Class:</strong> <span style={{ textTransform: "uppercase" }}> {data.customer_class}</span>
                  </p>
                </div>

                {/* Priority Section */}
                <p className="mt-3 text-danger small" style={{ fontWeight: 600 }}>
                  Call Priority: {data.call_priority}
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
                    <select required value={Value.symptomcode} id="country" onChange={handleChange} name="symptomcode" class="form-select" aria-label=".form-select-lg example">
                      <option value=''>Select Defect Group Code</option>
                      {symptomsode.map((item) => {
                        return (
                          <option value={item.defectgroupcode}>{item.defectgrouptitle}</option>
                        )
                      })}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="Region" class="form-label">Type of Defect Code</label>
                    <select id="Region" value={Value.causecode} onChange={handleChange} name="causecode" class="form-select" aria-label=".form-select-lg example">
                      <option value="">Select Type of Defect Code</option>
                      {causecode.map((item) => {
                        return (
                          <option value={item.defect_code}>{item.defect_title}</option>
                        )
                      })}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="geostate" class="form-label">Site Defect Code</label>
                    <select id="geostate" value={Value.actioncode} onChange={handleChange} name="actioncode" class="form-select" aria-label=".form-select-lg example">
                      <option value="">Select Site Defect Code</option>
                      {actioncode.map((item) => {
                        return (
                          <option value={item.dsite_code}>{item.dsite_title}</option>
                        )
                      })}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="geostate" class="form-label">Activity Code</label>
                    <select id="geostate" value={Value.activity_code} onChange={handleChange} name="activity_code" class="form-select" aria-label=".form-select-lg example">
                      <option value="">Select Site Defect Code</option>
                      {activity.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.title}
                        </option>
                      ))}
                    </select>
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
                        <option>Select Warranty Status</option>
                        <option value="Out Warranty" selected>Out Warranty</option>
                        <option value="Warranty">In Warranty</option>
                      </select>
                    </div>
                  </div>

                  {data.call_charges == 'Yes' ? <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Service Charges</label>
                      <input type="text" onChange={handleChange} class="form-control" name="service_charges" id="service_charges" disabled />
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
                      <label for="val-actioncode">Attachment</label>
                      <input type="file" class="form-control" name="spare_doc" id="spare_doc" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Attachment2</label>
                      <input type="file" class="form-control" name="spare_doc_two" id="spare_doc_two" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-actioncode">Attachment3</label>
                      <input type="file" class="form-control" name="spare_doc_three" id="spare_doc_three" onChange={handleFileChange} />
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="form-group">
                      <input type="checkbox" onChange={handleChange} name="spare_required" id="spare-required" /> <label>Spare Required</label>
                    </div>
                  </div>
                  {spare ? (
                    <div id="sparedt" class="mb-3 d-flex justify-content-between align-content-center">

                      <div class="form-group">
                        <label for="val-actioncode">Spare Details</label>
                        {/* <input  type="text" onChange={handleChange} class="form-control" name="spare_detail" id="val-spare_detail" value="" /> */}
                        <select required id="geostate" onChange={handleChange} name="spare" class="form-select" aria-label=".form-select-lg example">
                          <option value="">Select Spare Details Type</option>
                          {sparedata.map((item, key) => {
                            return (
                              <option value={key}>{item.article_description}</option>
                            )
                          })}
                        </select>
                      </div>




                      <div >
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
                              <td>{item.article_description}</td>
                              <td>{item.quantity}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ padding: "0.2rem 0.5rem" }}
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
                      <label for="val-spare_remark"><strong>Additional Remarks</strong></label>
                      <p id="val_cc_remark" style={{ marginTop: '7px' }} >{remark.remark}</p>
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="form-group">
                      <label for="val-spare_remark">Technician Feedback</label>
                      <textarea class="form-control" onChange={handleChange} name="call_remark" id="call_remark" rows="3"></textarea>
                    </div>
                  </div>

                  {done ? (
                    <>
                      <div class="mb-3">
                        <div class="form-group">
                          <label for="val-spare_status">Call Status</label>
                          <select required name="call_status" value={Value.call_status} onChange={handleChange} id="val-spare_status" class="form-control select2-hidden-accessible" >
                            <option value="2">Select Status</option>
                            {/* {callstatus
                              .filter((item) => item.Callstatus === 'Closed' || item.Callstatus === 'Cancelled' || item.Callstatus === 'Spares' || item.Callstatus === 'Completed') // Filter items
                              .map((item) => (
                                <option key={item.Callstatus} value={item.Callstatus}>
                                  {item.Callstatus}
                                </option>
                              ))} */}

                            <option value='Closed'>Completed</option>
                            <option value='Spares'>Spares</option>
                            <option value='Approval'>Approval / Customer / Quotation</option>
                            <option value='Approval'>Approval /Internal</option>

                          </select>
                          <p className='text-danger' >{Value.status_error}</p>
                        </div>
                      </div>
                      {otppart ? (
                        <div class="mb-3">
                          <button type="submit" name="spare_submit" class="btn btn-primary float-right">{iscomplate ? "Send OTP" : "Submit"}</button>
                        </div>

                      ) : (
                        <>
                          <div class="mb-3">
                            <div class="form-group">
                              <label for="val-actioncode">Entry OTP - {otp}</label>
                              <input type="text" onChange={handleChange} class="form-control" name="otps" id="otps" />
                              <p className='text-danger' >{Value.otps_error}</p>
                            </div>
                          </div>
                          <div class="mb-3">
                            <button type="submit" name="spare_submit" class="btn btn-primary float-right">Submit</button>
                          </div>
                        </>
                      )}


                    </>
                  ) : null}
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
