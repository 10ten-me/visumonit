module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "ecmaFeatures": {
            "arrowFunctions": true,
        }
    },
    "rules": {
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "no-var": "error",
        "no-func-assign": "error",
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-trailing-spaces": [
            "error",
            {
                "skipBlankLines": false
            }
        ],
    }
};