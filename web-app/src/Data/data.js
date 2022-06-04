const urlAPI = process.env.NODE_ENV === "development" ? 'http://localhost:4000/api' : 'http://eselasticloadbalancer-1398707894.us-east-1.elb.amazonaws.com/api';
const urlWeb = process.env.NODE_ENV === "development" ? 'http://localhost:3000/' : 'http://eselasticloadbalancer-1398707894.us-east-1.elb.amazonaws.com/';

export {urlAPI, urlWeb};
