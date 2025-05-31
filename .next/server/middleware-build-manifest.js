self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [
    "static/chunks/webpack.js",
    "static/chunks/main-app.js"
  ],
  "pages": {
    "/CompanySelection": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/CompanySelection.js"
    ],
    "/Dashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/Dashboard.js"
    ],
    "/Profile": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/Profile.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/companies/manage/members": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/companies/manage/members.js"
    ],
    "/posts": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/posts.js"
    ],
    "/tasks": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/tasks.js"
    ],
    "/workspaces": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/workspaces.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];