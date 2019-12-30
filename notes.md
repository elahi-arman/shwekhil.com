## How Password Protection Works

When the user hits the site with no Basic Auth token, the password-protected.html webpage is served. This sets the basic auth token cookie, as well as clears it. When the user gets the password wrong, Nginx sends back a header with the number of retries left (read-only, http). This header expires in 3 hours. If the header is at 0 and the site gets a request, it gets automatically denied. 

Headers
  - Authorization
  - Shwety-Palms


