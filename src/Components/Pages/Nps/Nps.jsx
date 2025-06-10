import React from 'react';
import Logo from '../../../images/Liebherr-logo-768x432.png'
import Rating from '@mui/material/Rating';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';

const ContactForm = () => {
    const token = localStorage.getItem("token");
    const [searchParams] = useSearchParams();
    const encryptedTicket = searchParams.get('ticket');

    const [ticketNo, setTicketNo] = useState("");
    const [formState, setFormState] = useState({
        rating1: 0,
        remark: "",
        rating2: 0
    });
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState("");

    // Decrypt ticket number from query param
    useEffect(() => {
        if (encryptedTicket) {
            setTicketNo(encryptedTicket); // No decryption, just set directly
        }
    }, [encryptedTicket]);


    let rating1Style = "";
    if (formState.rating1 <= 6) {
        rating1Style = 'bg-danger text-white';
    } else if (formState.rating1 <= 8) {
        rating1Style = 'bg-warning text-white';
    } else {
        rating1Style = 'bg-success text-white';
    }

    const validateForm = () => {
        let isValid = true;
        if (!formState.rating1) {
            isValid = false;
            setErrors((prev) => ({ ...prev, rating1: "Rating is required" }));
        }
        if (!formState.rating2) {
            isValid = false;
            setErrors((prev) => ({ ...prev, rating2: "Rating is required" }));
        }
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setServerError("");

        if (validateForm()) {
            const data = {
                rating1: String(formState.rating1),
                remark: String(formState.remark),
                rating2: formState.rating2,
                ticketNo: ticketNo
            };

            axios.post(`${Base_Url}/awt_service_contact`, data, {
                headers: {
                    Authorization: token,
                    'x-api-key': 'a8f2b3c4-d5e6-7f8g-h9i0-12345jklmn67'
                }
            })
                .then((res) => {
                    setIsSubmitted(true);
                    window.alert("Data submitted successfully");
                })
                .catch((err) => {
                    setServerError(err.response?.data?.message || "Already Submitted Your Response");
                });
        }
    };


    useEffect(() => {
        if (ticketNo) {
            axios.get(`${Base_Url}/awt_service_contact/check`, {
                params: { ticketNo },
                headers: {
                    Authorization: token,
                    'x-api-key': 'a8f2b3c4-d5e6-7f8g-h9i0-12345jklmn67'
                }
            })
                .then((res) => {
                    if (res.data.exists) {
                        setIsSubmitted(true);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [ticketNo, token]);

    return (
        // ⬇️ Unchanged full JSX form code remains same
        <div className="container my-5 col-md-8" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className='mb-3'><img src={Logo} alt="Liebherr Logo" /></div>
            <div className="card shadow-sm rounded-0 border-0" style={{ backgroundColor: "#d7d7d7" }}>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <h5 className="mb-3 fw-bold">Feedback Form</h5>
                        {serverError && <p className="text-danger">{serverError}</p>}

                        <label htmlFor="q1" className="form-label">
                            Would you recommend the Liebherr brand to your friends and relatives based on your experience? <span className="text-danger">*</span>
                        </label>
                        <div className="container">
                            <div className="row text-center">
                                <div className="d-flex px-0">
                                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                        <div
                                            key={num}
                                            className={`${num !== 10 ? "border-end border-dark" : ""} py-2 ${num <= formState.rating1
                                                ? rating1Style
                                                : 'bg-white text-black'
                                                }`}
                                            onClick={() =>
                                                setFormState((prev) => ({ ...prev, rating1: num }))
                                            }
                                            style={{ flex: 1, cursor: 'pointer' }}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {errors.rating1 && <p className='text-danger mt-1'>{errors.rating1}</p>}

                        <label htmlFor="q2" className="form-label mt-3">Remarks / Feedback</label>
                        <textarea
                            id='q2'
                            className='form-control rounded-0 border border-dark'
                            rows={5}
                            value={formState.remark}
                            onChange={(e) => setFormState((prev) => ({ ...prev, remark: e.target.value }))}
                        ></textarea>

                        <label htmlFor="q3" className="form-label mt-3">
                            Help us to serve you better by Rating Service Engineer <span className="text-danger">*</span>
                        </label>
                        <div id="star-rating" className="mt-2">
                            <Rating
                                name="rating2"
                                value={formState.rating2}
                                onChange={(event, newValue) => {
                                    setFormState((prev) => ({ ...prev, rating2: newValue }));
                                }}
                            />
                        </div>
                        {errors.rating2 && <p className='text-danger mt-1'>{errors.rating2}</p>}

                        <div className="mt-4">
                            <button type="submit" className="btn btn-primary" disabled={isSubmitted}>
                                {isSubmitted ? "Form Already Submitted" : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
