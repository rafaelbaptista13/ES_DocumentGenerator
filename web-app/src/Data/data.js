const urlAPI = process.env.NODE_ENV === "development" ? 'http://localhost:4000/' : 'http://ec2-107-21-161-171.compute-1.amazonaws.com:4000/';
const urlWeb = process.env.NODE_ENV === "development" ? 'http://localhost:3000/' : 'http://ec2-107-21-161-171.compute-1.amazonaws.com:3000/'
//const urlAPI = 'http://ec2-107-21-161-171.compute-1.amazonaws.com:4000'
//const urlWeb = 'http://ec2-107-21-161-171.compute-1.amazonaws.com:3000'

export {urlAPI, urlWeb};
