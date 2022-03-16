module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends":[
        "airbnb"
    ],
    "parserOptions": {
        "ecmaVersion":2020,
        "sourceType":"module",
        "ecmaFeatures":{
            "jsx":true
        }
    },
    "plugins":[
        "import",
        "react-hooks",
        "jsx-a11y"
    ],
    "rules":{
        "import/no-named-as-default": 0,
        "import/no-named-as-default-member": 0,
        "import/named": 0,
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
        "jsx-a11y/label-has-associated-control":"off",
        "jsx-a11y/anchor-is-vaild":"off",
        "no-console":"off",
        "no-underscore-dangle":"off",
        "react/forbid-prop-types":"off",
        "react/jsx-filename-extention":"off",
        "react/jsx-one-expression-per-line":"off",
        "object-curly-newline":"off",
        "linebreak-style":"off",
        "indent":"off",
        "react/jsx-indent": "off",
        "react/jsx-indent-props": "off",
        "no-param-reassign": "off" //immer는 파라미터 reassign 해야함.
    }
};
