import React from "react";
import { Router, useNavigate } from "react-router-dom";
import Jobcardpdf from "./Jobcardpdf";
import { pdf } from '@react-pdf/renderer';
import { Base_Url } from "../../Utils/Base_Url";
import axios from 'axios';
import { useEffect, useState } from 'react';
import MyDocument8 from './MyDocument8';

export function Claimreport(params) {


    const [data, setData] = useState([])

    const Navigate = useNavigate()





    return (
        <div className="row mp0">
            <div className="col-3 ">
                <div className="card mt-3 mb-3">
                    <div className="card-body">
                        Coming Soon
                    </div>
                                 
            </div>

            
        </div>
        
    </div>
    )
}

export default Router