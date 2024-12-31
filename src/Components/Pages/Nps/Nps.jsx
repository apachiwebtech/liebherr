import React from 'react';
import Logo from '../../../images/Liebherr-logo-768x432.png'
import Rating from '@mui/material/Rating';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';

const ContactForm = () => {
    const [formState, setFormState] = useState({
        rating1: 0,
        remark:"",
        rating2:0
    })
    const [errors,setErrors] = useState({})
    let {email, customerId, ticketNo} = useParams()
    
    try {
        email = email.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(email, secretKey);
        email = bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.log("Error",error)
    }

    try {
        customerId = customerId.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(customerId, secretKey);
        customerId = bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.log("Error",error)
    }

    try {
        ticketNo = ticketNo.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(ticketNo, secretKey);
        ticketNo = bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.log("Error",error)
    }
    console.log(email, ticketNo, customerId)


    let rating1Style="";
    if(formState.rating1 <= 6){
        rating1Style = 'bg-danger text-white';
    }else if(formState.rating1 <= 8){
        rating1Style = 'bg-warning text-white';
    }else{
        rating1Style = 'bg-success text-white';
    }

    const validateForm = ()=>{
        let isValid = true
        if(!formState.rating1){
            isValid = false;
            setErrors((prev)=>({...prev, rating1:"Rating is required"}))
        }
        if(!formState.remark){
            isValid = false;
            setErrors((prev)=>({...prev, remark:"Remark is required"}))
        }
        if(!formState.rating2){
            isValid = false;
            setErrors((prev)=>({...prev, rating2:"Rating is required"}))
        }
        return isValid;
    }

    const handleSubmit = (e)=>{
        e.preventDefault();
        setErrors({})
        if(validateForm()){
            
            const data = {
                rating1:formState.rating1,
                remark: formState.remark,
                rating2: formState.rating2,
                email: email,
                ticketNo: ticketNo,
                customerId: customerId
            }
            axios.post(`${Base_Url}/awt_service_contact`,data)
            .then((res)=>{
                console.log(res);
                setFormState({
                    rating1: 0,
                    remark:"",
                    rating2:0
                })
            })
            .catch((err)=>console.log(err))
        }
    }

    return (
        <div className="container my-5 col-md-8 " style={{ fontFamily: 'Arial, sans-serif' }} >
            <div className='mb-3'><img src={Logo} /></div>
            <div className="mb-5">
                <h1 className="">Online service contact form</h1>
            </div>

            <div className="card shadow-sm rounded-0 border-0" style={{ backgroundColor: "#d7d7d7" }}>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3 ">
                            <div className="col-md-12">
                                <h5 className="mb-3 fw-bold">Contact Form</h5>

                                <label htmlFor="q1" className="form-label">
                                    Would you recommend the Liebherr brand to your friends and relatives based on your experience? <span className="text-danger">*</span>
                                </label>
                                <div className="container">
                                    <div className="row text-center">
                                        <div className="d-flex px-0">
                                        {
                                            Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                                <div
                                                    key={num}
                                                    className={`${num!= 10?"border-end border-dark":"" } py-2 ${
                                                        num <= formState.rating1
                                                            ? rating1Style
                                                            : 'bg-white text-black'
                                                    }`}
                                                    onClick={() =>
                                                        setFormState((prev) => ({ ...prev, rating1: num }))
                                                    }
                                                    style={{ flex: 1 }}
                                                >
                                                    {num}
                                                </div>
                                            ))
                                        }
                                        </div>
                                    </div>

                                    <div className="row text-center">
                                        <div className="d-flex px-0">
                                            <div className=" py-1 bg-danger text-white" style={{ flex: 6 }}>Detractors</div>
                                            <div className=" py-1 bg-warning text-white" style={{ flex: 2 }}>Passives</div>
                                            <div className=" py-1 bg-success text-white" style={{ flex: 2 }}>Promoters</div>
                                        </div>
                                    </div>
                                </div>
                                {errors.rating1&&<p className='text-danger mt-1'>{errors.rating1}</p>}
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label htmlFor="q2" className="form-label">
                                    Remarks / Feedback <span className="text-danger">*</span>
                                </label>
                                <textarea id='q2' className='form-control rounded-0 border border-dark' rows={5} value={formState.remark}
                                    onChange={(e)=>setFormState((prev)=>({...prev,remark:e.target.value}))}>
                                </textarea>
                                {errors.remark&&<p className='text-danger mt-1'>{errors.remark}</p>}
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label htmlFor="q3" className="form-label">
                                    Help us to serve you better by Rating Service Engineer <span className="text-danger">*</span>
                                </label>
                                <div className="">
                                    
                                    
                                    <div id="star-rating">
                                        <Rating
                                            name="simple-controlled"
                                            value={formState.rating2}
                                            onChange={(event, newValue) => {
                                              setFormState((prev)=>({...prev,rating2:newValue}))
                                            }}
                                        />
                                    </div>
                                </div>
                                {errors.rating2&&<p className='text-danger mt-1'>{errors.rating2}</p>}
                            </div>
                        </div>

                        <div className="mt-4">
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
