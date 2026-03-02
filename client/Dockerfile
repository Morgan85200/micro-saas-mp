FROM node:20

WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN chown -R node:node /app
USER node
RUN npm install
COPY --chown=node:node . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
