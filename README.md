
[![Netlify Status](https://api.netlify.com/api/v1/badges/ee867fef-2ea5-4ac0-9524-720a65a141ad/deploy-status)](https://app.netlify.com/sites/example/deploys)

# Bare-bones static site generator with Nunjucks

1. make sure you have gulp installed if you dont do:  
`npm install -g gulp`  
  

2. Install dependecies:  
 `npm install`  
   
3. To run the server:  
`gulp`

# How will gulp build this website
The output will be in the folder `build`  
  
### files in `src/files`
will be copied into root directory `build`

### files in `src/js`
will be copied into `build/scripts/`

### files in `src/images`
will be copied as into `build/images/`

### TO:DO MORE
will be copied as in in root directory

# Important things to not forget

### file upload  
will request from example api, dont forget to maintain that in the file: `src/js/fileupload.js`


