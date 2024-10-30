const { createPool } = require("mysql");
const express = require("express");
const app = express();
const cors = require("cors");
const complaint = require("./Routes/complaint");
const common = require("./Routes/common");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");

app.use(cors({ origin: "*" }));
app.use(express.json());

// this is for use routing

app.use("/", complaint);
app.use("/", common);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Folder where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const con = createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "liebherr",
});

app.listen(8081, () => {
  console.log("Server is running on http://localhost:8081");
});

//Country Master Start
app.get("/getdata", (req, res) => {
  const sql = "SELECT * FROM awt_country WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post("/login", (req, res) => {
  const { Lhiuser, password } = req.body;

  const sql = "SELECT id, Lhiuser FROM lhi_user WHERE Lhiuser = ? AND password = ?";
  con.query(sql, [Lhiuser, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length > 0) {
      
      res.json({ id: results[0].id, Lhiuser: results[0].Lhiuser });
    } else {
     
      res.status(401).json({ message: "Invalid username or password" });
    }
  });
});



app.get("/requestdata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_country WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

app.post("/postdata", (req, res) => {
  const { title } = req.body;

  // Step 1: Check if the same title exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_country WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Country already exists!" });
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
            return res.json({
              message: "Soft-deleted data restored successfully!",
            });
          });
        } else {
          const sql = `INSERT INTO awt_country (title) VALUES (?)`;
          con.query(sql, [title], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({ message: "Country added successfully!" });
            }
          });
        }
      });
    }
  });
});

// Update existing user with duplicate check
app.put("/putdata", (req, res) => {
  const { title, id } = req.body;

  // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_country WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, title already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_country SET title = ? WHERE id = ?`;
      con.query(updateSql, [title, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "Country updated successfully!" });
      });
    }
  });
});

app.post("/deletedata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_country SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
//Country Master End

// Region start
app.get("/getregions", (req, res) => {
  const sql =
    "SELECT r.*, c.title as country_title FROM awt_region r JOIN awt_country c ON r.country_id = c.id WHERE r.deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.get("/requestregion/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_region WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Insert new region with duplicate check
app.post("/postregion", (req, res) => {
  const { title, country_id } = req.body;

  // Step 1: Check if the same title exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_region WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Region already exists!" });
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
            return res.json({
              message: "Soft-deleted Region restored successfully!",
            });
          });
        } else {
          // Step 3: Insert new entry if no duplicates found
          const sql = `INSERT INTO awt_region (title, country_id) VALUES (?, ?)`;
          con.query(sql, [title, country_id], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({ message: "Region added successfully!" });
            }
          });
        }
      });
    }
  });
});

// Update existing region with duplicate check
app.put("/putregion", (req, res) => {
  const { title, id, country_id } = req.body;

  // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_region WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Region already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_region SET title = ?, country_id = ? WHERE id = ?`;
      con.query(updateSql, [title, country_id, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "Region updated successfully!" });
      });
    }
  });
});

app.post("/deleteregion", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_region SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating region" });
    } else {
      return res.json(data);
    }
  });
});
// Region End

// GEO States Start

app.get("/getcountries", (req, res) => {
  const sql = "SELECT * FROM awt_country WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch  Region based on the selected country
app.get("/getregion/:country_id", (req, res) => {
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
app.get("/getgeostates", (req, res) => {
  const sql =
    "SELECT gs.*, c.title as country_title, r.title as region_title FROM awt_geostate gs JOIN awt_country c ON gs.country_id = c.id JOIN awt_region r ON gs.region_id = r.id WHERE gs.deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch a specific GEO state by ID
app.get("/requestgeostate/:id", (req, res) => {
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
app.post("/postgeostate", (req, res) => {
  const { title, country_id, region_id } = req.body;

  // Check if the same title exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_geostate WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, State already exists!" });
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
            return res.json({
              message: "Soft-deleted State restored successfully!",
            });
          });
        } else {
          // Insert new entry if no duplicates found
          const sql = `INSERT INTO awt_geostate (title, country_id, region_id) VALUES (?, ?, ?)`;
          con.query(sql, [title, country_id, region_id], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({ message: "State added successfully!" });
            }
          });
        }
      });
    }
  });
});

