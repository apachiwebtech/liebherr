import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import axios from 'axios';
import { Base_Url } from '../../Utils/Base_Url';
import 'datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css';
import 'datatables.net-responsive';

// DataTables Fixed Columns Extension
import 'datatables.net-fixedcolumns';
import 'datatables.net-fixedcolumns-bs4/css/fixedColumns.bootstrap4.min.css';

// DataTables Fixed Header Extension
import 'datatables.net-fixedheader';

// DataTables Buttons Extension
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs4/css/buttons.bootstrap4.min.css';
import 'datatables.net-buttons/js/buttons.html5.min.js';



// DataTables KeyTable Extension
import 'datatables.net-keytable';

// DataTables Select Extension
import 'datatables.net-select';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
const DataTable = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const token = localStorage.getItem("token");
  const [cat, setCat] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcat`, {
        headers: {
          Authorization: token,
        },
      });
      setCat(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (cat.length > 0) {
      // Initialize DataTable only after data has been fetched
      const table = $('#example').DataTable({
        responsive: true, // Enable responsiveness
        fixedHeader: true, // Enable fixed header
        fixedColumns: {
          left: 1, // Fix the first column
        },
        keys: true, // Enable keyboard navigation
        select: true, // Enable row selection
        dom: '<"d-flex justify-content-between"<"table-title"><"search-box"f>>t<"d-flex justify-content-between"ip>',
        language: {
          search: '', // Remove the "Search:" label
          searchPlaceholder: 'Search...', // Add placeholder text
        },
      });

      // Cleanup: Destroy DataTable instance before reinitializing
      return () => {
        table.destroy();
      };
    }
  }, [cat]);

  return (
    <div className="table-responsive">
          {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      <table id="example" className="table table-striped table-bordered" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {cat.map((item, index) => (
            <tr key={item.id}>
              <td className="text-center">{index + 1}</td>
              <td>{item.title}</td>
              <td className="text-center">
                <button className="btn btn-link text-primary" title="Edit">
                  Edit
                </button>
              </td>
              <td className="text-center">
                <button className="btn btn-link text-danger" title="Delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
