import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import Lhiusertabs from './Lhiusertabs';

export function CspAccess(params) {
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
            <Lhiusertabs />

            <div className="row mp0">
                <div className="col-4">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='table-responsive'>
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">Csp Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>Dashboard</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>Tickets Listing </td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>Engineering Listing </td>
                                        </tr>
                                        <tr>
                                            <td>4</td>
                                            <td>Quotataion Listing</td>
                                        </tr>
                                        <tr>
                                            <td>5</td>
                                            <td> Create Grn</td>
                                        </tr>
                                        <tr>
                                            <td>6</td>
                                            <td>Grn Inward Listing </td>
                                        </tr>
                                        <tr>
                                            <td>7</td>
                                            <td>Spare OutWard </td>
                                        </tr>
                                        <tr>
                                            <td>8</td>
                                            <td>Grn Outward Listing</td>
                                        </tr>
                                        <tr>
                                            <td>9</td>
                                            <td>Stock </td>
                                        </tr>
                                        <tr>
                                            <td>10</td>
                                            <td>Msl Listing </td>
                                        </tr>
                                        <tr>
                                            <td>11</td>
                                            <td>Grn View</td>
                                        </tr>
                                        <tr>
                                            <td>12</td>
                                            <td> Issue View </td>
                                        </tr>
                                        <tr>
                                            <td>13</td>
                                            <td>Quotation Details </td>
                                        </tr>


                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