// Update existing geostate with duplicate check
app.put("/putgeostate", (req, res) => {
  const { title, id, country_id, region_id } = req.body;

  // Check if the same title exists for another record
  const checkDuplicateSql = `SELECT * FROM awt_geostate WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, State already exists!" });
    } else {
      // Update the record if no duplicates are found
      const updateSql = `UPDATE awt_geostate SET title = ?, country_id = ?, region_id = ? WHERE id = ?`;
      con.query(updateSql, [title, country_id, region_id, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "State updated successfully!" });
      });
    }
  });
});

// API to soft delete a state
app.post("/deletegeostate", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_geostate SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating state" });
    } else {
      return res.json(data);
    }
  });
});

//Geo City Start
// API to fetch all countries (for the country dropdown)
app.get("/getcountries", (req, res) => {
  const sql = "SELECT * FROM awt_country WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch regions based on selected country (for the region dropdown)
app.get("/getregions/:country_id", (req, res) => {
  const { country_id } = req.params;
  const sql = "SELECT * FROM awt_region WHERE country_id = ? AND deleted = 0";
  con.query(sql, [country_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch geostates based on selected region (for the geostate dropdown)
app.get("/getgeostates/:region_id", (req, res) => {
  const { region_id } = req.params;
  const sql = "SELECT * FROM awt_geostate WHERE region_id = ? AND deleted = 0";
  con.query(sql, [region_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch all cities (joining countries, regions, and geostates)
app.get("/getgeocities", (req, res) => {
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
app.get("/requestgeocity/:id", (req, res) => {
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
app.post("/postgeocity", (req, res) => {
  const { title, country_id, region_id, geostate_id } = req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, City already exists!" });
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
            return res.json({
              message: "Soft-deleted City restored successfully!",
            });
          });
        } else {
          // Insert new entry if no duplicates are found
          const sql = `INSERT INTO awt_geocity (title, country_id, region_id, geostate_id) VALUES (?, ?, ?, ?)`;
          con.query(
            sql,
            [title, country_id, region_id, geostate_id],
            (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({ message: "City added successfully!" });
              }
            }
          );
        }
      });
    }
  });
});

// Update existing geocity with duplicate check
app.put("/putgeocity", (req, res) => {
  const { title, id, country_id, region_id, geostate_id } = req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, City already exists!" });
    } else {
      // Update the record if no duplicates are found
      const updateSql = `UPDATE awt_geocity SET title = ?, country_id = ?, region_id = ?, geostate_id = ? WHERE id = ?`;
      con.query(
        updateSql,
        [title, country_id, region_id, geostate_id, id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.json({ message: "City updated successfully!" });
        }
      );
    }
  });
});

// API to soft delete a city
app.post("/deletegeocity", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_geocity SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting city" });
    } else {
      return res.json(data);
    }
  });
});
// Geo City End

// Area Master Start
// API to fetch all countries (for the country dropdown)
app.get("/getcountries", (req, res) => {
  const sql = "SELECT * FROM awt_country WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch regions based on selected country (for the region dropdown)
app.get("/getregions/:country_id", (req, res) => {
  const { country_id } = req.params;
  const sql = "SELECT * FROM awt_region WHERE country_id = ? AND deleted = 0";
  con.query(sql, [country_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch geostates based on selected region (for the geostate dropdown)
app.get("/getgeostates/:region_id", (req, res) => {
  const { region_id } = req.params;
  const sql = "SELECT * FROM awt_geostate WHERE region_id = ? AND deleted = 0";
  con.query(sql, [region_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch geocities based on selected geostate (for the geocity dropdown)
app.get("/getgeocities_a/:geostate_id", (req, res) => {
  const { geostate_id } = req.params;
  const sql = "SELECT * FROM awt_geocity WHERE geostate_id = ? AND deleted = 0";
  con.query(sql, [geostate_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch all areas (joining country, region, geostate, geocity)
app.get("/getareas", (req, res) => {
  const sql = `
    SELECT a.*, c.title as country_title, r.title as region_title, gs.title as geostate_title, gc.title as geocity_title
    FROM awt_area a
    JOIN awt_country c ON a.country_id = c.id
    JOIN awt_region r ON a.region_id = r.id
    JOIN awt_geostate gs ON a.geostate_id = gs.id
    JOIN awt_geocity gc ON a.geocity_id = gc.id
    WHERE a.deleted = 0
  `;

  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch a specific area by ID (joining country, region, geostate, geocity)
app.get("/requestarea/:id", (req, res) => {
  const areaId = req.params.id; // Get the area ID from the URL parameters

  const sql = `
    SELECT a.*,   
           c.title AS country_title, 
           r.title AS region_title, 
           gs.title AS geostate_title, 
           gc.title AS geocity_title
    FROM awt_area a
    JOIN awt_country c ON a.country_id = c.id
    JOIN awt_region r ON a.region_id = r.id
    JOIN awt_geostate gs ON a.geostate_id = gs.id
    JOIN awt_geocity gc ON a.geocity_id = gc.id
    WHERE a.id = ? AND a.deleted = 0
  `;

  // Using parameterized queries to prevent SQL injection
  con.query(sql, [areaId], (err, data) => {
    if (err) {
      console.error("Error fetching area:", err);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: "Area not found" });
    }

    return res.status(200).json(data[0]); // Return the area data
  });
});

// Insert new area with duplicate check
app.post("/postarea", (req, res) => {
  const { title, country_id, region_id, geostate_id, geocity_id } = req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_area WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Area already exists!" });
    } else {
      const sql = `INSERT INTO awt_area (title, country_id, region_id, geostate_id, geocity_id) VALUES (?, ?, ?, ?, ?)`;
      con.query(
        sql,
        [title, country_id, region_id, geostate_id, geocity_id],
        (err, data) => {
          if (err) {
            return res.json(err);
          } else {
            return res.json({ message: "Area added successfully!" });
          }
        }
      );
    }
  });
});

// Update existing area with duplicate check
app.put("/putarea", (req, res) => {
  const { title, id, country_id, region_id, geostate_id, geocity_id } =
    req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_area WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Area already exists!" });
    } else {
      const updateSql = `UPDATE awt_area SET title = ?, country_id = ?, region_id = ?, geostate_id = ?, geocity_id = ? WHERE id = ?`;
      con.query(
        updateSql,
        [title, country_id, region_id, geostate_id, geocity_id, id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.json({ message: "Area updated successfully!" });
        }
      );
    }
  });
});

// API to soft delete an area
app.post("/deletearea", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_area SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting area" });
    } else {
      return res.json(data);
    }
  });
});
// Area End

// Pincode Master Start
// API to fetch all countries (for the country dropdown)
app.get("/getcountries", (req, res) => {
  const sql = "SELECT * FROM awt_country WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch regions based on selected country (for the region dropdown)
app.get("/getregions/:country_id", (req, res) => {
  const { country_id } = req.params;
  const sql = "SELECT * FROM awt_region WHERE country_id = ? AND deleted = 0";
  con.query(sql, [country_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch geostates based on selected region (for the geostate dropdown)
app.get("/getgeostates/:region_id", (req, res) => {
  const { region_id } = req.params;
  const sql = "SELECT * FROM awt_geostate WHERE region_id = ? AND deleted = 0";
  con.query(sql, [region_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch geocities based on selected geostate (for the geocity dropdown)
app.get("/getgeocities_a/:geostate_id", (req, res) => {
  const { geostate_id } = req.params;
  const sql = "SELECT * FROM awt_geocity WHERE geostate_id = ? AND deleted = 0";
  con.query(sql, [geostate_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch areas based on selected geocity (for the area dropdown)
app.get("/getareas/:geocity_id", (req, res) => {
  const { geocity_id } = req.params;
  const sql = "SELECT * FROM awt_area WHERE geocity_id = ? AND deleted = 0";

  con.query(sql, [geocity_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// API to fetch all pincodes (joining country, region, geostate, geocity, area)
app.get("/getpincodes", (req, res) => {
  const sql = `
    SELECT p.*, 
           c.title as country_title, 
           r.title as region_title, 
           gs.title as geostate_title, 
           gc.title as geocity_title,
           a.title as area_title
    FROM awt_pincode p
    JOIN awt_country c ON p.country_id = c.id
    JOIN awt_region r ON p.region_id = r.id
    JOIN awt_geostate gs ON p.geostate_id = gs.id
    JOIN awt_geocity gc ON p.geocity_id = gc.id
    JOIN awt_area a ON p.area_id = a.id
    WHERE p.deleted = 0
  `;

  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch a specific pincode by ID (joining country, region, geostate, geocity, area)
app.get("/requestpincode/:id", (req, res) => {
  const pincodeId = req.params.id;

  const sql = `
    SELECT p.*, 
           c.title AS country_title, 
           r.title AS region_title, 
           gs.title AS geostate_title, 
           gc.title AS geocity_title,
           a.title AS area_title
    FROM awt_pincode p
    JOIN awt_country c ON p.country_id = c.id
    JOIN awt_region r ON p.region_id = r.id
    JOIN awt_geostate gs ON p.geostate_id = gs.id
    JOIN awt_geocity gc ON p.geocity_id = gc.id
    JOIN awt_area a ON p.area_id = a.id
    WHERE p.id = ? AND p.deleted = 0
  `;

  con.query(sql, [pincodeId], (err, data) => {
    if (err) {
      console.error("Error fetching pincode:", err);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: "Pincode not found" });
    }

    return res.status(200).json(data[0]);
  });
});

// Insert new pincode with duplicate check (considering country_id)
app.post("/postpincode", (req, res) => {
  const { pincode, country_id, region_id, geostate_id, geocity_id, area_id } =
    req.body;

  // Check for duplicates based on pincode and country_id
  const checkDuplicateSql = `SELECT * FROM awt_pincode WHERE pincode = ? AND country_id = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [pincode, country_id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Pincode already exists in this country!",
      });
    } else {
      const sql = `INSERT INTO awt_pincode (pincode, country_id, region_id, geostate_id, geocity_id, area_id) VALUES (?, ?, ?, ?, ?, ?)`;
      con.query(
        sql,
        [pincode, country_id, region_id, geostate_id, geocity_id, area_id],
        (err, data) => {
          if (err) {
            return res.json(err);
          } else {
            return res.json({ message: "Pincode added successfully!" });
          }
        }
      );
    }
  });
});

// Update existing pincode with duplicate check (considering country_id)
app.put("/putpincode", (req, res) => {
  const {
    pincode,
    id,
    country_id,
    region_id,
    geostate_id,
    geocity_id,
    area_id,
  } = req.body;

  // Check for duplicates based on pincode and country_id
  const checkDuplicateSql = `SELECT * FROM awt_pincode WHERE pincode = ? AND country_id = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [pincode, country_id, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Pincode already exists in this country!",
      });
    } else {
      const updateSql = `UPDATE awt_pincode SET pincode = ?, country_id = ?, region_id = ?, geostate_id = ?, geocity_id = ?, area_id = ? WHERE id = ?`;
      con.query(
        updateSql,
        [pincode, country_id, region_id, geostate_id, geocity_id, area_id, id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.json({ message: "Pincode updated successfully!" });
        }
      );
    }
  });
});

// API to soft delete a pincode
app.post("/deletepincode", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_pincode SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting pincode" });
    } else {
      return res.json(data);
    }
  });
});
// Pincode Master End

//Category Start

app.get("/getcat", (req, res) => {
  const sql = "SELECT * FROM awt_category WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});
// Insert for category
app.post("/postdatacat", (req, res) => {
  const { title } = req.body;

  // Step 1: Check if the same title exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_category WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Country already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `SELECT * FROM awt_category WHERE title = ? AND deleted = 1`;
      con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (softDeletedData.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `UPDATE awt_category SET deleted = 0 WHERE title = ?`;
          con.query(restoreSoftDeletedSql, [title], (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.json({
              message: "Soft-deleted data restored successfully!",
            });
          });
        } else {
          // Step 3: Insert new entry if no duplicates found
          const sql = `INSERT INTO awt_category (title) VALUES (?)`;
          con.query(sql, [title], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({ message: "Category added successfully!" });
            }
          });
        }
      });
    }
  });
});

// edit for category

app.get("/requestdatacat/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_category WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// update for category
app.put("/putcatdata", (req, res) => {
  const { title, id } = req.body;

  // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_category WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, title already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_category SET title = ? WHERE id = ?`;
      con.query(updateSql, [title, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "category updated successfully!" });
      });
    }
  });
});

// delete for category
app.post("/deletecatdata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_category SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});

// fetch data for subcategory
app.get("/getsubcategory", (req, res) => {
  const sql =
    "SELECT r.*, c.title as category_title FROM awt_subcat r JOIN awt_category c ON r.category_id = c.id WHERE r.deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// fetch subcat for specific subcats uding id

app.get("/requestsubcat/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_subcat WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// insert for subcategory

app.post("/postsubcategory", (req, res) => {
  const { title, category_id } = req.body;

  // Step 1: Check if the same title exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_subcat WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res
        .status(409)
        .json({ message: "Duplicate entry, subcat already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `SELECT * FROM awt_subcat WHERE title = ? AND deleted = 1`;
      con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (softDeletedData.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `UPDATE awt_subcat SET deleted = 0 WHERE title = ?`;
          con.query(restoreSoftDeletedSql, [title], (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.json({
              message: "Soft-deleted subcat restored successfully!",
            });
          });
        } else {
          // Step 3: Insert new entry if no duplicates found
          const sql = `INSERT INTO awt_subcat (title, category_id) VALUES (?, ?)`;
          con.query(sql, [title, category_id], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({ message: "subcat added successfully!" });
            }
          });
        }
      });
    }
  });
});

