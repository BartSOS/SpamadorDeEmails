FROM node:20-alpine

RUN npm install -g @google/clasp

WORKDIR /app

COPY . /app

RUN find . -name "*.sh" -exec dos2unix {} + && find . -name "*.sh" -exec chmod +x {} +

ENTRYPOINT [ "/app/clone-base/init.sh" ]
