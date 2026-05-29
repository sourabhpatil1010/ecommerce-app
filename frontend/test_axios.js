import axios from 'axios';

const params = { statuses: ['PLACED', 'CONFIRMED'] };

console.log('Default:', axios.getUri({ url: '/test', params }));
console.log('Indexes null:', axios.getUri({ url: '/test', params, paramsSerializer: { indexes: null } }));
