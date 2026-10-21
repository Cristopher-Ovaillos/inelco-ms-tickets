#runtime de nodejs
FROM node:22-alpine
#dentro del contenedor, en la carpeta app
WORKDIR /app
#dentro de nuestro entorno local(nuestro template), debemos subir las dependencias dentro del contenedor interno
#debido a la instruccion anterior, las dependencias se instalar dentro de /app
COPY package*.json ./
# instalacion de dependencias
RUN npm ci
# ahora de mi entorno local, post enviar el package*.json e instarlo, mando mis carpetas al directorio /app
COPY . .
#puerto expuesto para el servidor express (mismo valor que PORT del .env)
ARG PORT=3000
EXPOSE ${PORT}

# init modo desarrollo con recarga automatica
CMD ["npm","run","dev"]
