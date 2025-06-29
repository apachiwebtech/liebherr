import React, { useState, useEffect } from "react";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSelector } from 'react-redux';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";
import DatePicker from "react-datepicker";
import CryptoJS from 'crypto-js';
import { Autocomplete, TextField } from "@mui/material";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";

const AnnextureReport = () => {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [startDate, setStartdate] = useState('');
    const [endDate, setEnddate] = useState('');
    const [msp, setMsp] = useState([]);
    const [mspList, setMspList] = useState([]);
    const [loading, setLoading] = useState([]);
    const [data, setL] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedMsp, setSelectedMsp] = useState([]);
    const [error, setError] = useState('');
    const token = localStorage.getItem("token");
    const licare_code = localStorage.getItem("licare_code");

    const columnMapping = {
        TicketNumber: "Ticket Number",
        CreateDate: "Create Date",
        CustomerID: "Customer ID",
        CustomerName: "Customer Name",
        TicketType: "Ticket Type",
        CallCategory: "Call Category",
        CallStatus: "Call Status",
        Address: "Address",
        District: "District",
        City: "City",
        State: "State",
        Pincode: "Pincode",
        csp: "Child Service Partner Code",
        mother_branch: "Liebherr Branch",
        customer_class: "Customer Classification",
        AgeingDays: "Ageing Days",
        serial_no: "Serial Number",
        ModelNumber: "Model Number",
        sales_partner: "Primary Dealer",
        purchase_date: "Purchase Date",
        assigned_to: "Engineer Name",
        updated_date: "Last Updated",
        closed_date: "Field Complete Date",
        created_by: "Create User",
        mode_of_contact: "Mode of Contact",
        updated_by: "Last Modify User",
        final_remark: "Final Remark",
        visit_count: "Count Of Visit",
        child_service_partner: "Child Service Partner Name",
        spare_consumed: "Spare Consumed",
        gas_charges_flag: "Gas Charging",
        msp: "Master Service Partner Code",
        sevice_partner: "Master Service Partner Name",
        sub_call_status: "Call Sub Status",
        productType: "Product Category",
        class_city: "Class Of City",
        age_bracket: "Age Bracket",
        call_charges: "Ticket Charges",
        TotalTicketCharges: "Total Ticket Charges",
        salutation: "Salutation",
        warranty_status: "Warranty Status",
    };

    const columnMapping2 = {
        TicketNumber: "Ticket Number",
        CreateDate: "Create Date",
        CustomerID: "Customer ID",
        CustomerName: "Customer Name",
        State: "State",
        CustomerClassification: "Customer Classification",
        CallStatus: "Call Status",
        FieldCompleteDate: "Field Complete Date",
        ModelNumber: "Model Number",
        SerialNumber: "Serial Number",
        WarrantyType: "Warranty Type",
        ChildServicePartnerCode: "Child Service Partner Code",
        ChildServicePartnerName: "Child Service Partner Name",
        MasterServicePartnerCode: "Master Service Partner Code",
        MasterServicePartnerName: "Master Service Partner Name",
        ItemCode: "Item Code",
        ItemDescription: "Item Description",
        Quantity: "Quantity",
        TypeofApproval: "Type of Approval",
        PartReturnableType: "Part Returnable Type",
        PriceGroup: "Price Group",
        BasicSpareCost: "Basic Spare Cost",
        TotalBasicSpareCost: "Total Basic Spare Cost"
    };



    const fetchMsps = async () => {

        try {
            const response = await axiosInstance.post(`${Base_Url}/getmsplist`, { data: "1" }, {
                headers: {
                    Authorization: token
                },
            });
            setMspList(response.data);
        } catch (error) {
            console.error("Error fetching MSPs:", error);
        }
    };


    useEffect(() => {

        fetchMsps();
    }, []);

    const resetForm = () => {
        setStartdate('');
        setEnddate('');
        setSelectedMsp(null);
        setL([]); // Clear table data if necessary
    };


    const fetchData = async () => {
        setError(''); // Clear any previous errors

        if (!startDate || !endDate) {
            setError('Both start and end dates are required.');
            return;
        }

        if (!selectedMsp) {
            setError('Please select an MSP.');
            return;
        }

        if (startDate > endDate) {
            setError('Start date cannot be later than end date.');
            return;
        }

        const data = {
            startDate: startDate,
            endDate: endDate,
            msp: selectedMsp ? selectedMsp.msp : null,  // Extract msp properly
        };

        try {
            setLoading(true); // Show loading indicator
            const response = await axiosInstance.post(`${Base_Url}/getannexturedata`, data, {
                headers: { Authorization: token },
            });

            const rawData = response.data;

            if (!rawData || rawData.length === 0) {
                setError("No data available for the selected date range.");
                return;
            }

            // Step 4: Map backend data to formatted frontend data
            const dateFields = [
                "CreateDate",
                "purchase_date",
                "updated_date",
                "closed_date"
            ];

            const formattedData = rawData.map(item => {
                const row = {};
                for (const [backendKey, frontendLabel] of Object.entries(columnMapping)) {
                    let value = item[backendKey] ?? "";

                    if (dateFields.includes(backendKey) && value) {
                        value = formatDate2(value); // Apply date formatting
                    }

                    row[frontendLabel] = value;
                }
                return row;
            });

            exportToExcel(formattedData);


        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };
    const fetchData2 = async () => {
        setError(''); // Clear any previous errors

        if (!startDate || !endDate) {
            setError('Both start and end dates are required.');
            return;
        }

        if (!selectedMsp) {
            setError('Please select an MSP.');
            return;
        }

        if (startDate > endDate) {
            setError('Start date cannot be later than end date.');
            return;
        }

        const data = {
            startDate: startDate,
            endDate: endDate,
            msp: selectedMsp ? selectedMsp.msp : null,  // Extract msp properly
        };

        try {
            setLoading(true); // Show loading indicator
            const response = await axiosInstance.post(`${Base_Url}/getannexturereport`, data, {
                headers: { Authorization: token },
            });

            const rawData = response.data;

            if (!rawData || rawData.length === 0) {
                setError("No data available for the selected date range.");
                return;
            }

            // Step 4: Map backend data to formatted frontend data
            const dateFields2 = [
                "CreateDate",
                "FieldCompleteDate",
            ];

            const formattedData = rawData.map(item => {
                const row = {};
                for (const [backendKey, frontendLabel] of Object.entries(columnMapping2)) {
                    let value = item[backendKey] ?? "";

                    if (dateFields2.includes(backendKey) && value) {
                        value = formatDate2(value); // Apply date formatting
                    }

                    row[frontendLabel] = value;
                }
                return row;
            });

            exportToExcel(formattedData);


        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    const exportToExcel = (exceldata) => {
        if (!exceldata || exceldata.length === 0) {
            alert("No data available to export."); // Alert if no data
            return;
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exceldata); // Directly use data

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

        saveAs(dataBlob, "Annexture Report.xlsx");
    };




    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
        const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

        return `${year}-${month}-${day}`;
    };

    const formatDate2 = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
        const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

        return `${day}-${month}-${year}`;
    };

    const handleStartDateChange = (date) => {
        setStartdate(date ? formatDate(date) : '');
    };

    const handleEndDateChange = (date) => {
        setEnddate(date ? formatDate(date) : '');
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
        pageid: String(53)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    return (
        <div className="tab-content">
            {loaders && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 999,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 ?

                <div className="row mp0">
                    <div className="col-12">
                        <div className="card mt-3 mb-3">
                            <div className="card-body">
                                <h5>Annexture   Report :</h5>

                                <div className="mb-3">
                                    <label>Select MSP</label>
                                    <Autocomplete
                                        options={mspList}
                                        getOptionLabel={(option) => option.title || ""}
                                        value={selectedMsp}  // Ensure value is the full object
                                        onChange={(event, newValue) => setSelectedMsp(newValue)} // Store full object
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                placeholder="Select MSP"
                                                fullWidth
                                            />
                                        )}
                                    />

                                </div>
                                <div className="mb-3">
                                    <label>Start Date</label>
                                    <DatePicker
                                        selected={startDate ? new Date(startDate) : null}
                                        onChange={handleStartDateChange}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="DD-MM-YYYY"
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>End Date</label>
                                    <DatePicker
                                        selected={endDate ? new Date(endDate) : null}
                                        onChange={handleEndDateChange}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="DD-MM-YYYY"
                                        className="form-control"
                                    />
                                </div>


                                {error && <p className="text-danger">{error}</p>}
                                <button className="btn btn-primary" onClick={fetchData}>
                                    Tickets Visit Claimed Annexure
                                </button>
                                <button className="btn btn-primary" style={{ marginLeft: '10px' }} onClick={fetchData2}>
                                    Tickets Spares Claimed Annexure
                                </button>
                            </div>
                        </div>
                    </div>
                </div> : null}

        </div>
    );
};

export default AnnextureReport;
