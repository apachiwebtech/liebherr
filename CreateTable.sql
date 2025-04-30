
CREATE TABLE Msl (
    id INT IDENTITY(1,1) PRIMARY KEY,
    msp_code VARCHAR(100) NOT NULL,
    msp_name VARCHAR(150),
    csp_code VARCHAR(100),
    csp_name VARCHAR(150),
    item VARCHAR(100),
    item_description TEXT,
    stock INT NOT NULL DEFAULT 0,
	created_by VARCHAR(100),
	created_date DATETIME ,
	deleted INT NOT NULL DEFAULT 0
);