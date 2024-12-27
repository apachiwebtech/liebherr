import React from 'react';
import Logo from '../../../images/Liebherr-logo-768x432.png'

const ContactForm = () => {
    return (
        <div className="container my-5 col-md-8 " style={{ fontFamily: 'Arial, sans-serif' }} >
            <div className='mb-3'><img src={Logo} /></div>
            <div className="mb-5">
                <h1 className="">Online service contact form</h1>
            </div>

            <div className="card shadow-sm rounded-0 border-0" style={{ backgroundColor: "#d7d7d7" }}>
                <div className="card-body">
                    <form>

                        <div className="row mb-3 ">
                            <div className="col-md-12">
                                <h5 className="mb-3 fw-bold">Contact Form</h5>

                                <label htmlFor="q1" className="form-label">
                                    Would you recommend the Liebherr brand to your friends and relatives based on your experience? <span className="text-danger">*</span>
                                </label>
                                <div className="container">
                                    <div className="row text-center">
                                        <div className="d-flex">
                                            <div className="flex-fill border-end border-dark py-2 bg-danger text-white">1</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-danger text-white">2</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-danger text-white">3</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-danger text-white">4</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-danger text-white">5</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-danger text-white">6</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-warning text-white">7</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-warning text-white">8</div>
                                            <div className="flex-fill border-end border-dark py-2 bg-success text-white">9</div>
                                            <div className="flex-fill py-2 bg-success text-white">10</div>
                                        </div>
                                    </div>

                                    <div className="row text-center">
                                        <div className="d-flex">
                                            <div className="flex-fill py-1 bg-danger text-white" style={{ flex: "6" }}>Detractors</div>
                                            <div className="flex-fill py-1 bg-warning text-white" style={{ flex: "2" }}>Passives</div>
                                            <div className="flex-fill py-1 bg-success text-white" style={{ flex: "2" }}>Promoters</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label htmlFor="q2" className="form-label">
                                    Remarks / Feedback <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control rounded-0 border border-dark"
                                    id="q2"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label htmlFor="q3" className="form-label">
                                    Help us to serve you better by Rating Service Engineer <span className="text-danger">*</span>
                                </label>
                                <div className="mb-4 p-3">
                                    <h5>Questionnaire - 3</h5>
                                    <p>Help us to serve you better by Rating Service Engineer</p>
                                    <div id="star-rating">
                                        <div className="rating-row">
                                            <span className="star" data-value="1">★</span>
                                        </div>
                                        <div className="rating-row">
                                            <span className="star" data-value="2">★</span>
                                            <span className="star" data-value="3">★</span>
                                        </div>
                                        <div className="rating-row">
                                            <span className="star" data-value="4">★</span>
                                            <span className="star" data-value="5">★</span>
                                            <span className="star" data-value="6">★</span>
                                        </div>
                                        <div className="rating-row">
                                            <span className="star" data-value="7">★</span>
                                            <span className="star" data-value="8">★</span>
                                            <span className="star" data-value="9">★</span>
                                            <span className="star" data-value="10">★</span>
                                        </div>
                                    </div>
                                </div>
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
