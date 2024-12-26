DROP TABLE reviews;
DROP TABLE shipments;
DROP TABLE product_inventory;
DROP TABLE warehouses;
DROP TABLE order_products;
DROP TABLE in_cart;
DROP TABLE products;
DROP TABLE categories;
DROP TABLE order_summaries;
DROP TABLE payment_methods;
DROP TABLE customers;

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(40),
    last_name VARCHAR(40),
    email VARCHAR(50),
    phone_num VARCHAR(20),
    address VARCHAR(50),
    city VARCHAR(40),
    state VARCHAR(20),
    postal_code VARCHAR(20),
    country VARCHAR(40),
    username VARCHAR(20),
    password VARCHAR(30),
    admin BOOLEAN DEFAULT FALSE,
    reset_password_token TEXT,
    reset_password_expires BIGINT
);

CREATE TABLE payment_methods (
    payment_method_id SERIAL PRIMARY KEY,
    payment_type VARCHAR(20),
    payment_number VARCHAR(30),
    payment_expiry_date DATE,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE order_summaries (
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP,
    total_amount DECIMAL(10, 2),
    ship_to_address VARCHAR(50),
    ship_to_city VARCHAR(40),
    ship_to_state VARCHAR(20),
    ship_to_postal_code VARCHAR(20),
    ship_to_country VARCHAR(40),
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50)
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(40),
    product_price DECIMAL(10, 2),
    product_image_url VARCHAR(500),
    product_image BYTEA,
    product_desc VARCHAR(1000),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE order_products (
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES order_summaries(order_id)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE in_cart (
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES order_summaries(order_id)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(30)
);

CREATE TABLE shipments (
    shipment_id SERIAL PRIMARY KEY,
    shipment_date TIMESTAMP,
    shipment_desc VARCHAR(100),
    warehouse_id INT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE product_inventory (
    product_id INT,
    warehouse_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    PRIMARY KEY (product_id, warehouse_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    review_rating INT,
    review_date TIMESTAMP,
    customer_id INT,
    product_id INT,
    review_comment TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO categories(category_name) VALUES ('COSC');
INSERT INTO categories(category_name) VALUES ('MATH');
INSERT INTO categories(category_name) VALUES ('STAT');

INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Algorithm Adventures', 1, 'Embark on a quest through the magical world of algorithm design with Algorithm Adventures! Tackle the epic challenges of optimizing, analyzing, and conquering algorithmic problems, all while discovering the mystical art of turning real-world tasks into codeable quests! (Based on COSC 320)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Assembly Architecture', 1, 'Gear up for Assembly Architecture, where you''ll step behind the scenes of computer systems and explore the MIPS architecture through assembly programming. Unlock the secrets of performance optimization and real-time system design - it''s time to assemble your understanding! (Based on COSC 211)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Computer Creativity', 1, 'Unleash your inner coder in Computer Creativity, where programming meets imagination! You’ll explore the world of graphics, events, and 2D games while practicing the basics of decision-making and iteration. Ready to code your own masterpiece? (Based on COSC 123)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Covariance Conundrum', 3, 'Welcome to the Covariance Conundrum, where probability and random variables come to life in a thrilling quest! Tackle discrete and continuous distributions, joint probabilities, and transformations like a true statistical hero, all while unlocking the secrets of calculus. (Based on STAT 303)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Database Dynasty', 1, 'Step into Database Dynasty, where you’ll build, query, and conquer the kingdom of data! From mastering SQL and designing powerful databases with ER diagrams to automating data analysis, become the ruler of relational databases. Ready to claim your database crown? (Based on COSC 304)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Hashmap Simulator', 1, 'Join the Hashmap Simulator, where data structures meet strategy! Dive deep into the world of Java and explore how to efficiently organize and access information in limited memory – because in the world of programming, efficiency is key! Ready to hash it out? (Based on COSC 222)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Integration Sensation', 2, 'Feel the Integration Sensation as you explore the world of integrals and their powerful applications! From mastering definite integrals to solving linear ODEs, you’ll learn how to apply integration techniques in ways that make modeling and real-world problems a breeze. (Based on MATH 101)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Matrix Mayhem', 2, 'Prepare for Matrix Mayhem, where linear algebra gets turned into a wild adventure! Battle through LU-factorization, QR-factorization, and eigenvalue estimates, while navigating the chaotic world of dynamical systems and orthogonality – all in the name of mastering the matrix! (Based on MATH 307)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Object Oriented Odyssey', 1, 'Embark on an Object Oriented Odyssey where you''ll master the art of Java programming! Learn to create powerful, reusable programs using concepts like encapsulation, inheritance, and polymorphism, while tackling exceptions, streams, and recursion along the way. Ready to code like a pro? (Based on COSC 121)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Sigma Statistics', 3, 'Get ready for Sigma Statistics, where data analysis and real-world application meet! From hypothesis testing and regression analysis to diving into the world of variance and non-parametrics, this course will give you the tools to turn numbers into meaningful insights. (Based on STAT 230)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Derivative Delight', 2, 'Get ready to "derive" some fun as you tackle the ever-exciting world of limits and derivatives! From graphing to optimization, it''s the rollercoaster ride of calculus where you’ll learn how to find the steepest slope and maximize your "fun" (or at least your functions). (Based on MATH100)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Discrete Dynamics', 1, 'Step into the world of sets, logic, and Boolean algebra, where every permutation and combination brings you closer to solving the ultimate puzzle. It’s like a game of "connect the dots," except the dots are graphs, and the connections are... well, discrete. (Based on COSC221)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Linear Lollapalooza', 2, 'Hold on to your vectors as you dive into the world of linear equations and matrices—where determinants rule the land, eigenvalues reign supreme, and diagonalization is the ultimate party trick. It''s the math equivalent of a music festival, but with way more vectors and way fewer mosh pits! (Based on MATH221)', 60);
INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES ('Dumpster Fire Simulator', 1, 'Instead of spending $336-million on this, UBC should''ve spent it on Ramon''s bonus', 3300000);

INSERT INTO warehouses(warehouse_name) VALUES ('Main warehouses');
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (1, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (2, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (3, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (4, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (5, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (6, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (7, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (8, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (9, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (10, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (11, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (12, 1, 100, 60);
INSERT INTO product_inventory(product_id, warehouse_id, quantity, price) VALUES (13, 1, 100, 60);

INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Arnold', 'Anderson', 'a.anderson@gmail.com', '204-111-2222', '103 AnyWhere Street', 'Winnipeg', 'MB', 'R3X 45T', 'Canada', 'arnold' , 'test');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Bobby', 'Brown', 'bobby.brown@hotmail.ca', '572-342-8911', '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States', 'bobby' , 'bobby');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Candace', 'Cole', 'cole@charity.org', '333-444-5555', '333 Central Crescent', 'Chicago', 'IL', '33333', 'United States', 'candace' , 'password');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Darren', 'Doe', 'oe@doe.com', '250-807-2222', '444 Dover Lane', 'Kelowna', 'BC', 'V1V 2X9', 'Canada', 'darren' , 'pw');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Elizabeth', 'Elliott', 'engel@uiowa.edu', '555-666-7777', '555 Everwood Street', 'Iowa City', 'IA', '52241', 'United States', 'beth' , 'test');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password, admin) VALUES ('Ramon', 'Lawrence', 'ramon.lawrence@ubc.ca', '250-807-9390', 'SCI 200C', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'rlawrenc', '304ramonpw', TRUE);
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Omar', 'Abdelaziz','iamacosc304ta@ubc.ca', '250-304-2024', '3333 University Way', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'omar', 'pw');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Bradan', 'Fleming', 'another304ta@ubc.ca', '250-304-2024', '3333 University Way', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'bradan', 'pw');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Kevin', 'Wang', '304ta@ubc.ca', '250-304-2024', '3333 University Way', 'Kelowna', 'BC', 'V1V 1V7', 'Canada', 'kevin', 'pw');
INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES ('Terry', 'Davis', 'terrydavis@gmail.com', '250-304-2024', 'City Hall', 'West Allis', 'WI', 'V1V 1V1', 'United States', 'terry', 'terry');

UPDATE products SET product_image_url = 'images/algorithm_adventures.png' WHERE product_id = 1;
UPDATE products SET product_image_url = 'images/assembly_architecture.png' WHERE product_id = 2;
UPDATE products SET product_image_url = 'images/computer_creativity.png' WHERE product_id = 3;
UPDATE products SET product_image_url = 'images/covariance_conundrum.png' WHERE product_id = 4;
UPDATE products SET product_image_url = 'images/database_dynasty.png' WHERE product_id = 5;
UPDATE products SET product_image_url = 'images/hashmap_simulator.png' WHERE product_id = 6;
UPDATE products SET product_image_url = 'images/integration_sensation.png' WHERE product_id = 7;
UPDATE products SET product_image_url = 'images/matrix_mayhem.png' WHERE product_id = 8;
UPDATE products SET product_image_url = 'images/object_oriented_odyssey.png' WHERE product_id = 9;
UPDATE products SET product_image_url = 'images/sigma_statistics.png' WHERE product_id = 10;
UPDATE products SET product_image_url = 'images/derivative_delight.png' WHERE product_id = 11;
UPDATE products SET product_image_url = 'images/discrete_dynamics.png' WHERE product_id = 12;
UPDATE products SET product_image_url = 'images/linear_lollapalooza.png' WHERE product_id = 13;
UPDATE products SET product_image_url = 'images/dumpster_fire.png' WHERE product_id = 14;