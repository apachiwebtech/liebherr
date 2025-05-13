import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';

export function Faq(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Msl, setMslData] = useState([]);
    const licare_code = localStorage.getItem("licare_code");
    const [formData, setFormData] = useState({
        msp_name: '',
        msp_code: '',
        csp_code: '',
        csp_name: '',
        item: '',
        item_description: '',
        stock: '',



    });

    return (
        <div className="tab-content">
            <div className="row mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ padding: "30px" }}>
                            <p style={{ fontSize: "14px", fontWeight: "500", color: "#555" }}>
                                Frequently Asked Question
                            </p>
                            <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>
                                How can we help you?
                            </h2>

                            <div style={{ borderTop: "1px solid #ddd", padding: "15px 0" }}>
                                <p style={{ margin: 0 }}>What are the main features of your software?</p>
                            </div>

                            <div style={{ borderTop: "1px solid #ddd", padding: "15px 0" }}>
                                <p style={{ margin: 0, fontWeight: "600" }}>
                                    How does your software help businesses succeed?
                                </p>
                                <p style={{ color: "#555", marginTop: "10px" }}>
                                    By offering a suite of powerful tools and features, our software simplifies operations,
                                    boosts productivity, and fosters growth for businesses. From automating tasks to facilitating
                                    seamless collaboration and providing valuable insights, we empower businesses to thrive in
                                    a competitive landscape.
                                </p>
                            </div>

                            <div style={{ borderTop: "1px solid #ddd", padding: "15px 0" }}>
                                <p style={{ margin: 0 }}>What sets your software apart from competitors?</p>
                            </div>

                            <div style={{ borderTop: "1px solid #ddd", padding: "15px 0" }}>
                                <p style={{ margin: 0 }}>Is your software compatible with other tools and platforms?</p>
                            </div>

                            <div style={{ borderTop: "1px solid #ddd", padding: "15px 0" }}>
                                <p style={{ margin: 0 }}>What support options are available to users?</p>
                            </div>

                            <div style={{ borderTop: "1px solid #ddd", padding: "15px 0" }}>
                                <p style={{ margin: 0 }}>How is user data protected and secured?</p>
                            </div>

                            <div style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "15px 0" }}>
                                <p style={{ margin: 0 }}>What resources are available for training and assistance?</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
}
