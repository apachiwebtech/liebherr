import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const ProductLine = () => {
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const createdBy = 1;
  const updatedBy = 2;

  const [formData, setFormData] = useState({
    pline_code: '',
    product_line: ''
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getproductline`);
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      user.pline_code && user.pline_code.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.pline_code.trim()) {
      newErrors.pline_code = "Product Line Code field is required.";
    }
    if (!formData.product_line.trim()) {
      newErrors.product_line = "Product Line field is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDuplicateError('');

    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          await axios.put(`${Base_Url}/putproductlinedata`, { ...formData, updated_by: updatedBy })
            .then(response => {
              window.location.reload();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Product Line already exists!');
              }
            });
        } else {
          await axios.post(`${Base_Url}/postdataproductline`, { ...formData, created_by: createdBy })
            .then(response => {
              window.location.reload();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Product Line already exists!');
              }
            });
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  const deleted = async (id) => {
    try {
      const response = await axios.post(`${Base_Url}/deleteproductlinedata`, { id });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestdataproductline/${id}`);
      setFormData(response.data);
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="row mp0">
      <div className="col-12">
        <div className="card mb-3 tab_box">
          <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
            <div className="row mp0">
              <div className="col-6">
                <form onSubmit={handleSubmit} style={{ width: "50%" }} className="text-left">
                  <div className="mb-3">
                    <label htmlFor="PlineCodeInput" className="input-field">Add Product Line Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pline_code"
                      id="PlineCodeInput"
                      value={formData.pline_code}
                      onChange={handleChange}
                      placeholder="Enter Product Line Code"
                    />
                    {errors.pline_code && <small className="text-danger">{errors.pline_code}</small>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ProductLineInput" className="input-field">Add Product Line</label>
                    <input
                      type="text"
                      className="form-control"
                      name="product_line"
                      id="ProductLineInput"
                      value={formData.product_line}
                      onChange={handleChange}
                      placeholder="Enter Product Line"
                    />
                    {errors.product_line && <small className="text-danger">{errors.product_line}</small>}
                    {duplicateError && <small className="text-danger">{duplicateError}</small>}
                  </div>

                  <div className="text-right">
                    <button className="btn btn-liebherr" type="submit">
                      {isEdit ? "Update" : "Submit"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Rest of the code remains the same */}
              {/* Search, pagination, table display code remains unchanged */}

              <div className="col-md-6">
                {/* Table and search functionality */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>
                    Show
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="form-control d-inline-block"
                      style={{ width: '51px', display: 'inline-block', marginLeft: '5px', marginRight: '5px' }}
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                    entries
                  </span>

                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-control d-inline-block"
                    style={{ width: '300px' }}
                  />
                </div>

                <table className='table table-bordered table dt-responsive nowrap w-100 table-css' style={{ marginTop: '20px', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 15px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center' }}>Pline Code</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center' }}>Product Line</th>
                      <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
                      <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: '2px', textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                        <td style={{ padding: '10px' }}>{item.pline_code}</td>
                        <td style={{ padding: '10px' }}>{item.product_line}</td>
                        <td style={{ padding: '0px', textAlign: 'center' }}>
                          <button
                            className='btn'
                            onClick={() => edit(item.id)}
                            title="Edit"
                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                          >
                            <FaPencilAlt />
                          </button>
                        </td>
                        <td style={{ padding: '0px', textAlign: 'center' }}>
                          <button
                            className='btn'
                            onClick={() => deleted(item.id)}
                            title="Delete"
                            style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
                  </div>
                  <div>
                    {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`btn ${index === currentPage ? 'btn-primary' : ''}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLine;
