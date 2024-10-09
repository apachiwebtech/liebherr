
const { createPool } = require('mysql'); // MySQL ke liye connection pool banane ke liye mysql module import kar rahe hain
const express = require('express'); // Express framework ko import kar rahe hain jo HTTP requests aur responses ko handle karega
const app = express(); // Express application ka instance bana rahe hain
const cors = require('cors'); // Cross-Origin Resource Sharing (CORS) ko manage karne ke liye cors module ko import kar rahe hain

// Middleware setup kar rahe hain
app.use(cors({ origin: '*' })); // CORS ko sabhi domains ke liye enable kar rahe hain taaki koi bhi external website API ko access kar sake
app.use(express.json()); // JSON requests ko parse kar rahe hain taaki req.body se data access kar sake

// Database connection setup kar rahe hain
const con = createPool({
  host: 'localhost', // MySQL ke server ka host address (local development ke liye 'localhost')
  user: 'root', // MySQL user ka username (default XAMPP ya local server ke liye 'root')
  password: '', // MySQL user ka password (local server me aksar blank hota hai)
  database: 'liebherr' // Database ka naam jisme hum data ko store kar rahe hain ('crud')
});

app.listen(8081, () => {
  console.log('Server is running on http://localhost:8081'); 
});

// API jo sabhi users ko fetch karegi jinhone soft delete nahi kiya gaya hai
app.get('/getdata', (req, res) => {
  const sql = "SELECT * FROM awt_country WHERE deleted = 0"; // Users table se sabhi users ko fetch karne ki query jinke 'deleted' column me 0 hai
  con.query(sql, (err, data) => { // SQL query ko execute kar rahe hain
    if (err) {
      return res.json(err); // Agar koi error aata hai to error message return karenge
    } else {
      return res.json(data); // Agar query successful hoti hai to users ka data JSON format me return karenge
    }
  });
});