// update for subcategory
app.put("/putsubcategory", (req, res) => {
  const { title, id, category_id } = req.body;

  // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_subcat WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, subcat already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_subcat SET title = ?, category_id = ? WHERE id = ?`;
      con.query(updateSql, [title, category_id, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "subcat updated successfully!" });
      });
    }
  });
});

// delete for subcategory
app.post("/deletesubcat", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_subcat SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating subcat" });
    } else {
      return res.json(data);
    }
  });
});

//fetch data for category dropdown
app.get("/getcategory", (req, res) => {
  const sql = "SELECT * FROM awt_category WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});
//

app.get("/getcdata", (req, res) => {
  const sql = "SELECT * FROM awt_channelpartner WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});
// Insert for Channelpartner
app.post("/postcdata", (req, res) => {
  const { Channelpartner } = req.body;

  // Step 1: Check if the same channelpartner exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_channelpartner WHERE Channelpartner = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Channelpartner], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Channelpartner already exists!" });
    } else {
      // Step 2: Check if the same channelpartner exists but is soft-deleted
      const checkSoftDeletedSql = `SELECT * FROM awt_channelpartner WHERE Channelpartner = ? AND deleted = 1`;
      con.query(
        checkSoftDeletedSql,
        [Channelpartner],
        (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            // If soft-deleted data exists, restore the entry
            const restoreSoftDeletedSql = `UPDATE awt_channelpartner SET deleted = 0 WHERE Channelpartner = ?`;
            con.query(restoreSoftDeletedSql, [Channelpartner], (err) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.json({
                message: "Soft-deleted data restored successfully!",
              });
            });
          } else {
            // Step 3: Insert new entry if no duplicates found
            const sql = `INSERT INTO awt_channelpartner (Channelpartner) VALUES (?)`;
            con.query(sql, [Channelpartner], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({
                  message: "Channel partner added successfully!",
                });
              }
            });
          }
        }
      );
    }
  });
});

// edit for Channelpartner

app.get("/requestcdata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_channelpartner WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// update for Channelpartner
app.put("/putcdata", (req, res) => {
  const { Channelpartner, id } = req.body;

  // Step 1: Check if the same channelpartner exists for another record (other than the current one) and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM awt_channelpartner WHERE Channelpartner = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Channelpartner, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Channelpartner already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_channelpartner SET Channelpartner = ? WHERE id = ?`;
      con.query(updateSql, [Channelpartner, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: " Channelpartner updated successfully!" });
      });
    }
  });
});

// delete for Channelpartner
app.post("/deletecdata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_channelpartner SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});

// complaint code
app.get("/getcom", (req, res) => {
  const sql = "SELECT * FROM complaint_code WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});
// Insert for complaintcode
app.post("/postdatacom", (req, res) => {
  const { id, complaintcode, created_by } = req.body;

  if (id) {
    // Step 1: Check if the same complaintcode exists and is not soft-deleted for other IDs
    const checkDuplicateSql = `SELECT * FROM complaint_code WHERE complaintcode = ? AND id != ? AND deleted = 0`;
    con.query(checkDuplicateSql, [complaintcode, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        // If duplicate data exists for another ID
        return res
          .status(409)
          .json({ message: "Duplicate entry, complaintcode already exists!" });
      } else {
        // Step 2: Update the entry with the given ID
        const updateSql = `UPDATE complaint_code SET complaintcode = ?, updated_date = NOW(), updated_by = ? WHERE id = ?`;
        con.query(updateSql, [complaintcode, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "complaintcode updated successfully!" });
          }
        });
      }
    });
  } else {
    // Step 3: Same logic as before for insert if ID is not provided
    // Check if the same complaintcode exists and is not soft-deleted
    const checkDuplicateSql = `SELECT * FROM complaint_code WHERE complaintcode = ? AND deleted = 0`;
    con.query(checkDuplicateSql, [complaintcode], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        // If duplicate data exists (not soft-deleted)
        return res
          .status(409)
          .json({ message: "Duplicate entry, complaintcode already exists!" });
      } else {
        // Check if the same complaintcode exists but is soft-deleted
        const checkSoftDeletedSql = `SELECT * FROM complaint_code WHERE complaintcode = ? AND deleted = 1`;
        con.query(
          checkSoftDeletedSql,
          [complaintcode],
          (err, softDeletedData) => {
            if (err) {
              return res.status(500).json(err);
            }

            if (softDeletedData.length > 0) {
              // If soft-deleted data exists, restore the entry
              const restoreSoftDeletedSql = `UPDATE complaint_code SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE complaintcode = ?`;
              con.query(
                restoreSoftDeletedSql,
                [created_by, complaintcode],
                (err) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  return res.json({
                    message: "Soft-deleted data restored successfully!",
                  });
                }
              );
            } else {
              // Insert new entry if no duplicates found
              const sql = `INSERT INTO complaint_code (complaintcode, created_date, created_by) VALUES (?, NOW(), ?)`;
              con.query(sql, [complaintcode, created_by], (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json({
                    message: "complaintcode added successfully!",
                  });
                }
              });
            }
          }
        );
      }
    });
  }
});

// edit for complaintcode

app.get("/requestdatacom/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM complaint_code WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// update for complaintcode
app.put("/putcomdata", (req, res) => {
  const { id, complaintcode, updated_by } = req.body;

  // Step 1: Check if the updated complaintcode already exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM complaint_code WHERE complaintcode = ? AND deleted = 0 AND id != ?`;
  con.query(checkDuplicateSql, [complaintcode, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists
      return res
        .status(409)
        .json({ message: "Duplicate entry, complaintcode already exists!" });
    } else {
      // Step 2: Update complaintcode data if no duplicates found
      const sql = `UPDATE complaint_code SET complaintcode = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0`;
      con.query(sql, [complaintcode, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "complaintcode updated successfully!" });
        }
      });
    }
  });
});

// delete for complaintcode
app.post("/deletecomdata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE complaint_code SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});

//Reason Code Start
// Get all reason codes
app.get("/getreason", (req, res) => {
  const sql = "SELECT * FROM reason_code WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert or update reason code
app.post("/postdatareason", (req, res) => {
  const { id, reasoncode, created_by } = req.body;

  if (id) {
    // Step 1: Check if the same reasoncode exists and is not soft-deleted for other IDs
    const checkDuplicateSql = `SELECT * FROM reason_code WHERE reasoncode = ? AND id != ? AND deleted = 0`;
    con.query(checkDuplicateSql, [reasoncode, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        // If duplicate data exists for another ID
        return res
          .status(409)
          .json({ message: "Duplicate entry, reasoncode already exists!" });
      } else {
        // Step 2: Update the entry with the given ID
        const updateSql = `UPDATE reason_code SET reasoncode = ?, updated_date = NOW(), updated_by = ? WHERE id = ?`;
        con.query(updateSql, [reasoncode, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "reasoncode updated successfully!" });
          }
        });
      }
    });
  } else {
    // Step 3: Same logic as before for insert if ID is not provided
    // Check if the same reasoncode exists and is not soft-deleted
    const checkDuplicateSql = `SELECT * FROM reason_code WHERE reasoncode = ? AND deleted = 0`;
    con.query(checkDuplicateSql, [reasoncode], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        // If duplicate data exists (not soft-deleted)
        return res
          .status(409)
          .json({ message: "Duplicate entry, reasoncode already exists!" });
      } else {
        // Check if the same reasoncode exists but is soft-deleted
        const checkSoftDeletedSql = `SELECT * FROM reason_code WHERE reasoncode = ? AND deleted = 1`;
        con.query(checkSoftDeletedSql, [reasoncode], (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            // If soft-deleted data exists, restore the entry
            const restoreSoftDeletedSql = `UPDATE reason_code SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE reasoncode = ?`;
            con.query(
              restoreSoftDeletedSql,
              [created_by, reasoncode],
              (err) => {
                if (err) {
                  return res.status(500).json(err);
                }
                return res.json({
                  message: "Soft-deleted data restored successfully!",
                });
              }
            );
          } else {
            // Insert new entry if no duplicates found
            const sql = `INSERT INTO reason_code (reasoncode, created_date, created_by) VALUES (?, NOW(), ?)`;
            con.query(sql, [reasoncode, created_by], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({ message: "reasoncode added successfully!" });
              }
            });
          }
        });
      }
    });
  }
});

// Edit reason code by ID
app.get("/requestdatareason/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM reason_code WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update reason code
app.put("/putreasondata", (req, res) => {
  const { id, reasoncode, updated_by } = req.body;

  // Step 1: Check if the updated reasoncode already exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM reason_code WHERE reasoncode = ? AND deleted = 0 AND id != ?`;
  con.query(checkDuplicateSql, [reasoncode, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists
      return res
        .status(409)
        .json({ message: "Duplicate entry, reasoncode already exists!" });
    } else {
      // Step 2: Update reasoncode data if no duplicates found
      const sql = `UPDATE reason_code SET reasoncode = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0`;
      con.query(sql, [reasoncode, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "reasoncode updated successfully!" });
        }
      });
    }
  });
});

