export default class {
  constructor(token) {
    this.token = token;
    this.name = 'HTTP_BEARER_AUTH';
    this.req = this.req.bind(this);
  }

  req(payload) {
    payload.headers.Authorization = `Bearer ${this.token}`;
    return payload;
  }
}
