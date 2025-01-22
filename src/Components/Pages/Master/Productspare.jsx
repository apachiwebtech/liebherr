import React, { useState } from "react";
import axios from "axios";
import { Base_Url } from "../../Utils/Base_Url";
import { Autocomplete, TextField } from "@mui/material";
import _debounce from "lodash.debounce";

export function Productspare() {
    const [text, setText] = useState("");
    const [errors, setErrors] = useState({});
    const [spareParts, setSpareParts] = useState([]); // Store fetched spare parts
    const [modeldata, setModelData] = useState([]);
    const [selectmodel, setSelectedModel] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false); // Track submission
    const token = localStorage.getItem("token");

    const fetchModelno = async () => {
        try {
            const response = await axios.post(
                `${Base_Url}/getmodelno`,
                { param: text },
                {
                    headers: { Authorization: token },
                }
            );
            setModelData(response.data);
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    const fetchSpareListing = async () => {
        try {
            const ModelNumber = selectmodel.ModelNumber
            console.log("Fetching spare parts for model number:", ModelNumber);
            const response = await axios.get(`${Base_Url}/getsparelisting`, {
                params: { ModelNumber },
                headers: { Authorization: token },
            });
            console.log("Response data:", response.data);
            setSpareParts(response.data);
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
        console.log(selectmodel.ModelNumber,"selectmodel");
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitted(true); // Mark submission as true
            await fetchSpareListing(); // Fetch spare listing
        }
    };


    return (
        <div className="row mp0">
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
                    </div>
                </div>
            </div>
            <div className="col-8">
                {isSubmitted && spareParts.length > 0 && ( // Show table only after submission
                    <div className="card mt-3 mb-3">
                        <div className="card-body">
                            <h5>Spare Parts Listing</h5>
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
                                    {spareParts.map((spare,index) => (
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
