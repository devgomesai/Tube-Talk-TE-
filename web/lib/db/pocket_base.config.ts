import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_API_URL);
console.log('PB', pb);

export default pb;
