import React from "react";
import { Router, useNavigate } from "react-router-dom";
import Jobcardpdf from "./Jobcardpdf";
import { pdf } from '@react-pdf/renderer';
import { Base_Url } from "../../Utils/Base_Url";
import axios from 'axios';
import { useEffect, useState } from 'react';

export function Claimreport(params) {


    const [data, setData] = useState([])

    const Navigate = useNavigate()
    const handleSubmit = () => {
        Navigate('/claimreport')
    }

    async function downloadPDF(id) {


        axios.post(`${Base_Url}/getprintinfo`, { id: id })
            .then((res) => {
                console.log(res.data[0], "DDD")
                setData(res.data[0])

                Blob(res.data[0])

            })
            .catch((err) => {
                console.log(err)
            })
    }


    const Blob = async (data) => {

        try {
            const blob = await pdf(<Jobcardpdf data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error generating PDF:', err);
        }
    };

    return (
        <div className="row mp0">
            <div className="col-3 ">
                <div className="card mt-3 mb-3">
                    <div className="card-body">
                        Coming Soon
                    </div>
                    <button type="submit" class="btn btn-primary mr-2"  onClick={() => downloadPDF()}>Submit</button>
              
            </div>

            
        </div>
        
    </div>
    )
}

export default Router