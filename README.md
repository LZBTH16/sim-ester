## Description
Sim-ester is a website that was developed for the COSC304 project. It is an online store that sells products depicting simulation-style games based on courses at UBC Okanagan.

Documentation can be found [here](https://rheiley.github.io/simester-documentation/documentation.pdf).

Sim-ester is hosted on https://sim-ester.onrender.com/ but can be accessed locally with Docker.

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

Create a file named `.env` in the root directory containing the following (note that `ADMIN_PASSWORD` is the password used in the admin portal):
```bash
DB_SERVER=cosc304_sqlserver
DB_NAME=orders
DB_USER=sa
DB_PASSWORD="304#sa#pw"
ADMIN_PASSWORD=adminpassword
```

Run the following command:
```bash
docker-compose up -d
```

Now the website should be hosted on http://127.0.0.1. To load the data, navigate to http://127.0.0.1/loaddata. Then, the website should run while accessing the data.

If loading the data doesn't work initially, try commenting out `database: process.env.DB_NAME,` in `server.js` so that it looks like this:
```Javascript
dbConfig = {    
  server: process.env.DB_SERVER,
//   database: process.env.DB_NAME,
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
After successfully loading the data, `database: process.env.DB_NAME,` should be uncommented.





## Screenshots
![](public/images/screenshot01.png)
![](public/images/screenshot02.png)
![](public/images/screenshot03.png)
![](public/images/screenshot04.png)
![](public/images/screenshot05.png)
![](public/images/screenshot06.png)
![](public/images/screenshot07.png)
![](public/images/screenshot08.png)