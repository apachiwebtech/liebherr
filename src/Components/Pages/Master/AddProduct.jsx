import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';


export function AddProduct(params) {

    const [value, setValue] = useState({
        item_code: "",
        item_description: "",
        product_model: "",
        product_type: "",
        product_class_code: "",
        product_class: "",
        product_line_code: "",
        product_line: "",
        material: "",
        manufacturer: "",
        item_type: "",
        serialized: "",
        size: "",
        crmproducttype: "",
        colour: "",
        handle_type: "",
        serial_identification: "",
        installation_type: "",
        customer_classification: "",
        price_group: "",
        mrp: "",
        service_partner_basic: ""
    })


    const handleChange = (e) => {
        setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }



    const handleSubmit = (e) => {
        e.preventDefault()

        const data = {
            item_code: "",
            item_description: "",
            product_model: "",
            product_type: "",
            product_class_code: "",
            product_class: "",
            product_line_code: "",
            product_line: "",
            material: "",
            manufacturer: "",
            item_type: "",
            serialized: "",
            size: "",
            crmproducttype: "",
            colour: "",
            handle_type: "",
            serial_identification: "",
            installation_type: "",
            customer_classification: "",
            price_group: "",
            mrp: "",
            service_partner_basic: ""
        }

        axios.post(`${Base_Url}/add_product`, data)
            .then((res) => {

            })
    }


    return (
        <div className="tab-content">
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card col-md-12 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <form
                                onSubmit={handleSubmit}
                             
                                className="text-left row"
                            >

                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Item Code <span className='text-danger'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="item_code"
                                        id="subcatInput"
                                        value={value.item_code}
                                        onChange={handleChange}
                                        placeholder="Enter.."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Item Description <span className='text-danger'>*</span>
                                    </label>
                                    <textarea
                                        type="text"
                                        className="form-control"
                                        name="item_description"
                                        id="subcatInput"
                                        value={value.item_description}
                                        onChange={handleChange}
                                        placeholder="Enter.."
                                    > </textarea>


                                </div>
                                {/* Step 2.1: Category Dropdown */}
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Product Model
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="product_model"
                                        value={value.product_model}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Model</option>

                                        <option key={''} value={''}>

                                        </option>

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Product Type
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="product_type"
                                        value={value.product_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Product Type</option>

                                        <option key={''} value={''}>

                                        </option>

                                    </select>

                                </div>
                                {/* Step 2.2: SubcategoryInput */}
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Sub category
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        id="subcatInput"
                                        value={``}
                                        onChange={handleChange}
                                        placeholder="Enter Subcategory"
                                    />


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
    )
}