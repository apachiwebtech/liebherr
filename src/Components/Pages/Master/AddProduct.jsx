import axios from 'axios';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import { IoArrowBack, IoArrowBackCircle } from "react-icons/io5";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';


export function AddProduct(params) {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [error, setError] = useState({})
    const [product_type, setProducttype] = useState([])
    const [product_line, setProductLine] = useState([])
    const [material, setMaterial] = useState([])
    const [facturer, setManufacturer] = useState([])

   const token = localStorage.getItem("token");

    const [itemtype, setItemtype] = useState([])
    const [productclass, setPrductclass] = useState([])
    const navigate = useNavigate()
    const { productid } = useParams()

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

    const validateForm = () => {
        let isValid = true
        const newErrors = {}


        if (!value.item_code) {
            isValid = false;
            newErrors.item_code = "Code is required"
        }
        if (!value.item_description) {
            isValid = false;
            newErrors.item_description = "Description is required"
        }
        if (!value.product_model) {
            isValid = false;
            newErrors.product_model = "Model is required"
        }
        if (!value.product_type) {
            isValid = false;
            newErrors.product_type = "Product Type is required"
        }
        if (!value.product_class_code) {
            isValid = false;
            newErrors.product_class_code = "Class code is required"
        }
        if (!value.product_line_code) {
            isValid = false;
            newErrors.product_line_code = "Line code is required"
        }
        if (!value.material) {
            isValid = false;
            newErrors.material = "Material is required"
        }
        if (!value.manufacturer) {
            isValid = false;
            newErrors.manufacturer = "Manufacturer is required"
        }
        if (!value.item_type) {
            isValid = false;
            newErrors.item_type = "Item Type is required"
        }
        if (!value.serialized) {
            isValid = false;
            newErrors.serialized = "Serialized is required"
        }
        if (!value.size) {
            isValid = false;
            newErrors.size = "Size is required"
        }
        if (!value.crmproducttype) {
            isValid = false;
            newErrors.crmproducttype = "Crmproduct type is required"
        }
        if (!value.handle_type) {
            isValid = false;
            newErrors.handle_type = "Handle type is required"
        }
        if (!value.serial_identification) {
            isValid = false;
            newErrors.serial_identification = "Serial Identification is required"
        }
        if (!value.installation_type) {
            isValid = false;
            newErrors.installation_type = "Insatallation Type is required"
        }


        setError(newErrors)
        return isValid
    }

    // functions

    async function getproducttype() {
        axiosInstance.get(`${Base_Url}/product_type`
,{
                headers: {
                  Authorization: token, // Send token in headers
                },
              })
            .then((res) => {
                setProducttype(res.data)
            })
    }

    async function getproductline() {
        axiosInstance.get(`${Base_Url}/fetchproductline`,{
            headers: {
              Authorization: token, // Send token in headers
            },
          })
            .then((res) => {
                setProductLine(res.data)
            })
    }
    async function getmaterial() {
        axiosInstance.get(`${Base_Url}/fetchmaterial`
,{
                headers: {
                  Authorization: token, // Send token in headers
                },
              })
            .then((res) => {
                setMaterial(res.data)
            })
    }
    async function getItemtype() {
        axiosInstance.get(`${Base_Url}/fetchitemtype`,{
            headers: {
              Authorization: token, // Send token in headers
            },
          })
            .then((res) => {
                setItemtype(res.data)
            })
    }
    async function getproductclass() {
        axiosInstance.get(`${Base_Url}/fetchproductclass`,{
            headers: {
              Authorization: token, // Send token in headers
            },
          })
            .then((res) => {
                setPrductclass(res.data)
            })
    }
    async function getmanufacturer() {
        axiosInstance.get(`${Base_Url}/fetchmanufacturer`,{
            headers: {
              Authorization: token, // Send token in headers
            },
          })
            .then((res) => {
                setManufacturer(res.data)
            })
    }
    async function updatedata() {
        const data = {
            productid: productid
        }
        axiosInstance.post(`${Base_Url}/getupdateparam`, data,{
            headers: {
              Authorization: token, // Send token in headers
            },
          })
            .then((res) => {
                setValue({
                    item_code: res.data[0].item_code,
                    item_description: res.data[0].item_description,
                    product_model: res.data[0].product_model,
                    product_type: res.data[0].productType,
                    product_class_code: res.data[0].productClassCode,
                    product_class: res.data[0].productClass,
                    product_line_code: res.data[0].productLineCode,
                    product_line: res.data[0].product_line,
                    material: res.data[0].material,
                    manufacturer: res.data[0].manufacturer,
                    item_type: res.data[0].itemType,
                    serialized: res.data[0].serialized,
                    size: res.data[0].sizeProduct,
                    crmproducttype: res.data[0].crm_productType,
                    colour: res.data[0].color,
                    handle_type: res.data[0].handleType,
                    serial_identification: res.data[0].serial_no,
                    installation_type: res.data[0].installationType,
                    customer_classification: res.data[0].customerClassification,
                    price_group: res.data[0].price_group,
                    mrp: res.data[0].mrp,
                    service_partner_basic: res.data[0].service_partner_basic
                })
            })
    }




    useEffect(() => {
        getproducttype()
        getproductline()
        getmaterial()
        getItemtype()
        getproductclass()
        getmanufacturer()

        if (productid != ":productid") {
            updatedata()

        }
    }, [])


    const handleChange = (e) => {
        setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }



    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            const data = {
                item_code: value.item_code || "",
                item_description: value.item_description || "",
                product_model: value.product_model || "",
                product_type: value.product_type || "",
                product_class_code: value.product_class_code || "",
                product_class: value.product_class || "",
                product_line_code: value.product_line_code || "",
                product_line: value.product_line || "",
                material: value.material || "",
                manufacturer: value.manufacturer || "",
                item_type: value.item_type || "",
                serialized: value.serialized || "",
                size: value.size || "",
                crmproducttype: value.crmproducttype || "",
                colour: value.colour || "",
                handle_type: value.handle_type || "",
                serial_identification: value.serial_identification || "",
                installation_type: value.installation_type || "",
                customer_classification: value.customer_classification || "",
                price_group: value.price_group || "",
                mrp: value.mrp || "",
                service_partner_basic: value.service_partner_basic || "",
                uid:productid

            }

            if (productid != ":productid") {
                axiosInstance.post(`${Base_Url}/updateProduct`, data,{
                    headers: {
                      Authorization: token, // Send token in headers
                    },
                  }
    )
                    .then((res) => {
                        alert("Data Submitted Successfully")
                        setValue({
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
                    })
            }else{
                axiosInstance.post(`${Base_Url}/addProduct`, data,{
                    headers: {
                      Authorization: token, // Send token in headers
                    },
                  }
    )
                .then((res) => {
                    alert("Data Submitted Successfully")
                    setValue({
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
                })
            }


        }

    }


    return (
        <div className="tab-content">
              {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card col-md-12 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='py-2'>
                                <IoArrowBackCircle onClick={() => navigate(-1)} style={{ fontSize: "30px" }} />
                            </div>
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
                                        Item Code <span className='text-danger'>*</span>{error.item_code && <sapn className="text-danger">{error.item_code}</sapn>}
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
                                <div className="form-group col-lg-6">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Item Description <span className='text-danger'>*</span>{error.item_description && <sapn className="text-danger">{error.item_description}</sapn>}
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
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Product Model<span className='text-danger'>*</span>{error.product_model && <sapn className="text-danger">{error.product_model}</sapn>}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="product_model"
                                        id="subcatInput"
                                        value={value.product_model}
                                        onChange={handleChange}
                                        placeholder="Enter.."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Product Type<span className='text-danger'>*</span>{error.product_type && <sapn className="text-danger">{error.product_type}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="product_type"
                                        value={value.product_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Product Type</option>

                                        {product_type.map((item) => {
                                            return (
                                                <option value={item.product_type}>{item.product_type}</option>
                                            )
                                        })}

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Product Class Code<span className='text-danger'>*</span>{error.product_class_code && <sapn className="text-danger">{error.product_class_code}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="product_class_code"
                                        value={value.product_class_code}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Product Class Code</option>

                                        {productclass.map((item) => {
                                            return (
                                                <option value={item.class_code}>{item.class_code + "--" + item.product_class}</option>
                                            )
                                        })}

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Product Line Code<span className='text-danger'>*</span>{error.product_line_code && <sapn className="text-danger">{error.product_line_code}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="product_line_code"
                                        value={value.product_line_code}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select  Product Line Code</option>

                                        {product_line.map((item) => {
                                            return (
                                                <option value={item.pline_code}>{item.pline_code + '--' + item.product_line}</option>
                                            )
                                        })}

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Material<span className='text-danger'>*</span>{error.material && <sapn className="text-danger">{error.material}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="material"
                                        value={value.material}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Material</option>
                                        {material.map((item) => {
                                            return (
                                                <option value={item.Material}>{item.Material}</option>
                                            )
                                        })}

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Manufacturer<span className='text-danger'>*</span>{error.manufacturer && <sapn className="text-danger">{error.manufacturer}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="manufacturer"
                                        value={value.manufacturer}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Material</option>
                                        {facturer.map((item) => {
                                            return (
                                                <option value={item.Manufacturer}>{item.Manufacturer}</option>
                                            )
                                        })}

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Item Type<span className='text-danger'>*</span>{error.item_type && <sapn className="text-danger">{error.item_type}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="item_type"
                                        value={value.item_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Item Type</option>
                                        {itemtype.map((item) => {
                                            return (
                                                <option value={item.title}>{item.title}</option>
                                            )
                                        })}

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Serialized<span className='text-danger'>*</span>{error.serialized && <sapn className="text-danger">{error.serialized}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="serialized"
                                        value={value.serialized}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Item Type</option>

                                        <option value={'Yes'}>
                                            Yes
                                        </option>
                                        <option value={'No'}>
                                            No
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
                                        Size<span className='text-danger'>*</span>{error.size && <sapn className="text-danger">{error.size}</sapn>}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="size"
                                        id="size"
                                        value={value.size}
                                        onChange={handleChange}
                                        placeholder="Enter .."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        CRM Product Type<span className='text-danger'>*</span>{error.crmproducttype && <sapn className="text-danger">{error.crmproducttype}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="crmproducttype"
                                        value={value.crmproducttype}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Item Type</option>
                                        <option value="Finishgoods">Finish Goods</option>




                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Colour
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="colour"
                                        id="colour"
                                        value={value.colour}
                                        onChange={handleChange}
                                        placeholder="Enter .."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Handle Type<span className='text-danger'>*</span>{error.handle_type && <sapn className="text-danger">{error.handle_type}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="handle_type"
                                        value={value.handle_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Handle Type</option>

                                        <option value={'Freestanding'}>FREE STANDING
                                        </option>
                                        <option value={'Hardline'}>HARDLINE
                                        </option>
                                        <option value={'Pocket'}>POCKET (VERTICAL)
                                        </option>
                                        <option value={'Liverhandle'}>LEVER HANDLE
                                        </option>

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Serial Identification<span className='text-danger'>*</span>{error.serial_identification && <sapn className="text-danger">{error.serial_identification}</sapn>}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="serial_identification"
                                        id="colour"
                                        value={value.serial_identification}
                                        onChange={handleChange}
                                        placeholder="Enter .."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="category"
                                        className="form-label pb-0 dropdown-label"
                                    >
                                        Installation Type<span className='text-danger'>*</span>{error.installation_type && <sapn className="text-danger">{error.installation_type}</sapn>}
                                    </label>
                                    <select
                                        className="form-select dropdown-select"
                                        name="installation_type"
                                        value={value.installation_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Installation Type</option>

                                        <option value={'Yes'}>
                                            Yes
                                        </option>
                                        <option value={'No'}>
                                            No
                                        </option>

                                    </select>

                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Customer Classification
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="customer_classification"
                                        id="colour"
                                        value={value.customer_classification}
                                        onChange={handleChange}
                                        placeholder="Enter .."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Price Group
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="price_group"
                                        id="price_group"
                                        value={value.price_group}
                                        onChange={handleChange}
                                        placeholder="Enter .."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        MRP
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="mrp"
                                        id="mrp"
                                        value={value.mrp}
                                        onChange={handleChange}
                                        placeholder="Enter .."
                                    />


                                </div>
                                <div className="form-group col-lg-3">
                                    <label
                                        htmlFor="regionInput"
                                        className="input-field"
                                        style={{ marginBottom: "15px", fontSize: "18px" }}
                                    >
                                        Service Partner Basic
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="service_partner_basic"
                                        id="mrp"
                                        value={value.service_partner_basic}
                                        onChange={handleChange}
                                        placeholder="Enter .."
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
