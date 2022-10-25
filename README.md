# MetaBrief-remote

# Getting Started

## Server Requirements

- Node.js 14+
- PostgreSQl 14
- Redis (latest)

## Installing preparation

1. Default Application $BASEPATH : `/home/app.user/MetaBrief`

2. Copy the .env file from .env.example under $BASEPATH, fill your config in .env file instead of example config

# Build the app

## Installation

```bash
  npm install
```

## Migrate database
### Run build the app
```bash
  npm run build
```
### Migrate
```bash
  npm run migrate:run
```

# Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# Build with Docker

```bash
  make setup
```

```bash
  make up
```

```bash
  make dev
```

