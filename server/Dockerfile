FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 8880

# CMD ["npm", "run", "start:migrate"]

CMD ["node", "./src/index.js"]