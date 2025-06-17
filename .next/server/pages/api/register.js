"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/register";
exports.ids = ["pages/api/register"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ }),

/***/ "nodemailer":
/*!*****************************!*\
  !*** external "nodemailer" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = import("bcryptjs");;

/***/ }),

/***/ "(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fregister&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Cregister.ts&middlewareConfigBase64=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fregister&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Cregister.ts&middlewareConfigBase64=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/pages-api/module.compiled */ \"(api)/./node_modules/next/dist/server/future/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(api)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _pages_api_register_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages\\api\\register.ts */ \"(api)/./pages/api/register.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_pages_api_register_ts__WEBPACK_IMPORTED_MODULE_3__]);\n_pages_api_register_ts__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_register_ts__WEBPACK_IMPORTED_MODULE_3__, \"default\"));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_register_ts__WEBPACK_IMPORTED_MODULE_3__, \"config\");\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/register\",\n        pathname: \"/api/register\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\"\n    },\n    userland: _pages_api_register_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LXJvdXRlLWxvYWRlci9pbmRleC5qcz9raW5kPVBBR0VTX0FQSSZwYWdlPSUyRmFwaSUyRnJlZ2lzdGVyJnByZWZlcnJlZFJlZ2lvbj0mYWJzb2x1dGVQYWdlUGF0aD0uJTJGcGFnZXMlNUNhcGklNUNyZWdpc3Rlci50cyZtaWRkbGV3YXJlQ29uZmlnQmFzZTY0PWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDTDtBQUMxRDtBQUNzRDtBQUN0RDtBQUNBLGlFQUFlLHdFQUFLLENBQUMsbURBQVEsWUFBWSxFQUFDO0FBQzFDO0FBQ08sZUFBZSx3RUFBSyxDQUFDLG1EQUFRO0FBQ3BDO0FBQ08sd0JBQXdCLGdIQUFtQjtBQUNsRDtBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZQUFZO0FBQ1osQ0FBQzs7QUFFRCxxQyIsInNvdXJjZXMiOlsid2VicGFjazovL3RmZy8/N2UyNSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYWdlc0FQSVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvcGFnZXMtYXBpL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IGhvaXN0IH0gZnJvbSBcIm5leHQvZGlzdC9idWlsZC90ZW1wbGF0ZXMvaGVscGVyc1wiO1xuLy8gSW1wb3J0IHRoZSB1c2VybGFuZCBjb2RlLlxuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi4vcGFnZXNcXFxcYXBpXFxcXHJlZ2lzdGVyLnRzXCI7XG4vLyBSZS1leHBvcnQgdGhlIGhhbmRsZXIgKHNob3VsZCBiZSB0aGUgZGVmYXVsdCBleHBvcnQpLlxuZXhwb3J0IGRlZmF1bHQgaG9pc3QodXNlcmxhbmQsIFwiZGVmYXVsdFwiKTtcbi8vIFJlLWV4cG9ydCBjb25maWcuXG5leHBvcnQgY29uc3QgY29uZmlnID0gaG9pc3QodXNlcmxhbmQsIFwiY29uZmlnXCIpO1xuLy8gQ3JlYXRlIGFuZCBleHBvcnQgdGhlIHJvdXRlIG1vZHVsZSB0aGF0IHdpbGwgYmUgY29uc3VtZWQuXG5leHBvcnQgY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgUGFnZXNBUElSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuUEFHRVNfQVBJLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcmVnaXN0ZXJcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9yZWdpc3RlclwiLFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFyZW4ndCB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcIlwiXG4gICAgfSxcbiAgICB1c2VybGFuZFxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhZ2VzLWFwaS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fregister&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Cregister.ts&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api)/./pages/api/register.ts":
/*!*******************************!*\
  !*** ./pages/api/register.ts ***!
  \*******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! crypto */ \"crypto\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var nodemailer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! nodemailer */ \"nodemailer\");\n/* harmony import */ var nodemailer__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(nodemailer__WEBPACK_IMPORTED_MODULE_3__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([bcryptjs__WEBPACK_IMPORTED_MODULE_1__]);\nbcryptjs__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\nconst prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nasync function handler(req, res) {\n    if (req.method !== \"POST\") {\n        return res.status(405).json({\n            message: \"M\\xe9todo no permitido\"\n        });\n    }\n    const { name, email, password } = req.body;\n    if (!name || !email || !password) {\n        return res.status(400).json({\n            message: \"Faltan campos obligatorios\"\n        });\n    }\n    const existingUser = await prisma.user.findUnique({\n        where: {\n            email\n        }\n    });\n    if (existingUser) {\n        return res.status(409).json({\n            message: \"El email ya est\\xe1 registrado\"\n        });\n    }\n    const hashedPassword = await bcryptjs__WEBPACK_IMPORTED_MODULE_1__[\"default\"].hash(password, 10);\n    const token = crypto__WEBPACK_IMPORTED_MODULE_2___default().randomBytes(32).toString(\"hex\");\n    const user = await prisma.user.create({\n        data: {\n            name,\n            email,\n            password: hashedPassword,\n            emailConfirmed: false,\n            emailConfirmationToken: token\n        }\n    });\n    // Configura el transporter de nodemailer\n    const transporter = nodemailer__WEBPACK_IMPORTED_MODULE_3___default().createTransport({\n        service: \"gmail\",\n        auth: {\n            user: process.env.CONTACT_EMAIL_USER,\n            pass: process.env.CONTACT_EMAIL_PASS\n        }\n    });\n    const confirmUrl = `${\"https://totalawarenesscompo.onrender.com\"}/api/confirm-email?token=${token}`;\n    await transporter.sendMail({\n        from: process.env.CONTACT_EMAIL_USER,\n        to: email,\n        subject: \"Confirma tu correo electr\\xf3nico\",\n        html: `<p>Hola ${name},</p>\r\n           <p>Por favor confirma tu correo haciendo clic en el siguiente enlace:</p>\r\n           <a href=\"${confirmUrl}\">${confirmUrl}</a>`\n    });\n    res.status(201).json({\n        message: \"Usuario registrado. Revisa tu correo para confirmar tu email.\"\n    });\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvcmVnaXN0ZXIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDOEM7QUFDaEI7QUFDRjtBQUNRO0FBRXBDLE1BQU1JLFNBQVMsSUFBSUosd0RBQVlBO0FBRWhCLGVBQWVLLFFBQVFDLEdBQW1CLEVBQUVDLEdBQW9CO0lBQzdFLElBQUlELElBQUlFLE1BQU0sS0FBSyxRQUFRO1FBQ3pCLE9BQU9ELElBQUlFLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUFzQjtJQUMvRDtJQUVBLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLFFBQVEsRUFBRSxHQUFHUixJQUFJUyxJQUFJO0lBRTFDLElBQUksQ0FBQ0gsUUFBUSxDQUFDQyxTQUFTLENBQUNDLFVBQVU7UUFDaEMsT0FBT1AsSUFBSUUsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFQyxTQUFTO1FBQTZCO0lBQ3RFO0lBRUEsTUFBTUssZUFBZSxNQUFNWixPQUFPYSxJQUFJLENBQUNDLFVBQVUsQ0FBQztRQUFFQyxPQUFPO1lBQUVOO1FBQU07SUFBRTtJQUNyRSxJQUFJRyxjQUFjO1FBQ2hCLE9BQU9ULElBQUlFLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUE4QjtJQUN2RTtJQUVBLE1BQU1TLGlCQUFpQixNQUFNbkIscURBQVcsQ0FBQ2EsVUFBVTtJQUNuRCxNQUFNUSxRQUFRcEIseURBQWtCLENBQUMsSUFBSXNCLFFBQVEsQ0FBQztJQUU5QyxNQUFNUCxPQUFPLE1BQU1iLE9BQU9hLElBQUksQ0FBQ1EsTUFBTSxDQUFDO1FBQ3BDQyxNQUFNO1lBQ0pkO1lBQ0FDO1lBQ0FDLFVBQVVNO1lBQ1ZPLGdCQUFnQjtZQUNoQkMsd0JBQXdCTjtRQUMxQjtJQUNGO0lBRUEseUNBQXlDO0lBQ3pDLE1BQU1PLGNBQWMxQixpRUFBMEIsQ0FBQztRQUM3QzRCLFNBQVM7UUFDVEMsTUFBTTtZQUNKZixNQUFNZ0IsUUFBUUMsR0FBRyxDQUFDQyxrQkFBa0I7WUFDcENDLE1BQU1ILFFBQVFDLEdBQUcsQ0FBQ0csa0JBQWtCO1FBQ3RDO0lBQ0Y7SUFFQSxNQUFNQyxhQUFhLENBQUMsRUFBRUwsMENBQWdDLENBQUMseUJBQXlCLEVBQUVYLE1BQU0sQ0FBQztJQUV6RixNQUFNTyxZQUFZVyxRQUFRLENBQUM7UUFDekJDLE1BQU1SLFFBQVFDLEdBQUcsQ0FBQ0Msa0JBQWtCO1FBQ3BDTyxJQUFJN0I7UUFDSjhCLFNBQVM7UUFDVEMsTUFBTSxDQUFDLFFBQVEsRUFBRWhDLEtBQUs7O29CQUVOLEVBQUUwQixXQUFXLEVBQUUsRUFBRUEsV0FBVyxJQUFJLENBQUM7SUFDbkQ7SUFFQS9CLElBQUlFLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7UUFBRUMsU0FBUztJQUFnRTtBQUNsRyIsInNvdXJjZXMiOlsid2VicGFjazovL3RmZy8uL3BhZ2VzL2FwaS9yZWdpc3Rlci50cz83ZGE0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBcGlSZXF1ZXN0LCBOZXh0QXBpUmVzcG9uc2UgfSBmcm9tIFwibmV4dFwiO1xyXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tIFwiQHByaXNtYS9jbGllbnRcIjtcclxuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0anNcIjtcclxuaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XHJcbmltcG9ydCBub2RlbWFpbGVyIGZyb20gXCJub2RlbWFpbGVyXCI7XHJcblxyXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcTogTmV4dEFwaVJlcXVlc3QsIHJlczogTmV4dEFwaVJlc3BvbnNlKSB7XHJcbiAgaWYgKHJlcS5tZXRob2QgIT09IFwiUE9TVFwiKSB7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDUpLmpzb24oeyBtZXNzYWdlOiBcIk3DqXRvZG8gbm8gcGVybWl0aWRvXCIgfSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IG5hbWUsIGVtYWlsLCBwYXNzd29yZCB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIGlmICghbmFtZSB8fCAhZW1haWwgfHwgIXBhc3N3b3JkKSB7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBtZXNzYWdlOiBcIkZhbHRhbiBjYW1wb3Mgb2JsaWdhdG9yaW9zXCIgfSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBleGlzdGluZ1VzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHsgd2hlcmU6IHsgZW1haWwgfSB9KTtcclxuICBpZiAoZXhpc3RpbmdVc2VyKSB7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDkpLmpzb24oeyBtZXNzYWdlOiBcIkVsIGVtYWlsIHlhIGVzdMOhIHJlZ2lzdHJhZG9cIiB9KTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEwKTtcclxuICBjb25zdCB0b2tlbiA9IGNyeXB0by5yYW5kb21CeXRlcygzMikudG9TdHJpbmcoXCJoZXhcIik7XHJcblxyXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5jcmVhdGUoe1xyXG4gICAgZGF0YToge1xyXG4gICAgICBuYW1lLFxyXG4gICAgICBlbWFpbCxcclxuICAgICAgcGFzc3dvcmQ6IGhhc2hlZFBhc3N3b3JkLFxyXG4gICAgICBlbWFpbENvbmZpcm1lZDogZmFsc2UsXHJcbiAgICAgIGVtYWlsQ29uZmlybWF0aW9uVG9rZW46IHRva2VuLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgLy8gQ29uZmlndXJhIGVsIHRyYW5zcG9ydGVyIGRlIG5vZGVtYWlsZXJcclxuICBjb25zdCB0cmFuc3BvcnRlciA9IG5vZGVtYWlsZXIuY3JlYXRlVHJhbnNwb3J0KHtcclxuICAgIHNlcnZpY2U6IFwiZ21haWxcIixcclxuICAgIGF1dGg6IHtcclxuICAgICAgdXNlcjogcHJvY2Vzcy5lbnYuQ09OVEFDVF9FTUFJTF9VU0VSLFxyXG4gICAgICBwYXNzOiBwcm9jZXNzLmVudi5DT05UQUNUX0VNQUlMX1BBU1MsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICBjb25zdCBjb25maXJtVXJsID0gYCR7cHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfQkFTRV9VUkx9L2FwaS9jb25maXJtLWVtYWlsP3Rva2VuPSR7dG9rZW59YDtcclxuXHJcbiAgYXdhaXQgdHJhbnNwb3J0ZXIuc2VuZE1haWwoe1xyXG4gICAgZnJvbTogcHJvY2Vzcy5lbnYuQ09OVEFDVF9FTUFJTF9VU0VSLFxyXG4gICAgdG86IGVtYWlsLFxyXG4gICAgc3ViamVjdDogXCJDb25maXJtYSB0dSBjb3JyZW8gZWxlY3Ryw7NuaWNvXCIsXHJcbiAgICBodG1sOiBgPHA+SG9sYSAke25hbWV9LDwvcD5cclxuICAgICAgICAgICA8cD5Qb3IgZmF2b3IgY29uZmlybWEgdHUgY29ycmVvIGhhY2llbmRvIGNsaWMgZW4gZWwgc2lndWllbnRlIGVubGFjZTo8L3A+XHJcbiAgICAgICAgICAgPGEgaHJlZj1cIiR7Y29uZmlybVVybH1cIj4ke2NvbmZpcm1Vcmx9PC9hPmAsXHJcbiAgfSk7XHJcblxyXG4gIHJlcy5zdGF0dXMoMjAxKS5qc29uKHsgbWVzc2FnZTogXCJVc3VhcmlvIHJlZ2lzdHJhZG8uIFJldmlzYSB0dSBjb3JyZW8gcGFyYSBjb25maXJtYXIgdHUgZW1haWwuXCIgfSk7XHJcbn0iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiYmNyeXB0IiwiY3J5cHRvIiwibm9kZW1haWxlciIsInByaXNtYSIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJtZXRob2QiLCJzdGF0dXMiLCJqc29uIiwibWVzc2FnZSIsIm5hbWUiLCJlbWFpbCIsInBhc3N3b3JkIiwiYm9keSIsImV4aXN0aW5nVXNlciIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJoYXNoZWRQYXNzd29yZCIsImhhc2giLCJ0b2tlbiIsInJhbmRvbUJ5dGVzIiwidG9TdHJpbmciLCJjcmVhdGUiLCJkYXRhIiwiZW1haWxDb25maXJtZWQiLCJlbWFpbENvbmZpcm1hdGlvblRva2VuIiwidHJhbnNwb3J0ZXIiLCJjcmVhdGVUcmFuc3BvcnQiLCJzZXJ2aWNlIiwiYXV0aCIsInByb2Nlc3MiLCJlbnYiLCJDT05UQUNUX0VNQUlMX1VTRVIiLCJwYXNzIiwiQ09OVEFDVF9FTUFJTF9QQVNTIiwiY29uZmlybVVybCIsIk5FWFRfUFVCTElDX0JBU0VfVVJMIiwic2VuZE1haWwiLCJmcm9tIiwidG8iLCJzdWJqZWN0IiwiaHRtbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./pages/api/register.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fregister&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Cregister.ts&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();