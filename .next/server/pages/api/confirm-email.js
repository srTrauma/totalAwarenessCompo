"use strict";(()=>{var e={};e.id=1153,e.ids=[1153],e.modules={3524:e=>{e.exports=require("@prisma/client")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},4744:(e,t,n)=>{n.r(t),n.d(t,{config:()=>h,default:()=>m,routeModule:()=>u});var i={};n.r(i),n.d(i,{default:()=>c});var r=n(1802),a=n(7153),s=n(6249);let o=new(n(3524)).PrismaClient,l=`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Correo confirmado</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-green-50 flex items-center justify-center min-h-screen">
  <div class="bg-white p-8 rounded-lg shadow-lg text-center">
    <svg class="mx-auto mb-4 w-16 h-16 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
    <h1 class="text-2xl font-bold mb-2 text-green-700">\xa1Correo confirmado!</h1>
    <p class="text-gray-700 mb-4">Tu correo electr\xf3nico ha sido confirmado correctamente.<br>Puedes cerrar esta ventana e iniciar sesi\xf3n.</p>
    <a href="/Login" class="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Ir a iniciar sesi\xf3n</a>
  </div>
</body>
</html>
`,d=`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Error de confirmaci\xf3n</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-red-50 flex items-center justify-center min-h-screen">
  <div class="bg-white p-8 rounded-lg shadow-lg text-center">
    <svg class="mx-auto mb-4 w-16 h-16 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
    <h1 class="text-2xl font-bold mb-2 text-red-700">Error de confirmaci\xf3n</h1>
    <p class="text-gray-700 mb-4">El enlace de confirmaci\xf3n no es v\xe1lido o ha expirado.</p>
    <a href="/Login" class="inline-block px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Ir a iniciar sesi\xf3n</a>
  </div>
</body>
</html>
`;async function c(e,t){let{token:n}=e.query;if(!n||"string"!=typeof n)return t.setHeader("Content-Type","text/html"),t.status(400).send(d);let i=await o.user.findFirst({where:{emailConfirmationToken:n}});if(!i)return t.setHeader("Content-Type","text/html"),t.status(400).send(d);await o.user.update({where:{id:i.id},data:{emailConfirmed:!0,emailConfirmationToken:null}}),t.setHeader("Content-Type","text/html"),t.status(200).send(l)}let m=(0,s.l)(i,"default"),h=(0,s.l)(i,"config"),u=new r.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/confirm-email",pathname:"/api/confirm-email",bundlePath:"",filename:""},userland:i})},7153:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},1802:(e,t,n)=>{e.exports=n(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var n=t(t.s=4744);module.exports=n})();