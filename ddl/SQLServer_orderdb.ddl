CREATE DATABASE orders;
go

USE orders;
go

DROP TABLE review;
DROP TABLE shipment;
DROP TABLE productinventory;
DROP TABLE warehouse;
DROP TABLE orderproduct;
DROP TABLE incart;
DROP TABLE product;
DROP TABLE category;
DROP TABLE ordersummary;
DROP TABLE paymentmethod;
DROP TABLE customer;


CREATE TABLE customer (
    customerId          INT IDENTITY,
    firstName           VARCHAR(40),
    lastName            VARCHAR(40),
    email               VARCHAR(50),
    phonenum            VARCHAR(20),
    address             VARCHAR(50),
    city                VARCHAR(40),
    state               VARCHAR(20),
    postalCode          VARCHAR(20),
    country             VARCHAR(40),
    userid              VARCHAR(20),
    password            VARCHAR(30),
    admin               BIT DEFAULT 0
    PRIMARY KEY (customerId)
);

CREATE TABLE paymentmethod (
    paymentMethodId     INT IDENTITY,
    paymentType         VARCHAR(20),
    paymentNumber       VARCHAR(30),
    paymentExpiryDate   DATE,
    customerId          INT,
    PRIMARY KEY (paymentMethodId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE ordersummary (
    orderId             INT IDENTITY,
    orderDate           DATETIME,
    totalAmount         DECIMAL(10,2),
    shiptoAddress       VARCHAR(50),
    shiptoCity          VARCHAR(40),
    shiptoState         VARCHAR(20),
    shiptoPostalCode    VARCHAR(20),
    shiptoCountry       VARCHAR(40),
    customerId          INT,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE category (
    categoryId          INT IDENTITY,
    categoryName        VARCHAR(50),    
    PRIMARY KEY (categoryId)
);

CREATE TABLE product (
    productId           INT IDENTITY,
    productName         VARCHAR(40),
    productPrice        DECIMAL(10,2),
    productImageURL     VARCHAR(100),
    productImage        VARBINARY(MAX),
    productDesc         VARCHAR(1000),
    categoryId          INT,
    PRIMARY KEY (productId),
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);

CREATE TABLE orderproduct (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE incart (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE warehouse (
    warehouseId         INT IDENTITY,
    warehouseName       VARCHAR(30),    
    PRIMARY KEY (warehouseId)
);

CREATE TABLE shipment (
    shipmentId          INT IDENTITY,
    shipmentDate        DATETIME,   
    shipmentDesc        VARCHAR(100),   
    warehouseId         INT, 
    PRIMARY KEY (shipmentId),
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE productinventory ( 
    productId           INT,
    warehouseId         INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (productId, warehouseId),   
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE review (
    reviewId            INT IDENTITY,
    reviewRating        INT,
    reviewDate          DATETIME,   
    customerId          INT,
    productId           INT,
    reviewComment       NVARCHAR(1000),          
    PRIMARY KEY (reviewId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO category(categoryName) VALUES ('COSC');
INSERT INTO category(categoryName) VALUES ('MATH');
INSERT INTO category(categoryName) VALUES ('STAT');

-- Temporarily setting the descriptions as a course code, will update later.
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Algorithm Adventures', 1, 'Embark on a quest through the magical world of algorithm design with Algorithm Adventures! Tackle the epic challenges of optimizing, analyzing, and conquering algorithmic problems, all while discovering the mystical art of turning real-world tasks into codeable quests! (Based on COSC 320)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Assembly Architecture', 1, 'Gear up for Assembly Architecture, where you''ll step behind the scenes of computer systems and explore the MIPS architecture through assembly programming. Unlock the secrets of performance optimization and real-time system design - it''s time to assemble your understanding! (Based on COSC 211)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Computer Creativity', 1, 'Unleash your inner coder in Computer Creativity, where programming meets imagination! You’ll explore the world of graphics, events, and 2D games while practicing the basics of decision-making and iteration. Ready to code your own masterpiece? (Based on COSC 123)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Covariance Conundrum', 3, 'Welcome to the Covariance Conundrum, where probability and random variables come to life in a thrilling quest! Tackle discrete and continuous distributions, joint probabilities, and transformations like a true statistical hero, all while unlocking the secrets of calculus. (Based on STAT 303)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Database Dynasty', 1, 'Step into Database Dynasty, where you’ll build, query, and conquer the kingdom of data! From mastering SQL and designing powerful databases with ER diagrams to automating data analysis, become the ruler of relational databases. Ready to claim your database crown? (Based on COSC 304)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Hashmap Simulator', 1, 'Join the Hashmap Simulator, where data structures meet strategy! Dive deep into the world of Java and explore how to efficiently organize and access information in limited memory – because in the world of programming, efficiency is key! Ready to hash it out? (Based on COSC 222)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Integration Sensation', 2, 'Feel the Integration Sensation as you explore the world of integrals and their powerful applications! From mastering definite integrals to solving linear ODEs, you’ll learn how to apply integration techniques in ways that make modeling and real-world problems a breeze. (Based on MATH 101)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Matrix Mayhem', 2, 'Prepare for Matrix Mayhem, where linear algebra gets turned into a wild adventure! Battle through LU-factorization, QR-factorization, and eigenvalue estimates, while navigating the chaotic world of dynamical systems and orthogonality – all in the name of mastering the matrix! (Based on MATH 307)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Object Oriented Odyssey', 1, 'Embark on an Object Oriented Odyssey where you''ll master the art of Java programming! Learn to create powerful, reusable programs using concepts like encapsulation, inheritance, and polymorphism, while tackling exceptions, streams, and recursion along the way. Ready to code like a pro? (Based on COSC 121)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Sigma Statistics', 3, 'Get ready for Sigma Statistics, where data analysis and real-world application meet! From hypothesis testing and regression analysis to diving into the world of variance and non-parametrics, this course will give you the tools to turn numbers into meaningful insights. (Based on STAT 230)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Derivative Delight', 2, 'Get ready to "derive" some fun as you tackle the ever-exciting world of limits and derivatives! From graphing to optimization, it''s the rollercoaster ride of calculus where you’ll learn how to find the steepest slope and maximize your "fun" (or at least your functions). (Based on MATH100)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Discrete Dynamics', 1, 'Step into the world of sets, logic, and Boolean algebra, where every permutation and combination brings you closer to solving the ultimate puzzle. It’s like a game of "connect the dots," except the dots are graphs, and the connections are... well, discrete. (Based on COSC221)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Linear Lollapalooza', 2, 'Hold on to your vectors as you dive into the world of linear equations and matrices—where determinants rule the land, eigenvalues reign supreme, and diagonalization is the ultimate party trick. It''s the math equivalent of a music festival, but with way more vectors and way fewer mosh pits! (Based on MATH221)', 60);
INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES ('Dumpster Fire Simulator', 1, 'Instead of spending $336-million on this, UBC should''ve spent it on Ramon''s bonus', 3300000);

INSERT INTO warehouse(warehouseName) VALUES ('Main warehouse');
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (1, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (2, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (3, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (4, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (5, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (6, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (7, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (8, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (9, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (10, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (11, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (12, 1, 100, 60);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (13, 1, 100, 60);

INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Arnold', 'Anderson', 'a.anderson@gmail.com', '204-111-2222', '103 AnyWhere Street', 'Winnipeg', 'MB', 'R3X 45T', 'Canada', 'arnold' , 'test');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Bobby', 'Brown', 'bobby.brown@hotmail.ca', '572-342-8911', '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States', 'bobby' , 'bobby');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Candace', 'Cole', 'cole@charity.org', '333-444-5555', '333 Central Crescent', 'Chicago', 'IL', '33333', 'United States', 'candace' , 'password');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Darren', 'Doe', 'oe@doe.com', '250-807-2222', '444 Dover Lane', 'Kelowna', 'BC', 'V1V 2X9', 'Canada', 'darren' , 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Elizabeth', 'Elliott', 'engel@uiowa.edu', '555-666-7777', '555 Everwood Street', 'Iowa City', 'IA', '52241', 'United States', 'beth' , 'test');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password, admin) VALUES ('Ramon', 'Lawrence', 'ramon.lawrence@ubc.ca', '250-807-9390', 'SCI 200C', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'rlawrenc', '304ramonpw', 1);
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Omar', 'Abdelaziz','iamacosc304ta@ubc.ca', '250-304-2024', '3333 University Way', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'omar', 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Bradan', 'Fleming', 'another304ta@ubc.ca', '250-304-2024', '3333 University Way', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'bradan', 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Kevin', 'Wang', '304ta@ubc.ca', '250-304-2024', '3333 University Way', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'kevin', 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Terry', 'Davis', 'terrydavis@gmail.com', '250-304-2024', 'City Hall', 'West Allis', 'WI', 'V1V 1V1', 'United States', 'terry', 'terry');

-- New SQL DDL for lab 8
UPDATE Product SET productImageURL = 'images/algorithm_adventures.png' WHERE ProductId = 1;
UPDATE Product SET productImageURL = 'images/assembly_architecture.png' WHERE ProductId = 2;
UPDATE Product SET productImageURL = 'images/computer_creativity.png' WHERE ProductId = 3;
UPDATE Product SET productImageURL = 'images/covariance_conundrum.png' WHERE ProductId = 4;
UPDATE Product SET productImageURL = 'images/database_dynasty.png' WHERE ProductId = 5;
UPDATE Product SET productImageURL = 'images/hashmap_simulator.png' WHERE ProductId = 6;
UPDATE Product SET productImageURL = 'images/integration_sensation.png' WHERE ProductId = 7;
UPDATE Product SET productImageURL = 'images/matrix_mayhem.png' WHERE ProductId = 8;
UPDATE Product SET productImageURL = 'images/object_oriented_odyssey.png' WHERE ProductId = 9;
UPDATE Product SET productImageURL = 'images/sigma_statistics.png' WHERE ProductId = 10;
UPDATE Product SET productImageURL = 'images/derivative_delight.png' WHERE ProductId = 11;
UPDATE Product SET productImageURL = 'images/discrete_dynamics.png' WHERE ProductId = 12;
UPDATE Product SET productImageURL = 'images/linear_lollapalooza.png' WHERE ProductId = 13;
UPDATE Product SET productImageURL = 'images/dumpster_fire.png' WHERE ProductId = 14;