FROM mongo:6


ARG USERNAME 
ARG PASSWORD 

# NOTE: 
# The ${variable_name} syntax also supports a few of the standard bash modifiers as specified below:
#   ${variable:-word} indicates that if variable is set then the result will be that value. If variable is not set then word will be the result.
#   ${variable:+word} indicates that if variable is set then word will be the result, otherwise the result is the empty string.
#
ENV MONGO_INITDB_ROOT_USERNAME=%{USERNAME:-"user"}
ENV MONGO_INITDB_ROOT_PASSWORD=%{PASSWORD:-"password"}

COPY products-sampledata.json /products-sampledata.json
COPY customer-sampledata.json /customer-sampledata.json


# NOTE: mongodb extended JSON syntax
# https://www.mongodb.com/docs/manual/reference/mongodb-extended-json/?_ga=2.41525600.352996102.1677169426-1993246657.1674984986&_gac=1.162121422.1675241159.CjwKCAiAuOieBhAIEiwAgjCvchtX9jKfaKEXcujKddcWQr3Rfyd91K9hRHeSfMNSHpbyAECpnW_f_BoCAksQAvD_BwE

# NOTE: mongodb mongoimport docks
# https://www.mongodb.com/docs/database-tools/mongoimport/

CMD \ 
   mongoimport --username ${MONGO_INITDB_ROOT_USERNAME} --password ${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase admin \
   --host mongodb-products --db database --collection products --type json --file /products-sampledata.json --jsonArray; \ 
   mongoimport --username ${MONGO_INITDB_ROOT_USERNAME} --password ${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase admin \
   --host mongodb-customer --db database --collection customers --type json --file /customer-sampledata.json --jsonArray
