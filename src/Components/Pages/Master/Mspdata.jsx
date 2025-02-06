import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Base_Url } from "../../Utils/Base_Url";
import axios from "axios";

export function Mspdata(params) {
  const Navigate = useNavigate()
  const [data, setdata] = useState([])
  const [cspdata, setcspdata] = useState([])
  const token = localStorage.getItem("token"); // Get token from localStorage

  async function getdata() {
    const licare_code = localStorage.getItem('licare_code');

    axios.get(`${Base_Url}/getmspdata/${licare_code}`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {


        if (res.data !== 0) {
          setdata(res.data[0])
          // console.log(res.data.i);

        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function getcspdata() {
    const licare_code = localStorage.getItem('licare_code');

    axios.post(`${Base_Url}/getcspdetails`, { licare_code: licare_code }, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {


        if (res.data !== 0) {
          setcspdata(res.data[0])
          // console.log(res.data.i);

        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    getcspdata()
    getdata()

  }, [])


  return (
    <div className="row mp0">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card mt-3 mb-3 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">Partner Details</h5>
          </div>

          <div className="card-body">
            <ul className="list-group list-group-flush">

              <li className="list-group-item">
                <strong>Licare Code:</strong> {cspdata.licarecode}
              </li>
              <li className="list-group-item">
                <strong>Title:</strong> {cspdata.title}
              </li>
              <li className="list-group-item">
                <strong>Partner Name:</strong> {cspdata.partner_name}
              </li>
              <li className="list-group-item">
                <strong>Contact Person No:</strong> {cspdata.mobile_no}
              </li>
              <li className="list-group-item">
                <strong>Email:</strong> {cspdata.email}
              </li>
              <li className="list-group-item">
                <strong>Address:</strong>{cspdata.address}
              </li>
              <li className="list-group-item">
                <strong>GST No:</strong> {cspdata.gstno}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card mt-3 mb-3 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">MSP Details</h5>
          </div>

          <div className="card-body">
            <ul className="list-group list-group-flush">

              <li className="list-group-item">
                <strong>Licare Code:</strong> {data.licarecode}
              </li>
              <li className="list-group-item">
                <strong>Title:</strong> {data.title}
              </li>
              <li className="list-group-item">
                <strong>Partner Name:</strong> {data.partner_name}
              </li>
              <li className="list-group-item">
                <strong>Contact Person No:</strong> {data.contact_person}
              </li>
              <li className="list-group-item">
                <strong>Email:</strong> {data.email}
              </li>
              <li className="list-group-item">
                <strong>Address:</strong>{data.address}
              </li>
              <li className="list-group-item">
                <strong>GST No:</strong> {data.gstno}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>


  )
}
