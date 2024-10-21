import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Base_Url } from '../../Utils/Base_Url';

export function Complaintview(params) {

    const { complaintid } = useParams();
    const [complaintview,setComplaintview] = useState([]);

    const fetchComplaintview = async (complaintid) => {
        try {
          const response = await axios.get(`${Base_Url}/getcomplaintview/${complaintid}`);
          console.log(response.data)
          setComplaintview(response.data);
        } catch (error) {
          console.error('Error editing area:', error);
        }
      };

        useEffect(()=>{
            if(complaintid){
                fetchComplaintview(complaintid);
            }
        },[complaintid]);

    return (
        <>
            <div className="row mp0">
                <div className="complbread">
                    <div className="row">
                        <div className="col-md-3">
                            <label className="breadMain">Complaint : LB240624015</label>
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

                            <p>{complaintview.address}, Pincode: {complaintview.pincode}</p>
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
                                        <tr>
                                            <td>
                                                <div>LB240624001</div>
                                                <div>02-06-2024</div>
                                            </td>
                                            <td>Liebherr 472L</td>
                                            <td>
                                                <div>Closed</div>
                                                <span>View Info</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div>LB240624002</div>
                                                <div>02-06-2024</div>
                                            </td>
                                            <td>Liebherr 472L</td>
                                            <td>
                                                <div>Closed</div>
                                                <span>View Info</span>
                                            </td>
                                        </tr>
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

                <div className="col-6">
                    <div className="card" id="csformInfo">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-12">
                                    <h3 className="mainheade">
                                        Complaint <span id="compaintno1">: LB240624015</span>
                                    </h3>
                                </div>
                            </div>

                            <div className="row d-flex justify-content-center">
                                <div className="col-md-12 col-lg-12">
                                    <div className="card shadow-0 border" style={{ backgroundColor: "#f0f2f5" }}>
                                        <div className="card-body p-4">
                                            <div data-mdb-input-init className="form-outline mb-4">
                                                <input type="text" id="addANote" className="form-control" placeholder="Type comment..." />
                                                <label className="form-label" htmlFor="addANote">+ Add a note</label>
                                            </div>

                                            {/* Note section commented out for now */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                                <input type="text" className="form-control" value="Liebherr 472L" />
                            </div>
                        </div>
                    </div>

                    <div className="card mb-3" id="engineerInfocs">
                        <div className="card-body">
                            <h4 className="pname">Engineer</h4>
                            <div className="mb-3">
                                <input type="text" className="form-control" value="John Smith" />
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


        </>
    )
}