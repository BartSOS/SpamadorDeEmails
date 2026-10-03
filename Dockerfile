FROM node:20-alpine

RUN npm install -g @google/clasp

WORKDIR /app

COPY . /app

RUN dos2unix setup.sh && chmod +x setup.sh

ENTRYPOINT [ "/app/setup.sh" ]

