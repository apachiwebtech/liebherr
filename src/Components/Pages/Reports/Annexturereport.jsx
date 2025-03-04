import React, { useState, useEffect } from "react";
import { Base_Url } from "../../Utils/Base_Url";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";
import DatePicker from "react-datepicker";
import { Autocomplete, TextField } from "@mui/material";

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

    useEffect(() => {
        const fetchMsps = async () => {
            
            try {
                const response = await axiosInstance.post(`${Base_Url}/getmsplist`, {
                    headers: { Authorization: token },
                });
                setMspList(response.data);
            } catch (error) {
                console.error("Error fetching MSPs:", error);
            }
        };

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

            console.log("API Response:", response.data);

            if (response.data && response.data.length > 0) {
                setColumns(Object.keys(response.data[0])); // Extract column names

                await exportToExcel(response.data); // Export data to Excel

                // Reset form only after successful processing
                resetForm();
            } else {
                setError("No data available for the selected date range.");
            }

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

            console.log("API Response:", response.data);

            if (response.data && response.data.length > 0) {
                setColumns(Object.keys(response.data[0])); // Extract column names

                await exportToExcel(response.data); // Export data to Excel

                // Reset form only after successful processing
                resetForm();
            } else {
                setError("No data available for the selected date range.");
            }

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

        saveAs(dataBlob, "ExportedData.xlsx");
    };




    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
        const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

        return `${year}-${month}-${day}`;
    };

    const handleStartDateChange = (date) => {
        setStartdate(date ? formatDate(date) : '');
    };

    const handleEndDateChange = (date) => {
        setEnddate(date ? formatDate(date) : '');
    };

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

            <div className="row mp0">
                <div className="col-12">
                    <div className="card mt-3 mb-3">
                        <div className="card-body">

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
                                Annexture Report 1
                            </button>
                            <button className="btn btn-primary" style={{ marginLeft: '10px' }} onClick={fetchData2}>
                                Annexture Report 2
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AnnextureReport;
