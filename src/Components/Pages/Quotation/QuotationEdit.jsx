import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url } from '../../Utils/Base_Url';
import { useNavigate, useParams } from 'react-router-dom';


const QuotationEdit = () => {

    const { qid } = useParams()
    const navigate = useNavigate()

    const [value, setValue] = useState({
        ticketId: '',
        ticketdate: '',
        quotationNumber: '',
        CustomerName: '',
        state: '',
        city: '',
        assignedEngineer: '',
        status: '',
        customerId: '',
        ModelNumber: '',
        title: '',
        quantity: '',
        price: ''
    })

    async function getquotedetails(params) {
        axios.post(`${Base_Url}/getquotedetails`, { quotaion_id: qid })
            .then((res) => {
                setValue(res.data[0])
            })
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValue((prev) => ({
            ...prev,
            [name]: value, // Dynamically update the field based on the input's name
        }));
    };


    useEffect(() => {
        getquotedetails()
    }, [])


    const handleupdatedata = (e) => {
        e.preventDefault()

        const data = {
            quantity: value.quantity,
            price: value.price,
            status: value.status,
            qid: qid
        }

        axios.post(`${Base_Url}/updatequotation`, data)
            .then((res) => {
                alert("Updated Successfully..")
                navigate('/quotationlist')
            })

    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
    
        return `${day}-${month}-${year}`;
      };


    return (
        <div className="tab-content">

            <div className="row mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body">

                            <div className="row mp0">
                                <h2 className="pname" style={{ fontSize: "20px" }}>Quotation Details:</h2>
                                <hr></hr>
                                <div className="col-lg-12">
                                    <div class="card " style={{  backgroundColor: "#F5F5DC" }}>
                                        <div class="card-head">
                                            <div class="card-head-label" style={{ paddingLeft: "1" }}>
                                                <h3
                                                    class="card-head-title"
                                                    style={{ fontSize: "1.1rem", marginTop: '5px' }}
                                                >

                                                </h3>
                                            </div>
                                        </div>

                                        <div class="card-body" style={{ paddingTop: 0 }}>
                                            <ul
                                                class="list-stats"
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    paddingLeft: 0,
                                                    listStyle: "none",
                                                    margin: 0,
                                                }}
                                            >
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Quotation No:</span>
                                                    &nbsp;<span class="value"><b>{value.quotationNumber}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Customer Name:</span>
                                                    &nbsp;<span class="value"><b>{value.CustomerName}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Ticket ID:</span>
                                                    &nbsp;<span class="value"><b>{value.ticketId}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Ticket Date:</span>
                                                    &nbsp;<span class="value"><b>{formatDate(value.ticketdate)}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Model Number:</span>
                                                    &nbsp;<span class="value"><b>{value.ModelNumber}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Engineer Name:</span>
                                                    &nbsp;<span class="value"><b>{value.assignedEngineer}</b></span>
                                                </li>
                                            </ul>
                                        </div>


                                    </div>
                                </div>
                                <div style={{ paddingBottom: '15px' }}>

                                </div>

                                <div className='row'>

                                    <div className="col-lg-4">
                                        <div class="card " style={{ backgroundColor: "#F5F5DC" }}>
                                            <div className="col-12">
                                                <form onSubmit={handleupdatedata}>
                                                    <m4 style={{paddingLeft: 15,}} ><b>Update Quotation</b></m4>
                                                    <div className="form-group col-lg-8" style={{ paddingLeft: 15,paddingTop:15 }}>
                                                        <label
                                                            htmlFor="regionInput"
                                                            className="input-field"
                                                            style={{ marginBottom: "15px", fontSize: "18px", marginLeft: "5px" }}
                                                        >
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="quantity"
                                                            id="mrp"
                                                            value={value.quantity}
                                                            placeholder="Enter .."
                                                            onChange={handleChange}

                                                        />


                                                    </div>
                                                    <div className="form-group col-lg-8" style={{ paddingLeft: 15 }}>
                                                        <label
                                                            htmlFor="regionInput"
                                                            className="input-field"
                                                            style={{ marginBottom: "15px", fontSize: "18px" }}
                                                        >
                                                            Price
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="price"
                                                            id="mrp"
                                                            value={value.price}
                                                            placeholder="Enter .."
                                                            onChange={handleChange}

                                                        />


                                                    </div>
                                                    <div className="form-group col-lg-8" style={{ paddingLeft: 15 }}>
                                                        <label
                                                            htmlFor="category"
                                                            className="form-label pb-0 dropdown-label"
                                                        >
                                                            Status
                                                        </label>
                                                        <select
                                                            className="form-select dropdown-select"
                                                            name="status"
                                                            value={value.status}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="">Select Status</option>
                                                            <option value="Approve">Approve</option>
                                                            <option value="Pending">Pending</option>



                                                        </select>


                                                    </div>
                                                    <div className="text-right">
                                                        <button
                                                            className="btn btn-liebherr"
                                                            type="submit"
                                                            style={{ marginTop: "6px", marginRight: "5px" }}
                                                        >
                                                            Submit
                                                        </button>

                                                    </div>

                                                </form>

                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-lg-4" style={{ flex: "1 1 auto", }}>
                                        {/* Search Filters */}
                                        <div className="gridbox">

                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Spare Name</th>
                                                        <th>Model Number</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        
                                                    </tr>
                                                </thead>
                                                <tbody><tr >
                                                    <td>1</td>
                                                    <td>Handle</td>
                                                    <td>TCLbsB 2711 I01 20</td>
                                                    <td>10</td>
                                                    <td>1000</td>

                                                   
                                                </tr>
                                                    <tr >
                                                        {/* <td>{displayIndex}</td>  Use displayIndex for correct pagination */}
                                                        <td>2</td>
                                                        <td>Trey</td>
                                                        <td>CNPef 4516-20 136 HL-AUSTRALI</td>
                                                        <td>20</td>
                                                        <td>2000</td>

                                                            
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-3 tab_box" style={{ padding: "0px 0px 0px 0px" }}>

                    </div>
                </div>
            </div></div>

    );
};

export default QuotationEdit;
