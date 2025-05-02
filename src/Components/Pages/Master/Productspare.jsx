import React, { useState, useEffect } from "react";
import axios from "axios";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { Autocomplete, TextField } from "@mui/material";
import _debounce from "lodash.debounce";
import CryptoJS from "crypto-js";
import * as XLSX from "xlsx";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { useSelector } from 'react-redux';
import Productsparetabs from "./Productsparetabs";

export function Productspare() {
    const [text, setText] = useState("");
    const { loaders, axiosInstance } = useAxiosLoader();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [excelData, setExcelData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [spareParts, setSpareParts] = useState([]); // Store fetched spare parts
    const [modeldata, setModelData] = useState([]);
    const [selectmodel, setSelectedModel] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false); // Track submission
    const token = localStorage.getItem("token");
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchSpareListing(page); // Fetch data for the new page
    };
    const [searchFilters, setSearchFilters] = useState({
        ProductCode: '',
        title: '',
        ItemDescription: ''
    });

    const fetchModelno = async () => {
        try {
            const response = await axiosInstance.post(
                `${Base_Url}/getmodelno`,
                { param: text },
                {
                    headers: { Authorization: token },
                }
            );

            const encryptedData = response.data.encryptedData;
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setModelData(decryptedData);
        } catch (error) {
            console.error("Error fetching models:", error);
        }

    };

    const fetchSpareListing = async (page) => {
        try {
            const params = new URLSearchParams();

            // Add all filters to params
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });
            const item_code = selectmodel.item_code

            console.log('Sending params:', params); // Debug log
            const response = await axiosInstance.get(`${Base_Url}/getsparelisting?${params.toString()}`, {
                params: { item_code, page: page, pageSize: pageSize },
                headers: { Authorization: token },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            console.log("Response data:", decryptedData);
            setSpareParts(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);

        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to fetch spare listing. Please try again.");
            setSpareParts([]);
            setFilteredData([]);
        }
        finally {
            setLoading(false);  // Stop loader after data is loaded or in case of error
        }
    };

    const fetchFilteredData = async () => {
        try {
            const params = new URLSearchParams();

            // Add all filters to params
            Object.entries().forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });
            const item_code = selectmodel.item_code

            console.log('Sending params:', params.toString()); // Debug log

            const response = await axiosInstance.get(`${Base_Url}/getsparelisting?${params}`, {
                params: { item_code },
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setSpareParts(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setFilteredData([]);
        }
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const applyFilters = () => {
        console.log('Applying filters:', searchFilters); // Debug log
        fetchFilteredData();

        setSearchFilters({
            ProductCode: '',
            title: '',
            ItemDescription: ''
        });
    };


    const handleInputChange = _debounce((newValue) => {
        setText(newValue);
        fetchModelno();
    }, 100);

    const handleSearchChange = (newValue) => {


        setSelectedModel(newValue);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!selectmodel) {
            newErrors.ModelNumber = "Model number is required.";
        }
        setErrors(newErrors);
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            return; // Stop execution if there are validation errors
        }

        console.log(selectmodel.item_code, "selectmodel");
        setIsSubmitted(true); // Mark submission as true
        await fetchSpareListing(); // Fetch spare listing
    };

    // export to excel 
    const exportToExcel = async () => {
        // const item_code = selectmodel.item_code
        const response = await axiosInstance.get(`${Base_Url}/getspareexcel`, {
            headers: {
                Authorization: token,
            },
            params: {
                pageSize: totalCount, // Fetch all data
                page: 1, // Start from the first page
            },
        });
        // Create a new workbook
        const decryptedData = CryptoJS.AES.decrypt(response.data.encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
        const allSpareData = JSON.parse(decryptedData);
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(allSpareData.map(user => ({
            "Spare": user.title, // Add fields you want to export
            "ProductCode": user.ProductCode,
            "ModelNumber": user.ModelNumber,
            "ItemDescription": user.ItemDescription,
            "Manufactured": user.Manufactured,
            "BOM Qty": user.BOMQty,
            "PriceGroup": user.PriceGroup,
            "Status": user.Status,
            "ProductType": user.ProductType,
            "Model": user.Model,
            "Index1": user.Index1,
            "PartNature": user.PartNature,
            "Warranty": user.Warranty,
            "HSN": user.HSN,
            "Packed": user.Packed,
            "Returnable": user.Returnable,
            "Product Class": user.ProductClass,
            "Product Line": user.ProductLine,
            "Serialized": user.Serialized
        })));

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "SpareListing");

        // Export the workbook
        XLSX.writeFile(workbook, "SpareListing.xlsx");
    };


    
    const importexcel = (event) => {
        setLoader(true);
        const file = event?.target?.files ? event.target.files[0] : null;

        if (!file) {
            alert("Please upload an Excel file first!");
            setLoader(false);  // Stop loader if no file is selected
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                console.log("Sheet Loaded:", sheet);

                const chunkSize = 70000; // Process in smaller chunks to avoid memory issues
                const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });



                // Column mapping function
                const mapKeys = (obj) => {
                    const keyMapping = {
                        "Product Code": "ProductCode",
                        "Item": "title",
                        "Product Description": "ModelNumber",
                        "Item Description": "ItemDescription",
                        "BOM Qty": "BOMQty",
                        "Price Group": "PriceGroup",
                        "Product Type": "ProductType",
                        "Product Class": "ProductClass",
                        "Product Line": "ProductLine",
                        "Product Nature": "PartNature",
                        "Product Warranty Type": "Warranty",
                        "Product Returnable Type": "Returnable",
                        "Manufacturer": "Manufactured",
                        "Serialized": "Serialized",
                        "Status ": "Status"
                    };

                    return Object.fromEntries(
                        Object.entries(obj).map(([key, value]) => [
                            keyMapping[key] || key.toLowerCase().replace(/\s+/g, "_"),
                            String(value),
                        ])
                    );
                };

                let processedData = [];
                for (let i = 0; i < jsonData.length; i += chunkSize) {
                    const chunk = jsonData.slice(i, i + chunkSize).map(mapKeys);
                    console.log(`Processing chunk ${i / chunkSize + 1}`);
                    processedData.push(...chunk);

                    // Simulate async processing to avoid UI freeze
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }

                setExcelData(processedData);
                console.log("Processed Data:", processedData);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                alert("An error occurred while processing the file.");
            } finally {
                setLoader(false);  // Stop loader after processing completes or if an error occurs
            }
        };

        reader.onerror = () => {
            alert("Failed to read file!");
            setLoader(false);  // Stop loader if file reading fails
        };

        reader.readAsArrayBuffer(file);
    };
    const uploadexcel = () => {
        setLoader(true);



        try {
            // Ensure excelData is converted to JSON string before encryption
            const jsonData = JSON.stringify(excelData);



            axios.post(`${Base_Url}/uploadspareexcel`, { jsonData: jsonData })
                .then((res) => {
                    if (res.data) {
                        alert("Uploaded successfully!");
                    }
                    console.log(res);
                })
                .catch((err) => {
                    console.error("Upload error:", err);
                    alert("Error uploading file. Please try again.");
                })
                .finally(() => {
                    setLoader(false);
                });

        } catch (error) {
            console.error("Encryption error:", error);
            alert("Error during encryption.");
            setLoader(false);
        }
    };

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
        pageid: String(40)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 



    return (
        <div className="row mp0">
            {(loaders || loader) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders || loader} color="#FFFFFF" />
                </div>
            )}
            <Productsparetabs></Productsparetabs>

            {roleaccess > 1 ? <div className="col-4">

                <div className="card mt-3 mb-3">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="row">
                            <div className="mb-3 col-lg-12">
                                <label htmlFor="ModelNumberInput" className="input-field">
                                    Model Number<span className="text-danger">*</span>
                                </label>
                                <Autocomplete
                                    size="small"
                                    disablePortal
                                    options={modeldata}
                                    value={selectmodel}
                                    getOptionLabel={(option) => option.item_description || ""}
                                    onChange={(e, newValue) => handleSearchChange(newValue)}
                                    onInputChange={(e, newInputValue) => handleInputChange(newInputValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Enter Model Number"
                                            variant="outlined"
                                            error={!!errors.ModelNumber}
                                            helperText={errors.ModelNumber}
                                        />
                                    )}
                                />
                            </div>
                            <div className="text-right">
                                <button className="btn btn-primary" type="submit">
                                    Submit
                                </button>
                            </div>

                        </form>




                    </div>
                </div>
                {roleaccess > 2 ? <div className="card mt-3 mb-3">
                    <div className="card-body">
                        <div className="row" style={{ marginTop: '10px' }}>
                            <input type="file" accept=".xlsx, .xls" onChange={importexcel} style={{ width: '230px', marginTop: '5px', marginLeft: '20px' }} />
                            <button className="btn btn-primary" onClick={uploadexcel}
                                style={{ width: '30%' }}>
                                Import Spares
                            </button>
                        </div>


                    </div>
                </div> : null}

            </div> : null}
            <div className="col-8">
                {isSubmitted && spareParts.length > 0 && ( // Show table only after submission
                    <div className="card mt-3 mb-3">
                        <div className="card-body">
                            <div className="row mb-3">

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Product Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="ProductCode"
                                            value={searchFilters.ProductCode}
                                            placeholder="Search by Product Code"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={searchFilters.title}
                                            placeholder="Search by Name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Description </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="ItemDescription"
                                            value={searchFilters.ItemDescription}
                                            placeholder="Search by Description"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                    <div className="form-group">
                                        <button
                                            className="btn btn-primary"
                                            onClick={exportToExcel}
                                            style={{
                                                marginLeft: '5px',
                                            }}
                                        >
                                            Export to Excel
                                        </button>
                                        <button
                                            className="btn btn-primary mr-2"
                                            onClick={applyFilters}
                                            style={{
                                                marginLeft: '5px',
                                            }}
                                        >
                                            Search
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {

                                                applyFilters()
                                            }}
                                            style={{
                                                marginLeft: '5px',
                                            }}
                                        >
                                            Reset
                                        </button>
                                        {filteredData.length === 0 && (
                                            <div
                                                style={{
                                                    backgroundColor: '#f8d7da',
                                                    color: '#721c24',
                                                    padding: '5px 10px',
                                                    marginLeft: '10px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #f5c6cb',
                                                    fontSize: '14px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                No Record Found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>ProductCode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {spareParts.map((spare, index) => {
                                        const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                        return (
                                            <tr key={spare.id}>
                                                <td>{displayIndex}</td>
                                                <td>{spare.title}</td>
                                                <td>{spare.ItemDescription}</td>
                                                <td>{spare.ProductCode}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        setCurrentPage(currentPage - 1)
                                        fetchSpareListing(currentPage - 1)
                                    }}
                                    disabled={currentPage <= 1}
                                    style={{
                                        padding: '8px 15px',
                                        fontSize: '16px',
                                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                                        backgroundColor: currentPage <= 1 ? '#ccc' : '#007bff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        transition: 'background-color 0.3s',
                                    }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => {
                                        setCurrentPage(currentPage + 1)
                                        fetchSpareListing(currentPage + 1)
                                    }}
                                    disabled={currentPage >= totalPages}
                                    style={{
                                        padding: '8px 15px',
                                        fontSize: '16px',
                                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                                        backgroundColor: currentPage >= totalPages ? '#ccc' : '#007bff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        transition: 'background-color 0.3s',
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {isSubmitted && spareParts.length === 0 && (
                    <p>No spare parts available for the selected model.</p>
                )}
            </div>

        </div>
    );
}
