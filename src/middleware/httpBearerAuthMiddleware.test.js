import httpBearerAuthMiddleware from "./httpBearerAuthMiddleware";

describe('constructor', () => {
    test('The token and name should be set.', () => {
        const token = 'some auth token';
        const middleware = new httpBearerAuthMiddleware(token);
        expect(middleware.name).toEqual('HTTP_BEARER_AUTH');
        expect(middleware.token).toEqual(token);
    });
});
describe('req', () => {
    test('The Authorization header should be set if it doesn\'t exist', () => {
        const token = 'some auth token';
        const modifiedPayload = new httpBearerAuthMiddleware(token).req({ req: {} });
        const authHeader = modifiedPayload.req.headers.Authorization;
        expect(authHeader).toBeDefined();
        expect(authHeader).toEqual(`Bearer ${token}`);
    });
});