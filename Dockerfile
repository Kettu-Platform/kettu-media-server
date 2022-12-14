FROM sitkevij/ffmpeg:4.0-alpine
FROM node:latest
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY src/package*.json ./

RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY src/ .

EXPOSE 3000
CMD [ "yarn", "run", "start:prod" ]