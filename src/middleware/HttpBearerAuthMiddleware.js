export default class {
  constructor(token) {
    this.token = token;
    this.name = 'HTTP_BEARER_AUTH';
  }

  req(payload) {
    payload.headers.Authorization = `Bearer ${this.token}`;
    return payload;
  }
}
