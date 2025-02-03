import React, { useEffect, useState } from 'react';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { Base_Url } from '../../Utils/Base_Url';
import Header from './Header';

export function EngineerStock(params) {
   const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Stockdata, setStockdata] = useState([]);
    const licare_code = localStorage.getItem("userid");



    const fetchStock = async (page) => {
        try {

            const response = await axiosInstance.get(`${Base_Url}/getengstock/${licare_code}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setStockdata(response.data);
        } catch (error) {
            console.error('Error fetching Stockdata:', error);
            setStockdata([]);
        }
    };


    useEffect(() => {
        fetchStock();
    }, []);





    return (
        <div className="tab-content">
            <Header />
            <div className="row mt-5">

                <div className="col-md-6 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className='table-responsive'>
                                <table id="" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">Product Name</th>
                                            <th width="20%">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Stockdata.map((item, index) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.productname}</td>
                                                    <td>{item.stock_quantity}</td>
                                                </tr>
                                            )
                                        })}

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