// Soft-delete reason code by ID
app.post("/deletereasondata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE reason_code SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
// Reason Code end

//action code Start

app.get("/getaction", (req, res) => {
  const sql = "SELECT * FROM action_code WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for actioncode
app.post("/postdataaction", (req, res) => {
  const { id, actioncode, created_by } = req.body;

  if (id) {
    const checkDuplicateSql = `SELECT * FROM action_code WHERE actioncode = ? AND id != ? AND deleted = 0`;
    con.query(checkDuplicateSql, [actioncode, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, actioncode already exists!" });
      } else {
        const updateSql = `UPDATE action_code SET actioncode = ?, updated_date = NOW(), updated_by = ? WHERE id = ?`;
        con.query(updateSql, [actioncode, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "actioncode updated successfully!" });
          }
        });
      }
    });
  } else {
    const checkDuplicateSql = `SELECT * FROM action_code WHERE actioncode = ? AND deleted = 0`;
    con.query(checkDuplicateSql, [actioncode], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, actioncode already exists!" });
      } else {
        const checkSoftDeletedSql = `SELECT * FROM action_code WHERE actioncode = ? AND deleted = 1`;
        con.query(checkSoftDeletedSql, [actioncode], (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            const restoreSoftDeletedSql = `UPDATE action_code SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE actioncode = ?`;
            con.query(
              restoreSoftDeletedSql,
              [created_by, actioncode],
              (err) => {
                if (err) {
                  return res.status(500).json(err);
                }
                return res.json({
                  message: "Soft-deleted data restored successfully!",
                });
              }
            );
          } else {
            const sql = `INSERT INTO action_code (actioncode, created_date, created_by) VALUES (?, NOW(), ?)`;
            con.query(sql, [actioncode, created_by], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({ message: "actioncode added successfully!" });
              }
            });
          }
        });
      }
    });
  }
});

// edit for actioncode
app.get("/requestdataaction/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM action_code WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// update for actioncode
app.put("/putactiondata", (req, res) => {
  const { id, actioncode, updated_by } = req.body;

  const checkDuplicateSql = `SELECT * FROM action_code WHERE actioncode = ? AND deleted = 0 AND id != ?`;
  con.query(checkDuplicateSql, [actioncode, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, actioncode already exists!" });
    } else {
      const sql = `UPDATE action_code SET actioncode = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0`;
      con.query(sql, [actioncode, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "actioncode updated successfully!" });
        }
      });
    }
  });
});

// delete for actioncode
app.post("/deleteactiondata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE action_code SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
// action code end

//service agent  code start
// Service agent code
app.get("/getsdata", (req, res) => {
  const sql = "SELECT * FROM service_agent WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for serviceagent
app.post("/postsdata", (req, res) => {
  const { id, serviceagent, created_by } = req.body;

  if (id) {
    // Step 1: Check if the same serviceagent exists and is not soft-deleted for other IDs
    const checkDuplicateSql = `SELECT * FROM service_agent WHERE serviceagent = ? AND id != ? AND deleted = 0`;
    con.query(checkDuplicateSql, [serviceagent, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        // If duplicate data exists for another ID
        return res
          .status(409)
          .json({ message: "Duplicate entry, serviceagent already exists!" });
      } else {
        // Step 2: Update the entry with the given ID
        const updateSql = `UPDATE service_agent SET serviceagent = ?, updated_date = NOW(), updated_by = ? WHERE id = ?`;
        con.query(updateSql, [serviceagent, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "serviceagent updated successfully!" });
          }
        });
      }
    });
  } else {
    // Step 3: Same logic as before for insert if ID is not provided
    // Check if the same serviceagent exists and is not soft-deleted
    const checkDuplicateSql = `SELECT * FROM service_agent WHERE serviceagent = ? AND deleted = 0`;
    con.query(checkDuplicateSql, [serviceagent], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        // If duplicate data exists (not soft-deleted)
        return res
          .status(409)
          .json({ message: "Duplicate entry, serviceagent already exists!" });
      } else {
        // Check if the same serviceagent exists but is soft-deleted
        const checkSoftDeletedSql = `SELECT * FROM service_agent WHERE serviceagent = ? AND deleted = 1`;
        con.query(
          checkSoftDeletedSql,
          [serviceagent],
          (err, softDeletedData) => {
            if (err) {
              return res.status(500).json(err);
            }

            if (softDeletedData.length > 0) {
              // If soft-deleted data exists, restore the entry
              const restoreSoftDeletedSql = `UPDATE service_agent SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE serviceagent = ?`;
              con.query(
                restoreSoftDeletedSql,
                [created_by, serviceagent],
                (err) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  return res.json({
                    message: "Soft-deleted data restored successfully!",
                  });
                }
              );
            } else {
              // Insert new entry if no duplicates found
              const sql = `INSERT INTO service_agent (serviceagent, created_date, created_by) VALUES (?, NOW(), ?)`;
              con.query(sql, [serviceagent, created_by], (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json({
                    message: "serviceagent added successfully!",
                  });
                }
              });
            }
          }
        );
      }
    });
  }
});

// Edit for serviceagent
app.get("/requestsdata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM service_agent WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update for serviceagent
app.put("/putsdata", (req, res) => {
  const { id, serviceagent, updated_by } = req.body;

  // Step 1: Check if the updated serviceagent already exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM service_agent WHERE serviceagent = ? AND deleted = 0 AND id != ?`;
  con.query(checkDuplicateSql, [serviceagent, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists
      return res
        .status(409)
        .json({ message: "Duplicate entry, serviceagent already exists!" });
    } else {
      // Step 2: Update serviceagent data if no duplicates found
      const sql = `UPDATE service_agent SET serviceagent = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0`;
      con.query(sql, [serviceagent, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "serviceagent updated successfully!" });
        }
      });
    }
  });
});

// Delete for serviceagent
app.post("/deletesdata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE service_agent SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
//serviceagent end

// call status code start
app.get("/getcalldata", (req, res) => {
  const sql = "SELECT * FROM call_status WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for Callstatus
app.post("/postcalldata", (req, res) => {
  const { Callstatus } = req.body;

  // Step 1: Check if the same Callstatus exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM call_status WHERE Callstatus = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Callstatus], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Callstatus already exists!" });
    } else {
      // Step 2: Check if the same Callstatus exists but is soft-deleted
      const checkSoftDeletedSql = `SELECT * FROM call_status WHERE Callstatus = ? AND deleted = 1`;
      con.query(checkSoftDeletedSql, [Callstatus], (err, softDeletedData) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (softDeletedData.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `UPDATE call_status SET deleted = 0 WHERE Callstatus = ?`;
          con.query(restoreSoftDeletedSql, [Callstatus], (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.json({
              message: "Soft-deleted data restored successfully!",
            });
          });
        } else {
          // Step 3: Insert new entry if no duplicates found
          const sql = `INSERT INTO call_status (Callstatus) VALUES (?)`;
          con.query(sql, [Callstatus], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({
                message: "Channel partner added successfully!",
              });
            }
          });
        }
      });
    }
  });
});

// Edit for Callstatus
app.get("/requestcalldata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM call_status WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update for Callstatus
app.put("/putcalldata", (req, res) => {
  const { Callstatus, id } = req.body;

  // Step 1: Check if the same Callstatus exists for another record (other than the current one) and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM call_status WHERE Callstatus = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Callstatus, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Callstatus already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE call_status SET Callstatus = ? WHERE id = ?`;
      con.query(updateSql, [Callstatus, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: " Callstatus updated successfully!" });
      });
    }
  });
});

// Delete for Callstatus
app.post("/deletecalldata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE call_status SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
//call status end

// Lhi User code start
// Lhi User code start
app.get("/getlhidata", (req, res) => {
  const sql = "SELECT * FROM lhi_user WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for Lhiuser
app.post("/postlhidata", (req, res) => {
  const { Lhiuser } = req.body;

  // Step 1: Check if the same Lhiuser exists and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM lhi_user WHERE Lhiuser = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Lhiuser], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Lhiuser already exists!" });
    } else {
      // Step 2: Check if the same Lhiuser exists but is soft-deleted
      const checkSoftDeletedSql = `SELECT * FROM lhi_user WHERE Lhiuser = ? AND deleted = 1`;
      con.query(checkSoftDeletedSql, [Lhiuser], (err, softDeletedData) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (softDeletedData.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `UPDATE lhi_user SET deleted = 0 WHERE Lhiuser = ?`;
          con.query(restoreSoftDeletedSql, [Lhiuser], (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.json({
              message: "Soft-deleted data restored successfully!",
            });
          });
        } else {
          // Step 3: Insert new entry if no duplicates found
          const sql = `INSERT INTO lhi_user (Lhiuser) VALUES (?)`;
          con.query(sql, [Lhiuser], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({
                message: "Channel partner added successfully!",
              });
            }
          });
        }
      });
    }
  });
});

