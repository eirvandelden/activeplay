# Activeplay

## Setup

install dependencies
```bash
    npm install
```

### docker
```bash
docker-compose build
docker-compose up
```

## Configuration
# config file
rename .env.example to .env

set `ACTIVEPLAY_SECRET` to a password, which you also set in the City of Brass `application.yml`
set `CORS_WHITE_LIST` to include the url you are hosting city of brass on
in City of Brass, set `ACTIVEPLAY_URL` to the url where this application is hosted

## Running

Run `gulp` to host ActivePlay on `localhost:5050`
