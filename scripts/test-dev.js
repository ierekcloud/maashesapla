import http from 'http';
http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response length:', data.length, 'Code:', res.statusCode));
}).on('error', (err) => {
  console.error('Error fetching:', err.message);
});
