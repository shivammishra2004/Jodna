const MongoStore = require('connect-mongo');
console.log('Type of export:', typeof MongoStore);
console.log('Has create method?', typeof MongoStore.create);
console.log('Export keys:', Object.keys(MongoStore));

try {
    const store = MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017' });
    console.log('MongoStore.create successful');
} catch (e) {
    console.log('MongoStore.create failed:', e.message);
}
