## Description
Sim-ester is a website that was developed for the COSC304 project. It is an online store that sells products depicting simulation-style games based on courses at UBC Okanagan.

Documentation can be found [here](https://rheiley.github.io/simester-documentation/documentation.pdf).

Simester is hosted on https://sim-ester.onrender.com/ but can be accessed locally with Docker.

## Technologies & Tools
- [Node.js](https://nodejs.org/en)
- [Express.js](https://expressjs.com/)
- [Microsoft Azure](https://azure.microsoft.com/en-ca)
- [Render](https://render.com/)
- [Docker](https://www.docker.com/)

## Installation
Install the required dependencies (ensure Node.js is installed)
```bash
npm install
```

Configure the database by uncommenting the following code in server.js:
```Javascript
dbConfig = {    
  server: 'cosc304_sqlserver',
  database: 'orders',
  authentication: {
      type: 'default',
      options: {
          userName: 'sa', 
          password: '304#sa#pw'
      }
  },   
  options: {      
    encrypt: false,      
    enableArithAbort:false,
    database: 'orders'
  }
}
```
Ensure that the following code is also commented out in server.js:
```Javascript
dbConfig = {    
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  authentication: {
      type: 'default',
      options: {
          userName: process.env.DB_USER, 
          password: process.env.DB_PASSWORD
      }
  },   
  options: {      
    encrypt: true,      
    enableArithAbort:false,
    database: process.env.DB_NAME
  }
}
```

Run the following command:
```bash
docker-compose up -d
```

Now the website should be hosted on http://127.0.0.1. To load the data, navigate to http://127.0.0.1/loaddata. Then, the website should run while accessing the data.





## Screenshots
![](src/screenshots/01.png)
![](src/screenshots/02.png)
