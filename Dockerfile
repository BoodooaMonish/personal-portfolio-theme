FROM node:18-buster

WORKDIR /home/app

RUN chown -R node:node /home/app
RUN chmod 755 /home/app
USER node

ENV PORT 3000

EXPOSE 3000

ENTRYPOINT /bin/bash
