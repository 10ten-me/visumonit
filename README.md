# VisuMonit [(Demo)](https://visumonit.10ten.com/)
Dashboard to display [monit](https://mmonit.com/monit/) XML output beautifully. The dashboard can:  
1. Supports displaying status from multiple servers.
2. Automatically cycle through the different servers. Good for display-only screens.
3. Support fetching from servers that require authentication.
4. Support exporting and importing settings.

![Screenshot showing the dashboard](docs/screenshot.png)

# How to use

1. Install dependecies:
`npm install`

2. To run the server:
`npm start`

3. Validate your code with eslint:
`npm run lint`

# Requirements
Make sure to enable the `CORS` header `Access-Control-Allow-Origin` on your server, in addition if yoyu are using authentication make sure you have these headers:  
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: access_token
Access-Control-Allow-Methods: GET
Access-Control-Allow-Origin: *
```

# How will gulp build this website
The output will be in the folder `build`

### files in `src/files`
will be copied into root directory `build`

### files in `src/js`
will be copied into `build/scripts/`

### files in `src/images`
will be copied as into `build/images/`

### files in `src/files`
will be copied to the root into `build/`

# How to deploy to Netlify
Fork this repo and deplot it on Netlify.  
You will then need to change these from: Setttings > Build & Deploy > Build Settings >  
Build command: `gulp compile`  
Publish directory: `build/`  
