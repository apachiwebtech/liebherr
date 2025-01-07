import React from "react";
import {  Router, useNavigate } from "react-router-dom";

export function Claimreport(params) {
    
    const Navigate = useNavigate()
    const handleSubmit= ()=> {
        Navigate('/claimreport')
    }

    return(
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