# Configuration folder for mongodb databases 

## Setting up the mongo users 

By using the `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` env variables one can
easily set up and use a root user for mongodb. However if the need arises for creating custom users
on startup or executing some mongo commands you can use the `mongo-init.js` file to run js scripts
in the mongodb containers on startup.

This file can be passed via docker-compose by mounting it to the container itself like so: 

    volumes:
      - ./mongodb/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

## Mongodb Seeder

The `seeder/Dockerfile` is a tool that populates two separate MongoDB databases, `mongodb-products` and `mongodb-customer`, with data from two separate JSON files, `products-sampledata.json` and `customer-sampledata.json`. It accomplishes this using the `mongoimport` tool.

The Dockerfile accepts two arguments, `USERNAME` and `PASSWORD`, which are mapped to `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` environment variables, respectively. Alternatively, instead of passing these arguments, you can set the env variables by passing a `.env` file. Otherwise they will be set to  default values of "user" and "password". These credentials are used to authenticate the root user during the mongoimport process and populate the other MongoDB databases.

Overall, this Dockerfile is a convenient and customizable way to populate MongoDB databases with data from JSON files. You can easily modify it to work with different databases and data sources.