// edit for Lhiuser
app.get("/requestlhidata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM lhi_user WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// update for Lhiuser
app.put("/putlhidata", (req, res) => {
  const { Lhiuser, id } = req.body;

  // Step 1: Check if the same Lhiuser exists for another record (other than the current one) and is not soft-deleted
  const checkDuplicateSql = `SELECT * FROM lhi_user WHERE Lhiuser = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Lhiuser, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Lhiuser already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE lhi_user SET Lhiuser = ? WHERE id = ?`;
      con.query(updateSql, [Lhiuser, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: " Lhiuser updated successfully!" });
      });
    }
  });
});

// delete for Lhiuser
app.post("/deletelhidata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE lhi_user SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
//lhi user code end

// service product code start
app.get("/getprodata", (req, res) => {
  const sql = "SELECT * FROM service_product WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for Serviceproduct
app.post("/postprodata", (req, res) => {
  const { Serviceproduct } = req.body;

  const checkDuplicateSql = `SELECT * FROM service_product WHERE Serviceproduct = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Serviceproduct], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Serviceproduct already exists!" });
    } else {
      const checkSoftDeletedSql = `SELECT * FROM service_product WHERE Serviceproduct = ? AND deleted = 1`;
      con.query(
        checkSoftDeletedSql,
        [Serviceproduct],
        (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            const restoreSoftDeletedSql = `UPDATE service_product SET deleted = 0 WHERE Serviceproduct = ?`;
            con.query(restoreSoftDeletedSql, [Serviceproduct], (err) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.json({
                message: "Soft-deleted data restored successfully!",
              });
            });
          } else {
            const sql = `INSERT INTO service_product (Serviceproduct) VALUES (?)`;
            con.query(sql, [Serviceproduct], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({
                  message: "Channel partner added successfully!",
                });
              }
            });
          }
        }
      );
    }
  });
});

// edit for Serviceproduct
app.get("/requestprodata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM service_product WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// update for Serviceproduct
app.put("/putprodata", (req, res) => {
  const { Serviceproduct, id } = req.body;

  const checkDuplicateSql = `SELECT * FROM service_product WHERE Serviceproduct = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Serviceproduct, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Serviceproduct already exists!" });
    } else {
      const updateSql = `UPDATE service_product SET Serviceproduct = ? WHERE id = ?`;
      con.query(updateSql, [Serviceproduct, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: " Serviceproduct updated successfully!" });
      });
    }
  });
});

// delete for Serviceproduct
app.post("/deleteprodata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE service_product SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
// Service product end

// Rate Card code start
app.get("/getratedata", (req, res) => {
  const sql = "SELECT * FROM rate_card WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for Ratecard
app.post("/postratedata", (req, res) => {
  const { Ratecard } = req.body;

  const checkDuplicateSql = `SELECT * FROM rate_card WHERE Ratecard = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Ratecard], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Ratecard already exists!" });
    } else {
      const checkSoftDeletedSql = `SELECT * FROM rate_card WHERE Ratecard = ? AND deleted = 1`;
      con.query(checkSoftDeletedSql, [Ratecard], (err, softDeletedData) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (softDeletedData.length > 0) {
          const restoreSoftDeletedSql = `UPDATE rate_card SET deleted = 0 WHERE Ratecard = ?`;
          con.query(restoreSoftDeletedSql, [Ratecard], (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.json({
              message: "Soft-deleted data restored successfully!",
            });
          });
        } else {
          const sql = `INSERT INTO rate_card (Ratecard) VALUES (?)`;
          con.query(sql, [Ratecard], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({
                message: "Channel partner added successfully!",
              });
            }
          });
        }
      });
    }
  });
});

// edit for Ratecard
app.get("/requestratedata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM rate_card WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// update for Ratecard
app.put("/putratedata", (req, res) => {
  const { Ratecard, id } = req.body;

  const checkDuplicateSql = `SELECT * FROM rate_card WHERE Ratecard = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [Ratecard, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Ratecard already exists!" });
    } else {
      const updateSql = `UPDATE rate_card SET Ratecard = ? WHERE id = ?`;
      con.query(updateSql, [Ratecard, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: " Ratecard updated successfully!" });
      });
    }
  });
});

// delete for Ratecard
app.post("/deleteratedata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE rate_card SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
//Rate card code end

//Manufacturer Start
// API to fetch all Manufacturer that are not soft deleted
app.get("/getmanufacturer", (req, res) => {
  const sql = "SELECT * FROM manufacturer WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for Manufacturer
app.post("/postmanufacturer", (req, res) => {
  const { id, Manufacturer, created_by } = req.body;

  if (id) {
    const checkDuplicateSql =
      "SELECT * FROM manufacturer WHERE Manufacturer = ? AND id != ? AND deleted = 0";
    con.query(checkDuplicateSql, [Manufacturer, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Manufacturer already exists!" });
      } else {
        const updateSql =
          "UPDATE manufacturer SET Manufacturer = ?, updated_date = NOW(), updated_by = ? WHERE id = ?";
        con.query(updateSql, [Manufacturer, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "Manufacturer updated successfully!" });
          }
        });
      }
    });
  } else {
    const checkDuplicateSql =
      "SELECT * FROM manufacturer WHERE Manufacturer = ? AND deleted = 0";
    con.query(checkDuplicateSql, [Manufacturer], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Manufacturer already exists!" });
      } else {
        const checkSoftDeletedSql =
          "SELECT * FROM manufacturer WHERE Manufacturer = ? AND deleted = 1";
        con.query(
          checkSoftDeletedSql,
          [Manufacturer],
          (err, softDeletedData) => {
            if (err) {
              return res.status(500).json(err);
            }

            if (softDeletedData.length > 0) {
              const restoreSoftDeletedSql =
                "UPDATE manufacturer SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE Manufacturer = ?";
              con.query(
                restoreSoftDeletedSql,
                [created_by, Manufacturer],
                (err) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  return res.json({
                    message: "Soft-deleted Manufacturer restored successfully!",
                  });
                }
              );
            } else {
              const sql =
                "INSERT INTO manufacturer (Manufacturer, created_date, created_by) VALUES (?, NOW(), ?)";
              con.query(sql, [Manufacturer, created_by], (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json({
                    message: "Manufacturer added successfully!",
                  });
                }
              });
            }
          }
        );
      }
    });
  }
});

// Edit for Manufacturer
app.get("/requestmanufacturer/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM manufacturer WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update for Manufacturer
app.put("/putmanufacturer", (req, res) => {
  const { id, Manufacturer, updated_by } = req.body;

  const checkDuplicateSql =
    "SELECT * FROM manufacturer WHERE Manufacturer = ? AND deleted = 0 AND id != ?";
  con.query(checkDuplicateSql, [Manufacturer, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Manufacturer already exists!" });
    } else {
      const sql =
        "UPDATE manufacturer SET Manufacturer = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0";
      con.query(sql, [Manufacturer, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "Manufacturer updated successfully!" });
        }
      });
    }
  });
});

// Delete for Manufacturer
app.post("/delmanufacturer", (req, res) => {
  const { id } = req.body;
  const sql = "UPDATE manufacturer SET deleted = 1 WHERE id = ?";
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating Manufacturer" });
    } else {
      return res.json(data);
    }
  });
});
// Manufacturer End
//Material Start
// API to fetch all materials that are not soft deleted
app.get("/getmat", (req, res) => {
  const sql = "SELECT * FROM material WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for material
app.post("/postdatamat", (req, res) => {
  const { id, Material, created_by } = req.body;

  if (id) {
    const checkDuplicateSql =
      "SELECT * FROM material WHERE material = ? AND id != ? AND deleted = 0";
    con.query(checkDuplicateSql, [Material, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Material already exists!" });
      } else {
        const updateSql =
          "UPDATE material SET material = ?, updated_date = NOW(), updated_by = ? WHERE id = ?";
        con.query(updateSql, [Material, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "Material updated successfully!" });
          }
        });
      }
    });
  } else {
    const checkDuplicateSql =
      "SELECT * FROM material WHERE material = ? AND deleted = 0";
    con.query(checkDuplicateSql, [Material], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Material already exists!" });
      } else {
        const checkSoftDeletedSql =
          "SELECT * FROM material WHERE material = ? AND deleted = 1";
        con.query(checkSoftDeletedSql, [Material], (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            const restoreSoftDeletedSql =
              "UPDATE material SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE material = ?";
            con.query(restoreSoftDeletedSql, [created_by, Material], (err) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.json({
                message: "Soft-deleted data restored successfully!",
              });
            });
          } else {
            const sql =
              "INSERT INTO material (material, created_date, created_by) VALUES (?, NOW(), ?)";
            con.query(sql, [Material, created_by], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({ message: "Material added successfully!" });
              }
            });
          }
        });
      }
    });
  }
});

// Edit for material
app.get("/requestdatamat/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM material WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update for material
app.put("/putmatdata", (req, res) => {
  const { id, Material, updated_by } = req.body;

  const checkDuplicateSql =
    "SELECT * FROM material WHERE material = ? AND deleted = 0 AND id != ?";
  con.query(checkDuplicateSql, [Material, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Material already exists!" });
    } else {
      const sql =
        "UPDATE material SET material = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0";
      con.query(sql, [Material, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "Material updated successfully!" });
        }
      });
    }
  });
});

