import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import axios from 'axios';
import { Base_Url } from '../../Utils/Base_Url';

const DataTable = () => {
  const token = localStorage.getItem("token");
  const [cat, setCat] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getcat`, {
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
      const table = $('#example').DataTable();

      // Cleanup: Destroy DataTable instance before reinitializing
      return () => {
        table.destroy();
      };
    }
  }, [cat]);

  return (
    <div className="table-responsive">
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
