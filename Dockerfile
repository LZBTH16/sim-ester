FROM node:14.10.1

WORKDIR /app

COPY package*.json ./

RUN npm install

CMD ["npm", "run", "start"]
# CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
