import { buildUrlQuery, objectToFormData, parseQueryString, fetchJson } from '../services/util';

export async function getPlanningCenterToken({ interactive = true }) {
  const client_id = process.env.PCO_CLIENT_ID;
  const redirect_uri = browser.identity.getRedirectURL();
  let responseUrl = '';
  try {
    responseUrl = await browser.identity.launchWebAuthFlow({
      url: `https://api.planningcenteronline.com/oauth/authorize?${buildUrlQuery({
        client_id,
        redirect_uri,
        response_type: 'code',
        scope: 'services',
      })}`,
      interactive,
    });
  } catch (e) {
    return null;
  }
  // todo: could save refresh token from final response
  const queryParams = parseQueryString(responseUrl.substring(responseUrl.indexOf('?') + 1));
  const responseJson = await fetchJson('https://api.planningcenteronline.com/oauth/token', {
    method: 'POST',
    body: objectToFormData({
      grant_type: 'authorization_code',
      code: queryParams.code,
      client_id,
      client_secret: process.env.PCO_CLIENT_SECRET,
      redirect_uri,
    }),
  });
  return responseJson.access_token;
}

/**
 * Implicit Grant Flow
 * See https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow
 */
export async function getSpotifyToken({ interactive = true }) {
  let responseUrl;
  try {
    responseUrl = await browser.identity.launchWebAuthFlow({
      url: `https://accounts.spotify.com/authorize?${buildUrlQuery({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'token',
        redirect_uri: browser.identity.getRedirectURL(),
        //todo: state: '',
        scope: 'playlist-modify-public playlist-modify-private',
      })}`,
      interactive,
    });
  } catch (e) {
    return null;
  }
  // todo: handle error case (query param 'error')
  // todo: replace with URLSearchParams
  const queryParams = parseQueryString(responseUrl.substring(responseUrl.indexOf('#') + 1));
  return queryParams.access_token;
}