import React from "react";
import {  useNavigate } from "react-router-dom";

export function Login(params) {

    const Navigate = useNavigate()
    const handleSubmit= ()=> {
        Navigate('/')
    }
 
    return(
        <div className="container-fluid">

       <div className="row">
           <div className="col-md-4">

               <div className="pt-5 p-5 pb-0 mt-5">
                   <h1 className="h4 text-gray-900 mb-4">
                       <img src="images/blum.png.png" style={{width:'130px', height:'50px'}} /> 
                   </h1>
                   
               </div>

               <div className="pt-0 pl-5 pr-5" style={{maxWidth:"450px"}}>
                   
                   <form onSubmit={()=> handleSubmit()} className="user p-5 pt-0 pb-0"  method="POST">
                       <div className="form-group mb-3">
                           <input type="tel" style={{borderRadius:'5px'}} name="username" className="form-control form-control-user"
                               id="exampleInputEmail" aria-describedby="emailHelp"
                               placeholder="Enter Mobile No..." />
                       </div>
                       <div className="form-group mb-3">
                            <input type="password" style={{borderRadius:'5px'}} name="password" className="form-control form-control-user"
                               id="exampleInputPassword" placeholder="Password" />
                       </div>
                       
                       <button className="btn btn-liebherr btn-user btn-block width100" type="submit" name="login" id="login">
                           Login
                       </button>
   
                       <p style={{margintop: '20px' , textalign: "center"}}></p>
                   </form>
                   
               </div>

           </div>
           <div className="col-md-8" style={{height:"100vh",backgroundImage:"url(images/login.jpeg)",backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
               &nbsp;
           </div>
       </div>



   </div>
    )
}

