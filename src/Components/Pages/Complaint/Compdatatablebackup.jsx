import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash,FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';

DataTable.use(DT);


export function Complaintlist(params) {
    const [Complaintdata, setComplaintdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        cfranchise_id: '',
        password: '',
        email: '',
        mobile_no: '',
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchComplaintlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getcomplainlist`);
            setComplaintdata(response.data);
        } catch (error) {
            console.error('Error fetching Complaintdata:', error);
            setComplaintdata([]);
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deleteengineer`, { id });
            setFormData({
                title: '',
                cfranchise_id: ''
            })
            fetchComplaintlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestengineer/${id}`);
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };
    useEffect(() => {
        fetchComplaintlist();
    }, []);

    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };

    useEffect(() => {
        const $ = window.$; // Access jQuery
        $(document).ready(function () {
            $('#myTable').DataTable();
        });
        return () => {
            $('#myTable').DataTable().destroy();
        };
    }, []);

    const navigate = useNavigate()

    return (
        <div className="row mp0" >
            <div className="col-md-12 col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                    <DataTable
        data={Complaintdata}
        columns={[
          { title: "#", data: null, render: (data, type, row, meta) => meta.row + 1 + 1 },
          { title: "Complaint No.", data: "ticket_no" },
          { title: "Complaint Date", data: "ticket_date", render: formatDate },
          { title: "Customer Name", data: "customer_name" },
          { title: "Product", data: "ModelNumber" },
          { title: "Age", data: null, render: () => '0' },
          { title: "Assigned Users", data: "assigned_to" },
          { title: "Status", data: "call_status" },
          {
            title: "Edit",
            orderable: false,
            searchable: false,
            render: (data, type, row) => (
              <button
                className="btn"
                onClick={() => edit(row.id)}
                title="Edit"
                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
              >
              back
              </button>
            ),
          },
          {
            title: "View",
            orderable: false,
            searchable: false,
            render: (data, type, row) => (
              <button
                className="btn"
                // onClick={() => view(row.id)}
                title="View"
                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
              >
                {/* Add icon or text here for View */}
              </button>
            ),
          }
          ,
          { title: "Delete", orderable: false, searchable: false, render: (data, type, row) => (
            <button
              className='btn'
              onClick={() => deleted(row.id)}
              title="Delete"
              style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
            >
              <FaTrash />
            </button>
          )}
        ]}
        options={{
          // Add any DataTable options here
        }}
      />
                    </div>
                </div>
            </div>
        </div>
    )
}