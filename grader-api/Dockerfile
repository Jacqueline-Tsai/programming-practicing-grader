FROM lukechannings/deno:v1.37.0

EXPOSE 7000

WORKDIR /app

RUN apt-get update

RUN apt update --fix-missing 
RUN apt upgrade -y

RUN apt install docker.io -y

RUN addgroup deno docker

COPY deps.js .

RUN deno cache deps.js

COPY . .

CMD [ "run", "--unstable", "--watch", "--allow-all", "app.js" ]