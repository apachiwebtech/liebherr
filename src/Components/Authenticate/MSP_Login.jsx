import axios from "axios";
import { Base_Url } from "../Utils/Base_Url";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import md5 from "js-md5";
import logo from  '../../images/Liebherr-logo-768x432.png'
import back from '../../images/login.jpeg'

export function MSP_Login() {
    const [title, settitle] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Login submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const hashpass = md5(password)
           
            const response = await axios.post(`${Base_Url}/loginmsp`, {
                title: title,
                password: hashpass,
            });

          
            if (response.data) {
                localStorage.setItem("userId", response.data.id);
                localStorage.setItem("title", response.data.title);

                // Navigate to the home page
                navigate('/');
            } else {
                alert("Invalid username or password");
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed, please check your credentials.");
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-4">
                    <div className="pt-5 p-5 pb-0 mt-5">
                        <h1 className="h4 text-gray-900 mb-4">
                            <img src={logo} style={{ width: '130px', height: '50px' }} alt="Logo" />
                        </h1>
                    </div>

                    <div className="pt-0 pl-5 pr-5" style={{ maxWidth: "450px" }}>
                        <form onSubmit={handleSubmit} className="user p-5 pt-0 pb-0" method="POST">
                            <div className="form-group mb-3">
                                Master Franchise User
                                <input
                                    type="tel"
                                    style={{ borderRadius: '5px' }}
                                    name="title"
                                    className="form-control form-control-user"
                                    placeholder="Enter Username..."
                                    value={title}
                                    onChange={(e) => settitle(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                Password
                                <input
                                    type="password"
                                    style={{ borderRadius: '5px' }}
                                    name="password"
                                    className="form-control form-control-user"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                className="btn btn-liebherr btn-user btn-block width100"
                                type="submit"
                                name="login"
                                id="login"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
                <div className="col-md-8" style={{
                    height: "100vh",
                    backgroundImage: `url(${back})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                }}>
                    &nbsp;
                </div>
            </div>
        </div>
    );
}
