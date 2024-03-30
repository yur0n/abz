FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 8880

CMD ["node", "./src/index.js"]

# RUN npx prisma migrate dev --name init --preview-feature
