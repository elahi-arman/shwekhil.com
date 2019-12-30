const USER = 'shwekhil';

function getRetries() {
  const RETRY_COOKIE_NAME = 'Shwety-Palms';
  const retryCookie = document.cookie.split(';').filter(cookie => cookie.replaceAll(' ', '').startsWith(`${RETRY_COOKIE_NAME}=`))

  const retriesLeft = retryCookie.split('=')[1];
}
            
function createAuthCookie(password) {
  const additionalAttributes = 'samesite=strict'
  const unencodedAuth = `SHWEKHIL:${encodeURIComponent(password)}`;
  console.log('unencodedAuth', unencodedAuth);

  const authorization = `Authorization:Basic ${btoa(uneecodedAuth)}`
  console.log('authorization', authorization)

  return `${authorization};${additionalAttributes};`
}

// once the auth code is received, the response will be to redirect
// the user to the non password protected side.
function sendAuthCode(code, warningElement){
  const sanitizedPassword = encodeURIComponent(password);
  const encodedAuth = btoa(`${USER}:${sanitizedPassword}`)

  fetch('/code', { 
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Content-Type: 'application/string'
     })
    .then(response => response.json())
    .then(data => {
      if (data.retries) {
        warningElement.innerText = retryText(data.retries)
      } else {
        warningElement.innerText = genericErrorText()
      }
    });
}

