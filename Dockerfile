FROM node:18

RUN mkdir -p /app/server
WORKDIR /app/server
COPY . .
RUN npm install
RUN npm run build
ENV INIT=true
EXPOSE 5000

CMD ["npm","run","start:init"]
