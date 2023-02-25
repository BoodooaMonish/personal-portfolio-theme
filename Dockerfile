FROM node:18-buster

RUN npm install --global gulp-cli

WORKDIR /home/app
USER node
ENV PORT 3000

EXPOSE 3000

ENTRYPOINT /bin/bash
