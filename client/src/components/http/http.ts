
function callApi(endpoint: string) {
  return fetch(LAMBDA_API + endpoint).then((res) => {
    return res.json();
  }).catch((err) => {
    console.error('http > error', err);
    return err;
  });
}

export function getSignUrl() {
  return callApi('/signUrl').then((res) => {
    return res.signedUrl;
  });
}