// Delete for material
app.post("/deletematdata", (req, res) => {
  const { id } = req.body;
  const sql = "UPDATE material SET deleted = 1 WHERE id = ?";
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating Material" });
    } else {
      return res.json(data);
    }
  });
});
// Material End

//Material Start
// API to fetch all materials that are not soft deleted
app.get("/getmat", (req, res) => {
  const sql = "SELECT * FROM material WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for material
app.post("/postdatamat", (req, res) => {
  const { id, Material, created_by } = req.body;

  if (id) {
    const checkDuplicateSql =
      "SELECT * FROM material WHERE material = ? AND id != ? AND deleted = 0";
    con.query(checkDuplicateSql, [Material, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Material already exists!" });
      } else {
        const updateSql =
          "UPDATE material SET material = ?, updated_date = NOW(), updated_by = ? WHERE id = ?";
        con.query(updateSql, [Material, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "Material updated successfully!" });
          }
        });
      }
    });
  } else {
    const checkDuplicateSql =
      "SELECT * FROM material WHERE material = ? AND deleted = 0";
    con.query(checkDuplicateSql, [Material], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Material already exists!" });
      } else {
        const checkSoftDeletedSql =
          "SELECT * FROM material WHERE material = ? AND deleted = 1";
        con.query(checkSoftDeletedSql, [Material], (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            const restoreSoftDeletedSql =
              "UPDATE material SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE material = ?";
            con.query(restoreSoftDeletedSql, [created_by, Material], (err) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.json({
                message: "Soft-deleted data restored successfully!",
              });
            });
          } else {
            const sql =
              "INSERT INTO material (material, created_date, created_by) VALUES (?, NOW(), ?)";
            con.query(sql, [Material, created_by], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({ message: "Material added successfully!" });
              }
            });
          }
        });
      }
    });
  }
});

// Edit for material
app.get("/requestdatamat/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM material WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update for material
app.put("/putmatdata", (req, res) => {
  const { id, Material, updated_by } = req.body;

  const checkDuplicateSql =
    "SELECT * FROM material WHERE material = ? AND deleted = 0 AND id != ?";
  con.query(checkDuplicateSql, [Material, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Material already exists!" });
    } else {
      const sql =
        "UPDATE material SET material = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0";
      con.query(sql, [Material, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "Material updated successfully!" });
        }
      });
    }
  });
});

// Delete for material
app.post("/deletematdata", (req, res) => {
  const { id } = req.body;
  const sql = "UPDATE material SET deleted = 1 WHERE id = ?";
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating Material" });
    } else {
      return res.json(data);
    }
  });
});
// Material End
//Product Line Start
// API to fetch all product lines that are not soft deleted
app.get("/getproductline", (req, res) => {
  const sql = "SELECT * FROM product_line WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for product line
app.post("/postdataproductline", (req, res) => {
  const { id, product_line, pline_code, created_by } = req.body;

  if (id) {
    const checkDuplicateSql =
      "SELECT * FROM product_line WHERE product_line = ? AND id != ? AND deleted = 0";
    con.query(checkDuplicateSql, [product_line, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Product Line already exists!" });
      } else {
        const updateSql =
          "UPDATE product_line SET product_line = ?, pline_code = ?, updated_date = NOW(), updated_by = ? WHERE id = ?";
        con.query(
          updateSql,
          [product_line, pline_code, created_by, id],
          (err, result) => {
            if (err) {
              return res.status(500).json(err);
            } else {
              return res.json({
                message: "Product Line updated successfully!",
              });
            }
          }
        );
      }
    });
  } else {
    const checkDuplicateSql =
      "SELECT * FROM product_line WHERE product_line = ? AND deleted = 0";
    con.query(checkDuplicateSql, [product_line], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, Product Line already exists!" });
      } else {
        const checkSoftDeletedSql =
          "SELECT * FROM product_line WHERE product_line = ? AND deleted = 1";
        con.query(
          checkSoftDeletedSql,
          [product_line],
          (err, softDeletedData) => {
            if (err) {
              return res.status(500).json(err);
            }
            if (softDeletedData.length > 0) {
              const restoreSoftDeletedSql =
                "UPDATE product_line SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE product_line = ?";
              con.query(
                restoreSoftDeletedSql,
                [created_by, product_line],
                (err) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  return res.json({
                    message: "Soft-deleted data restored successfully!",
                  });
                }
              );
            } else {
              const sql =
                "INSERT INTO product_line (product_line, pline_code, created_date, created_by) VALUES (?, ?, NOW(), ?)";
              con.query(
                sql,
                [product_line, pline_code, created_by],
                (err, data) => {
                  if (err) {
                    return res.json(err);
                  } else {
                    return res.json({
                      message: "Product Line added successfully!",
                    });
                  }
                }
              );
            }
          }
        );
      }
    });
  }
});

// Edit for product line
app.get("/requestdataproductline/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM product_line WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update for product line
app.put("/putproductlinedata", (req, res) => {
  const { id, product_line, pline_code, updated_by } = req.body;
  const checkDuplicateSql =
    "SELECT * FROM product_line WHERE product_line = ? AND deleted = 0 AND id != ?";
  con.query(checkDuplicateSql, [product_line, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Product Line already exists!" });
    } else {
      const sql =
        "UPDATE product_line SET product_line = ?, pline_code = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0";
      con.query(
        sql,
        [product_line, pline_code, updated_by, id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "Product Line updated successfully!" });
          }
        }
      );
    }
  });
});

// Delete for product line
app.post("/deleteproductlinedata", (req, res) => {
  const { id } = req.body;
  const sql = "UPDATE product_line SET deleted = 1 WHERE id = ?";
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating Product Line" });
    } else {
      return res.json(data);
    }
  });
});

// Product Line End

// ProductType Start
// API to fetch all Product Types that are not soft-deleted
app.get("/getproducttype", (req, res) => {
  const sql = "SELECT * FROM product_type WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Insert for Product Type
app.post("/postdataproducttype", (req, res) => {
  const { id, product_type, created_by } = req.body;

  if (id) {
    const checkDuplicateSql = `SELECT * FROM product_type WHERE product_type = ? AND id != ? AND deleted = 0`;
    con.query(checkDuplicateSql, [product_type, id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, ProductType already exists!" });
      } else {
        const updateSql = `UPDATE product_type SET product_type = ?, updated_date = NOW(), updated_by = ? WHERE id = ?`;
        con.query(updateSql, [product_type, created_by, id], (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.json({ message: "ProductType updated successfully!" });
          }
        });
      }
    });
  } else {
    const checkDuplicateSql = `SELECT * FROM product_type WHERE product_type = ? AND deleted = 0`;
    con.query(checkDuplicateSql, [product_type], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate entry, ProductType already exists!" });
      } else {
        const checkSoftDeletedSql = `SELECT * FROM product_type WHERE product_type = ? AND deleted = 1`;
        con.query(
          checkSoftDeletedSql,
          [product_type],
          (err, softDeletedData) => {
            if (err) {
              return res.status(500).json(err);
            }

            if (softDeletedData.length > 0) {
              const restoreSoftDeletedSql = `UPDATE product_type SET deleted = 0, updated_date = NOW(), updated_by = ? WHERE product_type = ?`;
              con.query(
                restoreSoftDeletedSql,
                [created_by, product_type],
                (err) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  return res.json({
                    message: "Soft-deleted data restored successfully!",
                  });
                }
              );
            } else {
              const sql = `INSERT INTO product_type (product_type, created_date, created_by) VALUES (?, NOW(), ?)`;
              con.query(sql, [product_type, created_by], (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json({
                    message: "ProductType added successfully!",
                  });
                }
              });
            }
          }
        );
      }
    });
  }
});

// Edit for Product Type
app.get("/requestdataproducttype/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM product_type WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

// Update for Product Type
app.put("/putproducttypedata", (req, res) => {
  const { id, product_type, updated_by } = req.body;

  const checkDuplicateSql = `SELECT * FROM product_type WHERE product_type = ? AND deleted = 0 AND id != ?`;
  con.query(checkDuplicateSql, [product_type, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, ProductType already exists!" });
    } else {
      const sql = `UPDATE product_type SET product_type = ?, updated_by = ?, updated_date = NOW() WHERE id = ? AND deleted = 0`;
      con.query(sql, [product_type, updated_by, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.json({ message: "ProductType updated successfully!" });
        }
      });
    }
  });
});

// Delete for Product Type
app.post("/deleteproducttypedata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE product_type SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error updating user" });
    } else {
      return res.json(data);
    }
  });
});
//Product Type End

