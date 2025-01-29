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


export function EnquiryForm(params) {




    return (
        <>
            < div className="p-3">

                <div className="row ">
                    <div className="complbread">
                        <div className="row">
                            <div className="col-md-3">
                             < label className="breadMain"></label> : < label className="breadMain">Register New Ticket</label>
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
                                                value={''}

 
                                                placeholder="Enter Mobile / Email / Customer Name"
                                            />
                                        </div>
                                        <div className="col-4">
                                   <button
                                                id="inputSearch"
                                                name="inputSearch"
                                                type="submit"
                                                className="btn btn-liebherr"
                                                onClick={''}
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>


                        <div id="searchResult" className="card">

                            <div className="card-body">

                                <div className="row">
                                    <div className="col-md-12">
                                        <p><strong>Customer Id :</strong></p>
                                        <h4 className="pname"></h4>
                                    </div>
                                </div>

                                {/* Display addresses here */}
                                {/* <p style={{fontSize: '12px'}}>{searchdata.address}</p> */}
                                <div className="row">
                                    <div className="col-md-12">

                                       
                              
                                                <p
                                                    key="single-address"
                                                    style={{
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                
                                                </p>
                                        
                                    </div>
                                </div>


                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <p><strong>Mobile :</strong> </p>
                                    </div>
                                </div>

                       
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
                                                               <button className="btn btn-sm btn-primary generateTicket" >New Ticket</button> 
                                                                </div>
                                                            </td>
                                                        </tr>

                                                 
                                                            <tr >
                                                                <td><div></div></td>
                                                                <td>
                                                                    <div className="text-right pb-2">
                                                                      <button  className="btn btn-sm btn-primary generateTicket">New Ticket</button> 
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                     


                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                           

                               <>
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        <li className="nav-item">
                                            <a className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Previous Ticket</a>
                                        </li>
                                    </ul>

                                    <div className="tab-content">
                                        <div className="tab-pane active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                            <table className="table table-striped">
                                                <tbody>
                                       
                                                        <tr >
                                                            <td>
                                                                <div style={{ fontSize: "14px" }}></div>
                                                                <span style={{ fontSize: "14px" }}></span>
                                                            </td>
                                                            <td style={{ fontSize: "14px" }}></td>
                                                            <td>
                                                                <div style={{ fontSize: "14px" }}></div>
                                                                <span style={{ fontSize: "14px" }}><button
                                                                    className='btn'
                                                                
                                                                    title="View Info"
                                                                    style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                                >
                                                                    <FaEye />
                                                                </button></span>
                                                            </td>
                                                        </tr>
                                          
                                                </tbody>

                                            </table>
                                        </div>
                                    </div>
                                </>



                            </div>

                        </div> : <div className="card">
                            <div className="card-body">
                                {/* Only show "No Result Found" if a search was performed and no results were found */}
                                <p className="text-danger ">No Result Found</p>
                                <button  className="btn btn-sm btn-primary">New Ticket</button>
                            </div>


                        </div>





                    </div>
              <>
                        <div className="col-6">
                            <div className="card" id="formInfo">
                                <div className="card-body">
                                    <div className="row">

                                        <div className="col-md-3">
                                            <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Serial No </p>

                                      
                                                <div className="mb-3">
                                                    <input
                                                        type="text"
                                                        name="serial"
                                                        value={''}
                                                  
                                                        className="form-control"
                                                        placeholder="Enter.."
                                                  
                                                    />
                                               <span style={{ fontSize: "12px" }} className="text-danger"></span>
                                                </div> 

                                        </div>

                                        <div className="col-md-3">
                                            <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Model</p>

                                

                                                <div className="">
                                                    <input className="form-control" name="model" disabled></input>
                                              
                                                </div> 
                                         
                                        </div>
                                        {/* Add Purchase Date field */}
                                        <div className="col-md-3">
                                            <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Purchase Date</p>

                      

                                    
                                                <div className="mb-3">
                                                    <DatePicker
                                                    
                                                 
                                                        dateFormat="dd-MM-yyyy"
                                                        placeholderText="DD-MM-YYYY"
                                                        className='form-control'
                                                        name="purchase_date"
                                                        aria-describedby="Anidate"
                                                   
                                                    />
                                               
                                                </div> 



                                        </div>

                                        {/* Add Warranty Status field */}
                                        <div className="col-md-3">
                                            <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Warranty Status</p>
                                            <div className="mb-3">
                                                <select className="form-control" name="warrenty_status" disabled>   {/* disabled={warranty_status_data == '' ? false : true */}
                                                    <option value="">Select Option</option>
                                                    <option value="WARRANTY">IN WARRANTY</option>
                                                    <option value="OUT OF WARRANTY">OUT OF WARRANTY</option>
                                                    <option value="NA">NA</option>
                                                </select>
                                            
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12">
                                            <h3 className="mainheade">Ticket <span id="compaintno">:</span></h3>
                                        </div>
                                    </div>

                                    <form className="row" >

                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Ticket Type <span className="text-danger">*</span></label>
                                                <select className="form-control" name="ticket_type">
                                                    <option value="">Select</option>
                                                    <option value="INSTALLATION">Installation</option>
                                                    <option value="BREAKDOWN">Breakdown</option>
                                                    <option value="VISIT">Visit</option>
                                                    <option value="HELPDESK">Helpdesk</option>
                                                    <option value="MAINTENANCE">Maintenance</option>
                                                    <option value="DEMO">Demo</option>
                                                </select>
                                         
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label className="form-label">Ticket Date<span className="text-danger">*</span></label>
                                                {/* <input type="date" name="complaint_date" onChange={onHandleChange} value={value.complaint_date || new Date().toISOString().split('T')[0]} className="form-control" disabled={Comp_id ? true : false} min={new Date().toISOString().split('T')[0]} /> */}

                                                <DatePicker
                                        
                                                    dateFormat="dd-MM-yyyy"
                                                    placeholderText="DD-MM-YYYY"
                                                    className='form-control'
                                                    name="complaint_date"
                                                    aria-describedby="Anidate"
                                             
                                                />

                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="mb-3">
                                                <label className="form-label">Salutation <span className="text-danger">*</span></label>
                                                <select className="form-control" name="salutation">
                                                    <option value="">Salutation</option>
                                                    <option value="Mr">Mr</option>
                                                    <option value="Mrs">Mrs</option>
                                                    <option value="Miss">Miss</option>
                                                    <option value="M.">M.</option>
                                                    <option value="Lhi">Lhi</option>
                                                    <option value="Dl">Dl</option>
                                                </select>
                                                
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Customer Name <span className="text-danger">*</span></label>
                                                <input type="text" name="customer_name"  className="form-control" placeholder="Enter Customer Name" />
                                          
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Contact Person <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control" name="contact_person"   placeholder="Enter Contact Person Name" />
                                        
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Email Id</label>
                                                <input type="email" name="email" className="form-control" placeholder="Enter Email Id" />
                                          
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Mobile No.  <span className="text-danger">*</span>
                                                    <input type="checkbox" name='mwhatsapp'  />Whatsapp</label>
                                                <input type="number"  name="mobile" className="form-control" placeholder="Enter Mobile" />
                                           
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Alt. Mobile No. <input type="checkbox" name="awhatsaap" />Whatsapp</label>
                                                <input type="number"  className="form-control"  name="alt_mobile" placeholder="Enter Mobile" />
                                          
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Customer Classification <span className="text-danger">*</span></label>
                                                <select className="form-control"  name="classification" >
                                                    <option value="">Select</option>
                                                    <option value="Consumer">Consumer</option>
                                                    <option value="Import">Import</option>
                                                </select>
                                            
                                            </div>
                                        </div>

                                     
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

                        

                                       
                                               
                                   
                                        </>

                                    <>

                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">Pincode <span className="text-danger">*</span></label>
                                                    <input type="number" className="form-control" name="pincode"  placeholder="" />
                                                
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">State</label>
                                                    <input type="text" className="form-control"  name="state"  placeholder="" disabled />
                                           
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">District</label>
                                                    <input type="text" className="form-control" name="area"  placeholder="" disabled />
                                                   
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">City</label>
                                                    <input type="text" className="form-control" name="city" placeholder="" disabled />
                                         
                                                </div>
                                            </div>

                                        </>

                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Requested by </label>
                                                <input type="text" className="form-control" name="requested_by"  placeholder="" />
                                         
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Requested Email </label>
                                                <input type="email" className="form-control" name="requested_email"  placeholder="" />
                                             
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Requested Mobile </label>
                                                <input type="number" className="form-control" name="requested_mobile" placeholder="" />
                                    
                                            </div>
                                        </div>




                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Mode of Contact <span className="text-danger">*</span></label>
                                                <select className="form-control"  name="mode_of_contact">
                                                    <option value="">Select</option>
                                                    <option value="Call">Call</option>
                                                    <option value="SMS">SMS</option>
                                                    <option value="Email">Email</option>
                                                    <option value="In Person">In Person</option>
                                                </select>
                                       
                                            </div>
                                        </div>


                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Customer Type <span className="text-danger">*</span></label>
                                                <select className="form-control" name="cust_type">
                                                    <option value="">Select </option>
                                                    <option value="END CUSTOMER">END CUSTOMER</option>
                                                    <option value="DISPLAY/EVENT">DISPLAY / EVENTS</option>
                                                </select>
                                       
                                            </div>
                                        </div>
                                 
                                        <input type="hidden" name="invoice_date"></input>



                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Call Chargeable<span className="text-danger">*</span></label>
                                                <select className="form-control" name="call_charge">
                                                    <option value="">Select</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                      
                                            </div>
                                        </div>


                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Priority<span className="text-danger">*</span></label>
                                                <select className="form-control"  name="Priority">
                                                    <option value="">Select</option>
                                                    <option value="REGULAR">Regular</option>
                                                    <option value="HIGH">High</option>
                                                </select>
                                 
                                            </div>
                                        </div>



                                        <div className="col-md-12">
                                          <button style={{ float: "right" }} type="button" className="btn btn-liebherr">Submit</button>
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
                                        <p></p>


                                        <h4 className="pname">Child Service Partner</h4>
                                        <p></p>

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
                                            <input type="text" className="form-control" name="sub_dealer"  placeholder="Primary Dealer" disabled />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <h4 className="pname">Secondary Dealer : </h4>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <input type="text" className="form-control" name="sales_partner2"  placeholder="Secondary Dealer" />
                                        </div>
                                    </div>
                                </div>


                                <div className="card mb-3" id="engineerInfo">
                                    <div className="card-body">
                                        <h4 className="pname">Fault Description <span className="text-danger">*</span></h4>
                                        <div className="mb-3">
                                            <textarea
                                                className="form-control"
                                                name="specification"
                                   
                                                placeholder="Enter Fault Description..."
                                            ></textarea>
                             
                                        </div>
                                    </div>
                                </div>

                                <div className="card mb-3" id="engineerInfo">
                                    <div className="card-body">
                                        <h4 className="pname">Additional Info</h4>
                                        <div className="mb-3">
                                            <textarea
                                                className="form-control"
                                                name="additional_remarks"
                                       
                                                placeholder="Enter additional info..."
                                            ></textarea>
                             
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
                              
                                            />
                                        </div>
                                      


                                    </div>
                                </div>


                            </>

                        </div>
                    </>
              



                </div>



            </div>

        </>
    )
}