// API jo specific user ko uske ID ke base par fetch karegi
app.get('/requestdata/:id', (req, res) => {
  const { id } = req.params; // URL se user ki id ko extract kar rahe hain
  const sql = "SELECT * FROM awt_country WHERE id = ? AND deleted = 0"; // User ko uske ID aur soft-delete status ke base par fetch karne ki query
  con.query(sql, [id], (err, data) => { // SQL query ko execute kar rahe hain, id ko parameter ke roop me pass kar rahe hain
    if (err) {
      return res.status(500).json(err); // Agar koi error aata hai to 500 status ke sath error message return karenge
    } else {
      return res.json(data[0]); // Agar query successful hoti hai to specific user ka data (index 0) return karenge
    }
  });
});

        // Insert new user with duplicate check
        app.post('/postdata', (req, res) => {
          const { title } = req.body;

              // Step 1: Check if the same title exists and is not soft-deleted
              const checkDuplicateSql = `SELECT * FROM awt_country WHERE title = ? AND deleted = 0`;
              con.query(checkDuplicateSql, [title], (err, data) => {
                if (err) {
                  return res.status(500).json(err);
                }

                if (data.length > 0) {
                  // If duplicate data exists (not soft-deleted)
                  return res.status(409).json({ message: 'Duplicate entry, Country already exists!' });
                } else {
                  // Step 2: Check if the same title exists but is soft-deleted
                  const checkSoftDeletedSql = `SELECT * FROM awt_country WHERE title = ? AND deleted = 1`;
                  con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
                    if (err) {
                      return res.status(500).json(err);
                    }

                    if (softDeletedData.length > 0) {
                      // If soft-deleted data exists, restore the entry
                      const restoreSoftDeletedSql = `UPDATE awt_country SET deleted = 0 WHERE title = ?`;
                      con.query(restoreSoftDeletedSql, [title], (err) => {
                        if (err) {
                          return res.status(500).json(err);
                        }
                        return res.json({ message: 'Soft-deleted data restored successfully!' });
                      });
                    } else {
                      // Step 3: Insert new entry if no duplicates found
                      const sql = `INSERT INTO awt_country (title) VALUES (?)`; // User data ko database me insert karne ki SQL query
                      con.query(sql, [title], (err, data) => { // SQL query ko execute kar rahe hain, user ke data ko parameters ke roop me pass kar rahe hain
                        if (err) {
                          return res.json(err); // Agar koi error aata hai to error message return karenge
                        } else {
                          return res.json({ message: 'Country added successfully!' }); // Agar query successful hoti hai to success message return karenge
                        }
                      });
                    }
                  });
                }
              });
            });


              // Update existing user with duplicate check
              app.put('/putdata', (req, res) => {
                const { title, id } = req.body;

                // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
                const checkDuplicateSql = `SELECT * FROM awt_country WHERE title = ? AND id != ? AND deleted = 0`;
                con.query(checkDuplicateSql, [title, id], (err, data) => {
                  if (err) {
                    return res.status(500).json(err);
                  }

                  if (data.length > 0) {
                    // If a duplicate exists (other than the current record)
                    return res.status(409).json({ message: 'Duplicate entry, title already exists!' });
                  } else {
                    // Step 2: Update the record if no duplicates are found
                    const updateSql = `UPDATE awt_country SET title = ? WHERE id = ?`;
                    con.query(updateSql, [title, id], (err, data) => {
                      if (err) {
                        return res.status(500).json(err);
                      }
                      return res.json({ message: 'Country updated successfully!' });
                    });
                  }
                });
              });


              // API jo user ko soft-delete karegi (user ko remove nahi karegi, bas 'deleted' column me 1 mark karegi)
              app.post('/deletedata', (req, res) => {
                const { id } = req.body; // Request body se user ki ID ko extract kar rahe hain
                const sql = `UPDATE awt_country SET deleted = 1 WHERE id = ?`; // User ko soft-delete karne ki SQL query (deleted column ko 1 kar dena)
                con.query(sql, [id], (err, data) => { // SQL query ko execute kar rahe hain, id ko parameter ke roop me pass kar rahe hain
                  if (err) {
                    console.error(err); // Agar koi error aata hai to usse console me print karenge
                    return res.status(500).json({ message: 'Error updating user' }); // Error message ke sath 500 status return karenge
                  } else {
                    return res.json(data); // Agar query successful hoti hai to updated data return karenge
                  }
                });
              })

                          // API jo sabhi regions ko fetch karegi jinhone soft delete nahi kiya gaya hai
                          app.get('/getregions', (req, res) => {
                            const sql = "SELECT r.*, c.title as country_title FROM awt_region r JOIN awt_country c ON r.country_id = c.id WHERE r.deleted = 0"; // Regions ko fetch karne ki query
                            con.query(sql, (err, data) => {
                              if (err) {
                                return res.json(err);
                              } else {
                                return res.json(data);
                              }
                            });
                          });

                        // API jo specific region ko uske ID ke base par fetch karegi
                        app.get('/requestregion/:id', (req, res) => {
                          const { id } = req.params;
                          const sql = "SELECT * FROM awt_region WHERE id = ? AND deleted = 0"; // Region ko ID aur soft-delete status ke base par fetch karne ki query
                          con.query(sql, [id], (err, data) => {
                            if (err) {
                              return res.status(500).json(err);
                            } else {
                              return res.json(data[0]);
                            }
                          });
                        });

                      // Insert new region with duplicate check
                      app.post('/postregion', (req, res) => {
                        const { title, country_id } = req.body;

                        // Step 1: Check if the same title exists and is not soft-deleted
                        const checkDuplicateSql = `SELECT * FROM awt_region WHERE title = ? AND deleted = 0`;
                        con.query(checkDuplicateSql, [title], (err, data) => {
                          if (err) {
                            return res.status(500).json(err);
                          }

                          if (data.length > 0) {
                            // If duplicate data exists (not soft-deleted)
                            return res.status(409).json({ message: 'Duplicate entry, Region already exists!' });
                          } else {
                            // Step 2: Check if the same title exists but is soft-deleted
                            const checkSoftDeletedSql = `SELECT * FROM awt_region WHERE title = ? AND deleted = 1`;
                            con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
                              if (err) {
                                return res.status(500).json(err);
                              }

                              if (softDeletedData.length > 0) {
                                // If soft-deleted data exists, restore the entry
                                const restoreSoftDeletedSql = `UPDATE awt_region SET deleted = 0 WHERE title = ?`;
                                con.query(restoreSoftDeletedSql, [title], (err) => {
                                  if (err) {
                                    return res.status(500).json(err);
                                  }
                                  return res.json({ message: 'Soft-deleted Region restored successfully!' });
                                });
                              } else {
                                // Step 3: Insert new entry if no duplicates found
                                const sql = `INSERT INTO awt_region (title, country_id) VALUES (?, ?)`;
                                con.query(sql, [title, country_id], (err, data) => {
                                  if (err) {
                                    return res.json(err);
                                  } else {
                                    return res.json({ message: 'Region added successfully!' });
                                  }
                                });
                              }
                            });
                          }
                        });
                      });

                        // Update existing region with duplicate check
                        app.put('/putregion', (req, res) => {
                          const { title, id, country_id } = req.body;

                          // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
                          const checkDuplicateSql = `SELECT * FROM awt_region WHERE title = ? AND id != ? AND deleted = 0`;
                          con.query(checkDuplicateSql, [title, id], (err, data) => {
                            if (err) {
                              return res.status(500).json(err);
                            }

                            if (data.length > 0) {
                              // If a duplicate exists (other than the current record)
                              return res.status(409).json({ message: 'Duplicate entry, Region already exists!' });
                            } else {
                              // Step 2: Update the record if no duplicates are found
                              const updateSql = `UPDATE awt_region SET title = ?, country_id = ? WHERE id = ?`;
                              con.query(updateSql, [title, country_id, id], (err, data) => {
                                if (err) {
                                  return res.status(500).json(err);
                                }
                                return res.json({ message: 'Region updated successfully!' });
                              });
                            }
                          });
                        });

                        // API jo region ko soft-delete karegi (region ko remove nahi karegi, bas 'deleted' column me 1 mark karegi)
                        app.post('/deleteregion', (req, res) => {
                          const { id } = req.body; // Request body se region ki ID ko extract kar rahe hain
                          const sql = `UPDATE awt_region SET deleted = 1 WHERE id = ?`; // Region ko soft-delete karne ki SQL query (deleted column ko 1 kar dena)
                          con.query(sql, [id], (err, data) => {
                            if (err) {
                              console.error(err);
                              return res.status(500).json({ message: 'Error updating region' });
                            } else {
                              return res.json(data);
                            }
                          });
                        });



                        
                          // GEO States
                        // API banate hain jo sabhi countries ko fetch karega
                        app.get('/getcountries', (req, res) => {
                          const sql = 'SELECT * FROM awt_country WHERE deleted = 0'; // Countries table se sabhi records ko fetch karne ke liye SQL query likh rahe hain
                          con.query(sql, (err, data) => { // SQL query ko execute kar rahe hain
                            if (err) {
                              return res.status(500).json(err); // Agar koi error aata hai to 500 status ke sath error message return karenge
                            } else {
                              return res.json(data); // Agar query successful hoti hai to countries ka data JSON format me return karenge
                            }
                          });
                        });

                            // API to fetch  Region based on the selected country
                            app.get('/getregion/:country_id', (req, res) => {
                              const { country_id } = req.params;
                              const sql = `SELECT * FROM awt_region WHERE country_id = ? AND deleted = 0`;
                              con.query(sql, [country_id], (err, data) => {
                                if (err) {
                                  return res.status(500).json(err);
                                }
                                return res.json(data);
                              });
                            });


                        // API to fetch all Geo states that are not soft deleted
                        app.get('/getgeostates', (req, res) => {
                          const sql = "SELECT gs.*, c.title as country_title, r.title as region_title FROM awt_geostate gs JOIN awt_country c ON gs.country_id = c.id JOIN awt_region r ON gs.region_id = r.id WHERE gs.deleted = 0"; 
                          con.query(sql, (err, data) => {
                            if (err) {
                              return res.json(err);
                            } else {
                              return res.json(data);
                            }
                          });
                        });


                      // API to fetch a specific GEO state by ID
                      app.get('/requestgeostate/:id', (req, res) => {
                        const { id } = req.params;
                        const sql = "SELECT * FROM awt_geostate WHERE id = ? AND deleted = 0"; 
                        con.query(sql, [id], (err, data) => {
                          if (err) {
                            return res.status(500).json(err);
                          } else {
                            return res.json(data[0]);
                          }
                        });
                      });

                  // Insert new geostate with duplicate check
                  app.post('/postgeostate', (req, res) => {
                    const { title, country_id, region_id } = req.body;

                    // Check if the same title exists and is not soft-deleted
                    const checkDuplicateSql = `SELECT * FROM awt_geostate WHERE title = ? AND deleted = 0`;
                    con.query(checkDuplicateSql, [title], (err, data) => {
                      if (err) {
                        return res.status(500).json(err);
                      }

                      if (data.length > 0) {
                        return res.status(409).json({ message: 'Duplicate entry, State already exists!' });
                      } else {
                        // Check if the same title exists but is soft-deleted
                        const checkSoftDeletedSql = `SELECT * FROM awt_geostate WHERE title = ? AND deleted = 1`;
                        con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
                          if (err) {
                            return res.status(500).json(err);
                          }

                          if (softDeletedData.length > 0) {
                            // Restore soft-deleted entry
                            const restoreSoftDeletedSql = `UPDATE awt_geostate SET deleted = 0 WHERE title = ?`;
                            con.query(restoreSoftDeletedSql, [title], (err) => {
                              if (err) {
                                return res.status(500).json(err);
                              }
                              return res.json({ message: 'Soft-deleted State restored successfully!' });
                            });
                          } else {
                            // Insert new entry if no duplicates found
                            const sql = `INSERT INTO awt_geostate (title, country_id, region_id) VALUES (?, ?, ?)`;
                            con.query(sql, [title, country_id, region_id], (err, data) => {
                              if (err) {
                                return res.json(err);
                              } else {
                                return res.json({ message: 'State added successfully!' });
                              }
                            });
                          }
                        });
                      }
                    });
                  });

                  // Update existing geostate with duplicate check
                    app.put('/putgeostate', (req, res) => {
                      const { title, id, country_id, region_id } = req.body;

                      // Check if the same title exists for another record
                      const checkDuplicateSql = `SELECT * FROM awt_geostate WHERE title = ? AND id != ? AND deleted = 0`;
                      con.query(checkDuplicateSql, [title, id], (err, data) => {
                        if (err) {
                          return res.status(500).json(err);
                        }

                        if (data.length > 0) {
                          return res.status(409).json({ message: 'Duplicate entry, State already exists!' });
                        } else {
                          // Update the record if no duplicates are found
                          const updateSql = `UPDATE awt_geostate SET title = ?, country_id = ?, region_id = ? WHERE id = ?`;
                          con.query(updateSql, [title, country_id, region_id, id], (err, data) => {
                            if (err) {
                              return res.status(500).json(err);
                            }
                            return res.json({ message: 'State updated successfully!' });
                          });
                        }
                      });
                    });

                      // API to soft delete a state
                      app.post('/deletegeostate', (req, res) => {
                        const { id } = req.body; 
                        const sql = `UPDATE awt_geostate SET deleted = 1 WHERE id = ?`; 
                        con.query(sql, [id], (err, data) => {
                          if (err) {
                            console.error(err);
                            return res.status(500).json({ message: 'Error updating state' });
                          } else {
                            return res.json(data);
                          }
                        });
                      });

                      
                                   //Geo City Start
                                  // API to fetch all countries (for the country dropdown)
                                  app.get('/getcountries', (req, res) => {
                                    const sql = 'SELECT * FROM awt_country WHERE deleted = 0'; 
                                    con.query(sql, (err, data) => {
                                      if (err) {
                                        return res.status(500).json(err);
                                      } else {
                                        return res.json(data);
                                      }
                                    });
                                  });

                                  // API to fetch regions based on selected country (for the region dropdown)
                                  app.get('/getregions/:country_id', (req, res) => {
                                    const { country_id } = req.params;
                                    const sql = 'SELECT * FROM awt_region WHERE country_id = ? AND deleted = 0';
                                    con.query(sql, [country_id], (err, data) => {
                                      if (err) {
                                        return res.status(500).json(err);
                                      }
                                      return res.json(data);
                                    });
                                  });

                                  // API to fetch geostates based on selected region (for the geostate dropdown)
                                  app.get('/getgeostates/:region_id', (req, res) => {
                                    const { region_id } = req.params;
                                    const sql = 'SELECT * FROM awt_geostate WHERE region_id = ? AND deleted = 0';
                                    con.query(sql, [region_id], (err, data) => {
                                      if (err) {
                                        return res.status(500).json(err);
                                      }
                                      return res.json(data);
                                    });
                                  });

                                  // API to fetch all cities (joining countries, regions, and geostates)
                                  app.get('/getgeocities', (req, res) => {
                                    const sql = `
                                      SELECT gc.*, c.title as country_title, r.title as region_title, gs.title as geostate_title 
                                      FROM awt_geocity gc 
                                      JOIN awt_country c ON gc.country_id = c.id 
                                      JOIN awt_region r ON gc.region_id = r.id 
                                      JOIN awt_geostate gs ON gc.geostate_id = gs.id 
                                      WHERE gc.deleted = 0`; 

                                    con.query(sql, (err, data) => {
                                      if (err) {
                                        return res.json(err);
                                      } else {
                                        return res.json(data);
                                      }
                                    });
                                  });

                                  // API to fetch a specific GEO city by ID
                                  app.get('/requestgeocity/:id', (req, res) => {
                                    const { id } = req.params;
                                    const sql = `SELECT * FROM awt_geocity WHERE id = ? AND deleted = 0`; 
                                    con.query(sql, [id], (err, data) => {
                                      if (err) {
                                        return res.status(500).json(err);
                                      } else {
                                        return res.json(data[0]);
                                      }
                                    });
                                  });

                                  // Insert new geocity with duplicate check
                                  app.post('/postgeocity', (req, res) => {
                                    const { title, country_id, region_id, geostate_id } = req.body;

                                    // Check for duplicates
                                    const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = ? AND deleted = 0`;
                                    con.query(checkDuplicateSql, [title], (err, data) => {
                                      if (err) {
                                        return res.status(500).json(err);
                                      }

                                      if (data.length > 0) {
                                        return res.status(409).json({ message: 'Duplicate entry, City already exists!' });
                                      } else {
                                        // Check if the same title is soft-deleted
                                        const checkSoftDeletedSql = `SELECT * FROM awt_geocity WHERE title = ? AND deleted = 1`;
                                        con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
                                          if (err) {
                                            return res.status(500).json(err);
                                          }

                                          if (softDeletedData.length > 0) {
                                            // Restore soft-deleted city
                                            const restoreSoftDeletedSql = `UPDATE awt_geocity SET deleted = 0 WHERE title = ?`;
                                            con.query(restoreSoftDeletedSql, [title], (err) => {
                                              if (err) {
                                                return res.status(500).json(err);
                                              }
                                              return res.json({ message: 'Soft-deleted City restored successfully!' });
                                            });
                                          } else {
                                            // Insert new entry if no duplicates are found
                                            const sql = `INSERT INTO awt_geocity (title, country_id, region_id, geostate_id) VALUES (?, ?, ?, ?)`;
                                            con.query(sql, [title, country_id, region_id, geostate_id], (err, data) => {
                                              if (err) {
                                                return res.json(err);
                                              } else {
                                                return res.json({ message: 'City added successfully!' });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  });

                                  // Update existing geocity with duplicate check
                                  app.put('/putgeocity', (req, res) => {
                                    const { title, id, country_id, region_id, geostate_id } = req.body;

                                    // Check for duplicates
                                    const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = ? AND id != ? AND deleted = 0`;
                                    con.query(checkDuplicateSql, [title, id], (err, data) => {
                                      if (err) {
                                        return res.status(500).json(err);
                                      }

                                      if (data.length > 0) {
                                        return res.status(409).json({ message: 'Duplicate entry, City already exists!' });
                                      } else {
                                        // Update the record if no duplicates are found
                                        const updateSql = `UPDATE awt_geocity SET title = ?, country_id = ?, region_id = ?, geostate_id = ? WHERE id = ?`;
                                        con.query(updateSql, [title, country_id, region_id, geostate_id, id], (err, data) => {
                                          if (err) {
                                            return res.status(500).json(err);
                                          }
                                          return res.json({ message: 'City updated successfully!' });
                                        });
                                      }
                                    });
                                  });

                                  // API to soft delete a city
                                  app.post('/deletegeocity', (req, res) => {
                                    const { id } = req.body;
                                    const sql = `UPDATE awt_geocity SET deleted = 1 WHERE id = ?`;
                                    con.query(sql, [id], (err, data) => {
                                      if (err) {
                                        return res.status(500).json({ message: 'Error deleting city' });
                                      } else {
                                        return res.json(data);
                                      }
                                    });
                                  });
                                // Geo City End