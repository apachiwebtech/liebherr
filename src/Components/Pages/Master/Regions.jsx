import React from 'react';

function Regions() {
  return (
    <div className="row">
      {/* Left Section - Form */}
      <div className="col-md-6">
        <form>
          <div className="form-group">
            <label htmlFor="regionInput">Add Region</label>
            <input
              type="text"
              className="form-control"
              id="regionInput"
              placeholder="Enter region"
            />
          </div>
          <button type="submit" className="btn btn-warning mt-2">
            Submit
          </button>
        </form>
      </div>

      {/* Right Section - Data Listing */}
      <div className="col-md-6">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Region</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Region Name</td>
              <td>
                <i className="bi bi-pencil-fill text-primary"></i>
              </td>
              <td>
                <i className="bi bi-trash-fill text-danger"></i>
              </td>
            </tr>
            {/* Add more rows dynamically */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Regions;
