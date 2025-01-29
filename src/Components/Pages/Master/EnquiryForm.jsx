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
                             < label className="breadMain">Register New Enquiry</label>
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
                                    <p>Search by Mobile No./ Customer Id / Email Id</p>
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

                                

                                {/* Display addresses here */}
                                {/* <p style={{fontSize: '12px'}}>{searchdata.address}</p> */}
                                <div className="row">
                                    <div className="col-md-12">

                                       <p key="single-address" style={{ fontSize: '12px',}}></p>
                                        
                                    </div>
                                </div>


                                

                       
                                    <>
                                        
                                        <div className="tab-content mb-3">
                                            <div className="tab-pane active" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                                <table className="table table-striped">
                                                    <tbody>


                                                        <tr>
                                                            <td>Customer Name </td>
                                                            <td>
                                                                <div className="text-right pb-2">
                                                                    <button className="btn btn-sm btn-primary generateTicket" >New Enquiry</button> 
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
                                            <a className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Product List</a>
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
                                                                    
                                                                </button></span>
                                                            </td>
                                                        </tr>
                                          
                                                </tbody>

                                            </table>
                                        </div>
                                    </div>
                                </>



                            </div>

                        </div> <br></br>
                        <div className="card">
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
                                        <div className="col-md-12">
                                            <h3 className="mainheade">Enquiry <span id="compaintno">:</span></h3>
                                        </div>
                                    </div>

                                    <form className="row" >

                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Enquiry Type <span className="text-danger">*</span></label>
                                                <select className="form-control" name="ticket_type">
                                                    <option value="">Select</option>
                                                    <option value="Product">Product</option>
                                                    <option value="Spare Parts">Spare Parts</option>
                                                    <option value="Dealership">Dealership</option>
                                                    <option value="Service Partner">Service Partner</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                         
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label className="form-label">Enquiry Date<span className="text-danger">*</span></label>
                                                
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
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Requested Mobile </label>
                                                <input type="text" className="form-control" name="contact_person"   placeholder="Enter Requested Mobile" />
                                        
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Customer Type <span className="text-danger">*</span></label>
                                                <select className="form-control"  name="classification" >
                                                    <option value="">Select</option>
                                                    <option value="Customer">Customer</option>
                                                    <option value="Dealer">Dealer</option>
                                                </select>
                                            
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Source<span className="text-danger">*</span></label>
                                                <select className="form-control"  name="classification" >
                                                    <option value="">Select</option>
                                                    <option value="Call">Call</option>
                                                    <option value="Website">Website</option>
                                                    <option value="Call">Social Media</option>
                                                    <option value="Call">E-mail</option>
                                                    <option value="Call">SMS</option>
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

                                    <div className="col-md-12">
                                        <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Address <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            value=""
                                            name="address"
                                            onChange=""
                                            placeholder="Enter Address"
                                        ></textarea>

                                        </div>
                                    </div>


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
                                                <label className="form-label">Interested In<span className="text-danger">*</span></label>
                                                <select className="form-control"  name="classification" >
                                                    <option value="">Select</option>
                                                    <option value="Consumer">Consumer</option>
                                                    <option value="Import">Import</option>
                                                </select>
                                            
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Model Number</label>
                                                <input type="text" className="form-control" name="requested_by"  placeholder="" />
                                         
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
                                        <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Notes <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            value=""
                                            name="notes"
                                            onChange=""
                                            placeholder="Enter Notes"
                                        ></textarea>

                                        </div>
                                    </div>
                                       

                                        <input type="hidden" name="invoice_date"></input>

                                        <div className="col-md-12">
                                          <button style={{ float: "right" }} type="button" className="btn btn-liebherr">Submit</button>
                                               </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="col-3">

                            <>
                                <div className="card mb-3" id="engineerInfo">
                                    <div className="card-body">
                                        <h4 className="pname">Follow Up Remarks <span className="text-danger">*</span></h4>
                                        <div className="mb-3">
                                            <textarea
                                                className="form-control"
                                                name="specification"
                                   
                                                placeholder="Enter Fault Remarks..."
                                            ></textarea>
                             
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Lead Converted</label>
                                            <select className="form-control"  name="LeadConverted">
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                
                                        </div>

                                        <div  className="mb-3 text-right">
                                        <button class="btn btn-sm btn-primary">Submit Remarks</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card mb-3" id="flwremarks">
                                    <div className="card-body">
                                    <div class="mt-3"><h4 class="pname">Remark List</h4>
                                    
                                            <table class="table table-bordered" >
                                                <thead>
                                                    <tr>
                                                        <td><p>Remarks added in followup<br></br><br/><span>Date : 30-01-2025 by Abhishek</span></p></td>
                                                    </tr>
                                                    <tr>
                                                        <td><p>Remarks added in followup<br></br><br/>Date : 30-01-2025 by Abhishek</p></td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                </tbody>
                                            </table>
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
