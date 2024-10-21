import React from "react";

export function Registercomplaint(params) {


    return (
        <>
            <div class="row ">
                <div class="complbread">
                    <div class="row">
                        <div class="col-md-3">
                            <label class="breadMain">Register New Complaint</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-25">
                <div class="col-3">
                    <div class="card mb-3">
                        <div class="card-body">
                            <form action="" method="GET">
                                <p>Search by Mobile / Email</p>
                                <div class="row g-3 align-items-center">
                                    <div class="col-8">
                                        <input required type="text" name="searchtext" id="searchtext" class="form-control" aria-describedby="passwordHelpInline" placeholder="Enter Mobile / Email / Customer Name" />
                                    </div>
                                    <div class="col-4">
                                        <button id="inputSearch" name="inputSearch" for="inputSearch" type="submit" class="btn btn-liebherr">Search</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div id="searchResult" class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-12">
                                    <h4 class="pname">Customer Name</h4>
                                </div>
                            </div>
                            <p>Address, City, State, Pincode: 123456</p>

                            <div class="row mb-3">
                                <div class="col-md-5">
                                    <p class="mp0">M: 9876543210</p>
                                </div>
                            </div>

                            <ul class="nav nav-tabs" id="myTab2" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Products</a>
                                </li>
                            </ul>

                            <div class="tab-content mb-3">
                                <div class="tab-pane active" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                    <table class="table table-striped">
                                        <tr>
                                            <td><div>Product Model</div></td>
                                            <td>
                                                <div class="text-right pb-2">
                                                    <a data-id="1" data-modal="Product Model" data-mobile="9876543210" class="btn btn-sm btn-primary generateTicket">New Ticket</a>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>

                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Previous Ticket</a>
                                </li>
                            </ul>

                            <div class="tab-content">
                                <div class="tab-pane active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                    <table class="table table-striped">
                                        <tr>
                                            <td>
                                                <div>Ticket No: 12345</div>
                                                <div>12-10-2024</div>
                                            </td>
                                            <td>Model Number</td>
                                            <td>
                                                <div>Status</div>
                                                <span>View Info</span>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <p>No Result Found</p>
                            <button id="generateTicket" data-id="" data-modal="" data-mobile="" class="btn btn-sm btn-primary">New Ticket</button>
                        </div>
                    </div>
                </div>

                <div class="col-6">
                    <div class="card" id="formInfo">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Model</p>
                                    <p>Model XYZ</p>
                                </div>
                                <div class="col-md-2">
                                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Serial No</p>
                                    <p>330327594</p>
                                </div>
                                <div class="col-md-2">
                                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Purchase Date</p>
                                    <p>16-06-2024</p>
                                </div>
                                <div class="col-md-2">
                                    <p style={{ fontSize: "11px", marginBottom: "5px", fontWeight: "bold" }}>Warranty Status</p>
                                    <p>In Warranty</p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12">
                                    <h3 class="mainheade">Complaint <span id="compaintno">: LB240624015</span></h3>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label">Complaint Date</label>
                                        <input type="date" value="2024-10-20" class="form-control" />
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <div class="mb-3">
                                        <label for="exampleFormControlInput1" class="form-label">Customer Name</label>
                                        <input type="text" value="Customer Name" class="form-control" placeholder="Enter Customer Name" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="exampleFormControlInput1" class="form-label">Contact Person</label>
                                        <input type="text" class="form-control" placeholder="Enter Contact Person Name" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="exampleFormControlInput1" class="form-label">Email Id</label>
                                        <input type="email" value="example@email.com" class="form-control" placeholder="Enter Email Id" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="exampleFormControlInput1" class="form-label">Mobile No. <input type="checkbox" />Whatsapp</label>
                                        <input type="text" value="9876543210" class="form-control" placeholder="Enter Mobile" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="exampleFormControlInput1" class="form-label">Alt. Mobile No. <input type="checkbox" />Whatsapp</label>
                                        <input type="text" class="form-control" placeholder="Enter Mobile" />
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="mb-3">
                                        <label for="exampleFormControlInput1" class="form-label">Address</label>
                                        <textarea class="form-control" placeholder="Enter Address">Customer Address</textarea>
                                    </div>
                                </div>

                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label">State</label>
                                        <select class="form-control">
                                            <option value="">Select State</option>
                                            <option value="State1">State 1</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label">City</label>
                                        <input type="text" class="form-control" value="City Name" />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label">Area</label>
                                        <input type="text" class="form-control" value="Area Name" />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label">Pincode</label>
                                        <input type="text" class="form-control" value="123456" placeholder="Enter Pincode" />
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Mode of Contact</label>
                                        <select class="form-control">
                                            <option value="">Select</option>
                                            <option value="Call">Call</option>
                                            <option value="SMS">SMS</option>
                                            <option value="Email">Email</option>
                                            <option value="In Person">In Person</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Technician</label>
                                        <select class="form-control">
                                            <option value="">Select Technician</option>
                                            <option value="Technician1">Technician 1</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Allocated Date</label>
                                        <input type="date" value="2024-10-21" class="form-control" />
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Product Category</label>
                                        <select class="form-control">
                                            <option value="">Select Category</option>
                                            <option value="Category1">Category 1</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Complaint Category</label>
                                        <select class="form-control">
                                            <option value="">Select Complaint Category</option>
                                            <option value="Complaint1">Complaint 1</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Complaint</label>
                                        <select class="form-control">
                                            <option value="">Select Complaint</option>
                                            <option value="Complaint1">Complaint 1</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-12">
                                    <div class="mb-3">
                                        <label for="exampleFormControlTextarea1" class="form-label">Complaint Description</label>
                                        <textarea class="form-control" placeholder="Enter Description" rows="3"></textarea>
                                    </div>
                                </div>

                                <div class="col-md-12">
                                    <button class="btn btn-liebherr">Submit Complaint</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-3">
          
          <>
              <div className="card mb-3" id="productInfo">
                  <div className="card-body">
                      <h4 className="pname">Master Sales Partner</h4>
                      <div className="mb-3">
                          <select className="form-control">
                              <option value="TEJKARAN MANMAL" selected>TEJKARAN MANMAL</option>
                              <option value="Hafele India Private Limited">Hafele India Private Limited</option>
                          </select>
                      </div>

                      <h4 className="pname">Service Partner</h4>
                      <div className="mb-3">
                          <select className="form-control">
                              <option value="TEJKARAN MANMAL" selected>SHREE SAI SERVICES</option>
                              <option value="Hafele India Private Limited">ELECTRONICS WORLD SERVICE</option>
                          </select>
                      </div>
                  </div>
              </div>

              <div className="card mb-3" id="engineerInfo">
                  <div className="card-body">
                      <div className="row">
                          <div className="col-md-8">
                              <h4 className="pname">Dealer Info</h4>
                          </div>
                          <div className="col-md-4 text-right">
                              <a href="#" style={{ fontSize: '12px' }}>Add New</a>
                          </div>
                      </div>

                      <div className="mb-3">
                          <select className="form-control" id="exampleFormControlInput1">
                              <option value="">Select Dealer</option>
                              <option value="Abhishek Pangerkar">Abhishek Pangerkar</option>
                              <option value="Amol Jadhav">Amol Jadhav</option>
                          </select>
                      </div>
                  </div>
              </div>

              <div className="card mb-3" id="engineerInfo">
                  <div className="card-body">
                      <h4 className="pname">Additional Remarks</h4>
                      <div className="mb-3">
                          <textarea className="form-control"></textarea>
                      </div>
                  </div>
              </div>

              <div className="card" id="attachmentInfo">
                  <div className="card-body">
                      <h4 className="pname">Attachment</h4>
                      <div className="mb-3">
                          <input type="file" className="form-control" id="exampleFormControlInput1" />
                      </div>
                      <div id="allattachme">
                          <table className="table table-striped">
                              <tr>
                                  <td>
                                      <div>02-06-2024</div>
                                  </td>
                                  <td>abc.jpg</td>
                              </tr>
                              <tr>
                                  <td>
                                      <div>02-06-2024</div>
                                  </td>
                                  <td>Liebherr 472L</td>
                              </tr>
                              <tr>
                                  <td>
                                      <div>02-06-2024</div>
                                  </td>
                                  <td>Liebherr 472L</td>
                              </tr>
                          </table>
                      </div>
                  </div>
              </div>
          </>
   
  </div>
            </div>

          

        </>
    )
}