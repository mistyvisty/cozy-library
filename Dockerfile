# Dev image: runs the Vite dev server with hot reload.
FROM node:20-alpine

WORKDIR /app

# Copy manifests first so Docker caches the install layer
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
