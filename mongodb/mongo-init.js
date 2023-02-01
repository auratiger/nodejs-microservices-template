db = db.getSiblingDB('database')

db.createUser({
  user: 'user',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'database' }],
});
