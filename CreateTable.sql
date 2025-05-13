
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

-- this is for 
CREATE TABLE Address_Code (
    id INT IDENTITY(1,1) PRIMARY KEY,
	msp_code VARCHAR(100),
    csp_code VARCHAR(100),
	address_code VARCHAR(100),
	created_by VARCHAR(100),
	created_date DATETIME ,
	deleted INT NOT NULL DEFAULT 0
);

--alter table in received_date in awt_grnmaster

--add column total_stock in csp_stock type int default 0

--add column description in page_master type text 

--add column payment_collected in complaint_ticket varchar(50)

--add column collected_amount in complaint_ticket type int default 0 