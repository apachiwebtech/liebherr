import React, { useState } from "react";
import axios from "axios";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { Autocomplete, TextField } from "@mui/material";
import _debounce from "lodash.debounce";
import CryptoJS from "crypto-js";
import * as XLSX from "xlsx";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";

export function Productspare() {
    const [text, setText] = useState("");
    const { loaders, axiosInstance } = useAxiosLoader();
    const [errors, setErrors] = useState({});
    const [excelData, setExcelData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [spareParts, setSpareParts] = useState([]); // Store fetched spare parts
    const [modeldata, setModelData] = useState([]);
    const [selectmodel, setSelectedModel] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false); // Track submission
    const token = localStorage.getItem("token");

    const fetchModelno = async () => {
        try {
            const response = await axiosInstance.post(
                `${Base_Url}/getmodelno`,
                { param: text },
                {
                    headers: { Authorization: token },
                }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setModelData(decryptedData);
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    const fetchSpareListing = async () => {
        try {
            const ModelNumber = selectmodel.ModelNumber
            console.log("Fetching spare parts for model number:", ModelNumber);
            const response = await axiosInstance.get(`${Base_Url}/getsparelisting`, {
                params: { ModelNumber },
                headers: { Authorization: token },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            console.log("Response data:", decryptedData);
            setSpareParts(decryptedData);
        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to fetch spare listing. Please try again.");
        }
    };


    const handleInputChange = _debounce((newValue) => {
        setText(newValue);
        fetchModelno();
    }, 200);

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

        console.log(selectmodel.ModelNumber, "selectmodel");
        setIsSubmitted(true); // Mark submission as true
        await fetchSpareListing(); // Fetch spare listing
    };

    // export to excel 
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(spareParts.map(user => ({
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
                        "Price Group":"PriceGroup",
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



    return (
        <div className="row mp0">
            {(loaders || loader) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders || loader} color="#FFFFFF" />
                </div>
            )}
            <div className="col-4">
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
                                    getOptionLabel={(option) => option.ModelNumber || ""}
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
                        {isSubmitted && (
                            <div className="row" style={{marginTop:'10px'}}>
                                <input type="file" accept=".xlsx, .xls" onChange={importexcel} style={{ width: '230px', marginTop: '5px', marginLeft: '90px' }} />
                                <button className="btn btn-primary" onClick={uploadexcel}
                                    style={{ width: '30%' }}>
                                    Import Spares
                                </button>
                            </div>

                        )}
                    </div>
                </div>
            </div>
            <div className="col-8">
                {isSubmitted && spareParts.length > 0 && ( // Show table only after submission
                    <div className="card mt-3 mb-3">
                        <div className="card-body">
                            <div className="row">
                                <h5 style={{ width: "200px" }}>Spare Parts Listing</h5>

                                <button
                                    className="btn btn-primary"
                                    onClick={exportToExcel}
                                    style={{ width: "20%", marginLeft: '560px' }}
                                >
                                    Export to Excel
                                </button>
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
                                    {spareParts.map((spare, index) => (
                                        <tr key={spare.id}>
                                            <td>{index + 1}</td>
                                            <td>{spare.title}</td>
                                            <td>{spare.ItemDescription}</td>
                                            <td>{spare.ProductCode}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
