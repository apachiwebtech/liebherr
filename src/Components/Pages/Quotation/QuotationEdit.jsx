import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url } from '../../Utils/Base_Url';
import { useNavigate, useParams } from 'react-router-dom';


const QuotationEdit = () => {

    const { qid } = useParams()
    const navigate = useNavigate()

    const [value, setValue] = useState({
        ticketId: '',
        ticketDate: '',
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
            quantity : value.quantity,
            price : value.price,
            status : value.status,
            qid : qid
        }

        axios.post(`${Base_Url}/updatequotation` , data)
        .then((res) =>{
            alert("Updated Successfully..")
            navigate('/quotationlist')
        })

    }


    return (
        <div className="tab-content">

            <div className="row mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body">

                            <div className="row mp0">
                                <h4 className="pname" style={{ fontSize: "14px" }}>Quotation Details:</h4>
                                <hr></hr>
                                <div className="col-12">
                                    <form  onSubmit={handleupdatedata}>
                                        <div className='row'>
                                            <div className="form-group col-lg-3">
                                                <label
                                                    htmlFor="regionInput"
                                                    className="input-field"
                                                    style={{ marginBottom: "15px", fontSize: "18px" }}
                                                >
                                                    Quotation No.
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="service_partner_basic"
                                                    id="mrp"
                                                    value={value.quotationNumber}
                                                    placeholder="Enter .."
                                                    disabled
                                                />


                                            </div>
                                            <div className="form-group col-lg-3">
                                                <label
                                                    htmlFor="regionInput"
                                                    className="input-field"
                                                    style={{ marginBottom: "15px", fontSize: "18px" }}
                                                >
                                                    Ticket Id
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="service_partner_basic"
                                                    id="mrp"
                                                    value={value.ticketId}
                                                    placeholder="Enter .."
                                                    disabled
                                                />


                                            </div>
                                            <div className="form-group col-lg-3">
                                                <label
                                                    htmlFor="regionInput"
                                                    className="input-field"
                                                    style={{ marginBottom: "15px", fontSize: "18px" }}
                                                >
                                                    Engineer
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="service_partner_basic"
                                                    id="mrp"
                                                    value={value.assignedEngineer}
                                                    placeholder="Enter .."
                                                    disabled
                                                />


                                            </div>
                                            <div className="form-group col-lg-3">
                                                <label
                                                    htmlFor="regionInput"
                                                    className="input-field"
                                                    style={{ marginBottom: "15px", fontSize: "18px" }}
                                                >
                                                    Customer Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="service_partner_basic"
                                                    id="mrp"
                                                    value={value.CustomerName}
                                                    placeholder="Enter .."
                                                    disabled
                                                />


                                            </div>
                                            <div className="form-group col-lg-3">
                                                <label
                                                    htmlFor="regionInput"
                                                    className="input-field"
                                                    style={{ marginBottom: "15px", fontSize: "18px" }}
                                                >
                                                    Spare Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="service_partner_basic"
                                                    id="mrp"
                                                    value={value.title}
                                                    placeholder="Enter .."
                                                    disabled
                                                />


                                            </div>
                                            <div className="form-group col-lg-3">
                                                <label
                                                    htmlFor="regionInput"
                                                    className="input-field"
                                                    style={{ marginBottom: "15px", fontSize: "18px" }}
                                                >
                                                    Model Number
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="service_partner_basic"
                                                    id="mrp"
                                                    value={value.ModelNumber}
                                                    placeholder="Enter .."
                                                    disabled
                                                />


                                            </div>
                                            <div className="form-group col-lg-3">
                                                <label
                                                    htmlFor="regionInput"
                                                    className="input-field"
                                                    style={{ marginBottom: "15px", fontSize: "18px" }}
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
                                            <div className="form-group col-lg-3">
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
                                            <div className="form-group col-lg-3">
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
                                        </div>
                                        <div className="text-right">
                                            <button
                                                className="btn btn-liebherr"
                                                type="submit"
                                                style={{ marginTop: "15px" }}
                                            >
                                                Submit
                                            </button>

                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div></div>

    );
};

export default QuotationEdit;