// Start Franchise Master - Parent
app.get("/getfranchisedata", (req, res) => {
  const sql = "SELECT * FROM awt_franchisemaster WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.get("/requestfranchisedata/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_franchisemaster WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

app.post("/postfranchisedata", (req, res) => {
  const { title } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_franchisemaster WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Franchise Master already exists!" });
    } else {
      const checkSoftDeletedSql = `SELECT * FROM awt_franchisemaster WHERE title = ? AND deleted = 1`;
      con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (softDeletedData.length > 0) {
          const restoreSoftDeletedSql = `UPDATE awt_franchisemaster SET deleted = 0 WHERE title = ?`;
          con.query(restoreSoftDeletedSql, [title], (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.json({
              message: "Soft-deleted Franchise Master restored successfully!",
            });
          });
        } else {
          const sql = `INSERT INTO awt_franchisemaster (title) VALUES (?)`;
          con.query(sql, [title], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({
                message: "Franchise Master added successfully!",
              });
            }
          });
        }
      });
    }
  });
});

app.put("/putfranchisedata", (req, res) => {
  const { title, id } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_franchisemaster WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Franchise Master already exists!" });
    } else {
      const updateSql = `UPDATE awt_franchisemaster SET title = ? WHERE id = ?`;
      con.query(updateSql, [title, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "Franchise Master updated successfully!" });
      });
    }
  });
});

app.post("/deletefranchisedata", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_franchisemaster SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error updating Franchise Master" });
    } else {
      return res.json(data);
    }
  });
});

// End Franchise Master - Parents

//Start Child Franchise Master

app.get("/getparentfranchise", (req, res) => {
  const sql = "SELECT * FROM awt_franchisemaster WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

app.get("/getchildfranchise", (req, res) => {
  const sql =
    "SELECT r.*, c.title as parentfranchise_title FROM awt_childfranchisemaster r INNER JOIN awt_franchisemaster c ON r.pfranchise_id = c.id WHERE r.deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.get("/requestchildfranchise/:id", (req, res) => {
  const { id } = req.params;
  const sql =
    "SELECT * FROM awt_childfranchisemaster WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

app.post("/postchildfranchise", (req, res) => {
  const { title, pfranchise_id } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_childfranchisemaster WHERE title = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Child Franchise Master already exists!",
      });
    } else {
      const checkSoftDeletedSql = `SELECT * FROM awt_childfranchisemaster WHERE title = ? AND deleted = 1`;
      con.query(checkSoftDeletedSql, [title], (err, softDeletedData) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (softDeletedData.length > 0) {
          const restoreSoftDeletedSql = `UPDATE awt_childfranchisemaster SET deleted = 0 WHERE title = ?`;
          con.query(restoreSoftDeletedSql, [title], (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.json({
              message:
                "Soft-deleted Child Franchise Master restored successfully!",
            });
          });
        } else {
          const sql = `INSERT INTO awt_childfranchisemaster (title, pfranchise_id) VALUES (?, ?)`;
          con.query(sql, [title, pfranchise_id], (err, data) => {
            if (err) {
              return res.json(err);
            } else {
              return res.json({
                message: "Child Franchise Master added successfully!",
              });
            }
          });
        }
      });
    }
  });
});

app.put("/putchildfranchise", (req, res) => {
  const { title, id, pfranchise_id } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_childfranchisemaster WHERE title = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [title, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({ message: "Duplicate entry, Child Franchise already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_childfranchisemaster SET title = ?, pfranchise_id = ? WHERE id = ?`;
      con.query(updateSql, [title, pfranchise_id, id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "Child  Franchise updated successfully!" });
      });
    }
  });
});

app.post("/deletechildfranchise", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_childfranchisemaster SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error updating Child Franchise" });
    } else {
      return res.json(data);
    }
  });
});
// End Child Franchise Master

//Start Engineer Master

app.get("/getchildfranchise", (req, res) => {
  const sql = "SELECT * FROM awt_childfranchisemaster WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

app.get("/getengineer", (req, res) => {
  const sql =
    "SELECT r.*, c.title as childfranchise_title FROM awt_engineermaster r INNER JOIN awt_childfranchisemaster c ON r.cfranchise_id = c.id WHERE r.deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.get("/requestengineer/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_engineermaster WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

app.post("/postengineer", (req, res) => {
  const { title, cfranchise_id, password, email, mobile_no } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_engineermaster WHERE mobile_no = ?  AND email = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [mobile_no, email], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res.status(409).json({
        message:
          "Duplicate entry,Email and mobile_no Credential already exists!",
      });
    } else {
      const checkSoftDeletedSql = `SELECT * FROM awt_engineermaster WHERE mobile_no = ?  AND email = ? AND deleted = 1`;

      con.query(
        checkSoftDeletedSql,
        [mobile_no, email],
        (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            const restoreSoftDeletedSql = `UPDATE awt_engineermaster SET deleted = 0 WHERE mobile_no = ?  AND email = ?`;
            con.query(restoreSoftDeletedSql, [mobile_no, email], (err) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.json({
                message: "Soft-deleted Engineer Master restored successfully!",
              });
            });
          } else {
            const sql = `INSERT INTO awt_engineermaster (title, cfranchise_id, mobile_no, email, password) VALUES (?, ?, ?, ?, ?)`;
            con.query(
              sql,
              [title, cfranchise_id, mobile_no, email, password],
              (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json({ message: "Engineer added successfully!" });
                }
              }
            );
          }
        }
      );
    }
  });
});

app.put("/putengineer", (req, res) => {
  const { title, id, cfranchise_id, password, email, mobile_no } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_engineermaster WHERE mobile_no = ?  AND email = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [mobile_no, email, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({
        message:
          "Duplicate entry,Email and mobile_no Credential already exists!",
      });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_engineermaster SET title = ?, cfranchise_id = ?,mobile_no = ?,email = ?, password= ? WHERE id = ?`;
      con.query(
        updateSql,
        [title, cfranchise_id, mobile_no, email, password, id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.json({ message: "Engineer updated successfully!" });
        }
      );
    }
  });
});

app.post("/deleteengineer", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_engineermaster SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating Engineer" });
    } else {
      return res.json(data);
    }
  });
});
// End Engineer Master

//Start Complaint List

app.get("/getcomplainlist", (req, res) => {
  const sql =
    "SELECT * FROM `complaint_ticket` WHERE deleted = 0 ORDER BY `ticket_no` ASC";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

// Start Complaint View
app.get("/getcomplaintview/:complaintid", (req, res) => {
  const { complaintid } = req.params;
  const sql = "SELECT * FROM complaint_ticket WHERE id = ? AND deleted = 0";
  con.query(sql, [complaintid], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

app.post("/addcomplaintremark", (req, res) => {
  const { ticket_no, note, created_by } = req.body;

  console.log(ticket_no, "##");
  const sql =
  "INSERT INTO awt_complaintremark (ticket_no, remark, created_by, created_date) VALUES (?, ?, ?, NOW())";
  con.query(sql, [ticket_no, note, created_by], (err, result) => {
    if (err) {
      console.error("Error inserting remark:", err);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message }); // Send back more details for debugging
    }
    res.json({ insertId: result.insertId }); // Send the inserted ID back to the client
  });
});

app.post(
  "/uploadcomplaintattachments",
  upload.array("attachment"),
  (req, res) => {
    const { ticket_no, remark_id, created_by } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Combine filenames into a single string or JSON
    const attachments = req.files.map((file) => file.filename); // Get all filenames
    const attachmentString = attachments.join(", "); // For a comma-separated string
    // const attachmentString = JSON.stringify(attachments); // For JSON format

    const sql =
      "INSERT INTO awt_complaintattachment (remark_id, ticket_no, attachment, created_by,created_date) VALUES (?, ?, ?, ?, NOW())";

    con.query(
      sql,
      [remark_id, ticket_no, attachmentString, created_by],
      (err, result) => {
        if (err) {
          console.error("Error inserting attachments:", err);
          return res
            .status(500)
            .json({ error: "Database error", details: err.message });
        }
        res.json({
          message: "Files uploaded successfully",
          count: 1, // Only one entry created
        });
      }
    );
  }
);

app.get("/getComplaintDetails/:ticket_no", (req, res) => {
  const ticket_no = req.params.ticket_no;

  const remarkQuery = "SELECT  ac.* ,lu.Lhiuser  FROM `awt_complaintremark` as ac left join lhi_user as lu on lu.id = ac.created_by WHERE ac.ticket_no = ?";
  const attachmentQuery =
    "SELECT * FROM awt_complaintattachment WHERE ticket_no = ?";

  con.query(remarkQuery, [ticket_no], (err, remarks) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error fetching remarks", details: err.message });
    }

    con.query(attachmentQuery, [ticket_no], (err, attachments) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error fetching attachments", details: err.message });
      }

      res.json({ remarks, attachments });
    });
  });
});

app.get("/getComplaintDuplicate/:customer_mobile", (req, res) => {
  const { customer_mobile } = req.params;
  const sql =
    "SELECT * FROM `complaint_ticket` WHERE `customer_mobile` = ? AND `deleted` = 0 ORDER BY `id` DESC";

  con.query(sql, [customer_mobile], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

// End Complaint View

// Complaint View attachment 2 Start

app.post("/uploadAttachment2", upload.array("attachment2"), (req, res) => {
  const { ticket_no, created_by } = req.body;

  // Validate request
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  // Get all filenames and join them
  const attachments = req.files.map((file) => file.filename);
  const attachmentString = attachments.join(", ");

  // SQL query to insert the attachment
  const sql = "INSERT INTO awt_attachment2 (ticket_no, attachment, created_by, created_date) VALUES (?, ?, ?, NOW())";

  // Execute the query
  con.query(
    sql,
    [ticket_no, attachmentString, created_by],
    (err, result) => {
      if (err) {
        console.error("Error inserting attachment 2:", err);
        return res
          .status(500)
          .json({ error: "Database error", details: err.message });
      }

      res.json({
        message: "Files uploaded successfully",
        count: attachments.length,
        insertId: result.insertId
      });
    }
  );
});

// Route to get attachment 2 details
app.get("/getAttachment2Details/:ticket_no", (req, res) => {
  const ticket_no = req.params.ticket_no;
  
  // SQL query to get attachment 2 records
  const sql = "SELECT * FROM awt_attachment2 WHERE ticket_no = ? ORDER BY created_date DESC";
  
  con.query(sql, [ticket_no], (err, attachments2) => {
    if (err) {
      console.error("Error fetching attachment 2:", err);
      return res
        .status(500)
        .json({ error: "Error fetching attachments", details: err.message });
    }

    res.json({ attachments2 });
  });
});


//Complaint view  Attachment 2 End

//Unique Product Master Linked to Location Start
app.get("/getproductunique", (req, res) => {
  const sql =
    "SELECT * FROM awt_uniqueproductmaster WHERE deleted = 0";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.get("/requestproductunique/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM awt_uniqueproductmaster WHERE id = ? AND deleted = 0";
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data[0]);
    }
  });
});

app.post("/postproductunique", (req, res) => {
  const { product, location, date, serialnumber } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster WHERE serialnumber = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [serialnumber], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res
        .status(409)
        .json({
          message:
            "Product with same serial number already exists!",
        });
    } else {
      const checkSoftDeletedSql = `SELECT * FROM awt_uniqueproductmaster WHERE serialnumber = ? AND deleted = 1`;

      con.query(
        checkSoftDeletedSql,
        [serialnumber],
        (err, softDeletedData) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (softDeletedData.length > 0) {
            const restoreSoftDeletedSql = `UPDATE awt_uniqueproductmaster SET deleted = 0 WHERE serialnumber = ?`;
            con.query(restoreSoftDeletedSql, [serialnumber], (err) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.json({
                message: "Soft-deleted Product with same serial number restored successfully!",
              });
            });
          } else {
            const sql = `INSERT INTO awt_uniqueproductmaster (product, location, date, serialnumber) VALUES (?, ?, ?, ?)`;
            con.query(
              sql,
              [product, location, date, serialnumber],
              (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json({ message: "Product added successfully!" });
                }
              }
            );
          }
        }
      );
    }
  });
});

app.put("/putproductunique", (req, res) => {
  const { product, id, location, date, serialnumber } = req.body;

  const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster WHERE serialnumber = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [serialnumber, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res
        .status(409)
        .json({
          message:
            "Product with same serial number  already exists!",
        });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_uniqueproductmaster SET product = ?,location = ?,date = ?, serialnumber= ? WHERE id = ?`;
      con.query(
        updateSql,
        [product, location, date, serialnumber, id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.json({ message: "Product updated successfully!" });
        }
      );
    }
  });
});

