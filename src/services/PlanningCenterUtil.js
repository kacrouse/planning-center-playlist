export function getPlanIdFromUrl(url) {
  const execResult = /planningcenteronline\.com\/plans\/(\d+)/.exec(url);
  return execResult && execResult[1];
}