app.post("/deleteproductunique", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_uniqueproductmaster SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Deleting Engineer" });
    } else {
      return res.json(data);
    }
  });
});
//Unique Product Master Linked to Location End

//Customer Location Start
  app.get("/getareadrop/:geocity_id", (req, res) => {
    const { geocity_id } = req.params;
    const sql = "SELECT * FROM awt_area WHERE geocity_id = ? AND deleted = 0";
    con.query(sql, [geocity_id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json(data);
    });
  });

  app.get("/getpincodedrop/:area_id", (req, res) => {
    const { area_id } = req.params;
    const sql = "SELECT * FROM awt_pincode WHERE area_id = ? AND deleted = 0";
    con.query(sql, [area_id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json(data);
    });
  });

  // API to fetch all Customer Location 
app.get("/getcustomerlocation", (req, res) => {
  const sql = `
    SELECT ccl.*, c.title as country_title, r.title as region_title, gs.title as geostate_title, gc.title as geocity_title, a.title as area_title, p.pincode as pincode_title FROM awt_customerlocation ccl JOIN awt_country c ON ccl.country_id = c.id JOIN awt_region r ON ccl.region_id = r.id JOIN awt_geostate gs ON ccl.geostate_id = gs.id JOIN awt_geocity gc ON ccl.geocity_id = gc.id JOIN awt_area a ON ccl.area_id = a.id JOIN awt_pincode p ON ccl.pincode_id = p.id WHERE ccl.deleted = 0;
  `;

  con.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.json(data);
    }
  });
});

// API to fetch a specific Customer Location by ID
app.get("/requestcustomerlocation/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
   SELECT ccl.*, c.title as country_title, r.title as region_title, gs.title as geostate_title, gc.title as geocity_title, a.title as area_title, p.pincode as pincode_title FROM awt_customerlocation ccl JOIN awt_country c ON ccl.country_id = c.id JOIN awt_region r ON ccl.region_id = r.id JOIN awt_geostate gs ON ccl.geostate_id = gs.id JOIN awt_geocity gc ON ccl.geocity_id = gc.id JOIN awt_area a ON ccl.area_id = a.id JOIN awt_pincode p ON ccl.pincode_id = p.id WHERE ccl.deleted = 0 AND ccl.id = ?;
  `;

  con.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error fetching Customer Location:", err);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: "Customer Location not found" });
    }

    return res.status(200).json(data[0]);
  });
});

// Insert new Customer Location with duplicate check 
app.post("/postcustomerlocation", (req, res) => {
  const { country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type } = req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccnumber = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [ccnumber],
    (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists !",
      });
    } else {
      const sql = `INSERT INTO awt_customerlocation (country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      con.query(
        sql,
        [country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type],
        (err, data) => {
          if (err) {
            return res.json(err);
          } else {
            return res.json({ message: "Customer Location added successfully!" });
          }
        }
      );
    }
  });
});

// Update existing Customer Location with duplicate check 
app.put("/putcustomerlocation", (req, res) => {
  const {
    country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type,id
  } = req.body;

  // Check for duplicates 
  const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccnumber = ? AND id != ? AND deleted = 0`;
  con.query(checkDuplicateSql, [ccnumber, id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists !",
      });
    } else {
      const updateSql = `UPDATE awt_customerlocation SET country_id = ?, region_id = ?, geostate_id = ?, geocity_id = ?, area_id = ?,pincode_id = ?,address = ?,ccperson = ?,ccnumber = ?,address_type = ? WHERE id = ?`;
      con.query(
        updateSql,
        [country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type,id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.json({ message: "Customer Location updated successfully!" });
        }
      );
    }
  });
});

// API to soft delete a Customer Location
app.post("/deletepincode", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_customerlocation SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting Customer Location" });
    } else {
      return res.json(data);
    }
  });
});

//Customer Location End

//Customer Master Start
app.get("/getcustomer", (req, res) => {
  const sql = `SELECT * From awt_customer WHERE deleted = 0`;
  con.query(sql,(err, data) => {
  if (err) {
    return res.status(500).json(err);
  }
  return res.status(202).json(data[0]);
  })
});

app.post("deletecustomer",(req,res) => {
  const {id} = req.body;
  const sql = `UPDATE awt_customer SET deleted = 1 WHERE id = ?`;
  con.query(sql, [id], (err, data)=> {
    if (err){
      return res.status(500).json(err);
    }
    return res.json(data);
  })
});

app.get("requestcustomer",(req,res) => {
  const { id } = req.body;
  const sql = `SELECT * FROM awt_customer WHERE deleted = 0 and id = ? `;
  con.query =(sql, [id], (err, data) => {
    if (err){
        return res.status(500).json(err);
    }
    if (data.length === 0){
      return res.status(404).json({message: "Customer not found"});
    }

    return res.json(data[0])
  } )
});

app.post("/postcustomer", (req, res) => {
  const { customer_fname, customer_lname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email } = req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_customer WHERE mobileno = ? AND dateofbirth = ? AND deleted = 0`;

  con.query(checkDuplicateSql, [mobileno, dateofbirth], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number and DOB already exists!",
      });
    } else {
      // Insert the customer if no duplicate is found
      const sql = `INSERT INTO awt_customer (customer_fname, customer_lname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      con.query(sql, [customer_fname, customer_lname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(201).json({
          message: "Customer master added successfully",
        });
      });
    }
  });
});




//Start Product List

app.get("/getproductlist", (req, res) => {
  const sql =
    "SELECT * FROM `product_master` ORDER BY `id` ASC";
  con.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});