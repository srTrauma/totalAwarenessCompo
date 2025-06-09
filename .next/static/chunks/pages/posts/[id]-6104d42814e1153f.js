(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[646],{7411:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/posts/[id]",function(){return r(5591)}])},5591:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return b}});var a=r(5893),s=r(7294),o=r(1163),i=r(9008),n=r.n(i),l=r(7242),c=r(5346),d=r(4931),m=r(1990),u=r(219),p=r(1263),x=r(507),f=r(9394),h=r(6501);let g={general:{label:"General",icon:d.Z,color:"bg-blue-100 text-blue-800"},job_offer:{label:"Oferta de Empleo",icon:m.Z,color:"bg-green-100 text-green-800"},news:{label:"Noticia",icon:u.Z,color:"bg-purple-100 text-purple-800"},event:{label:"Evento",icon:p.Z,color:"bg-orange-100 text-orange-800"}};function b(){let e=(0,o.useRouter)(),{id:t}=e.query,[r,i]=(0,s.useState)(null),[d,m]=(0,s.useState)(null),[u,p]=(0,s.useState)(!0),[b,v]=(0,s.useState)(!1);(0,s.useEffect)(()=>{let e=sessionStorage.getItem("user");e&&m(JSON.parse(e)),t&&y()},[t]);let y=async()=>{try{let r=await fetch("/api/posts/".concat(t));if(r.ok){let e=await r.json();i(e),d&&v(e.author.id===d.id)}else{let t=await r.json();h.ZP.error(t.message||"Post no encontrado"),e.back()}}catch(t){console.error("Error fetching post:",t),h.ZP.error("Error al cargar el post"),e.back()}finally{p(!1)}},j=async()=>{if(r&&d)try{let e=await fetch("/api/posts/".concat(r.id),{method:"PATCH",headers:{"Content-Type":"application/json",userid:d.id.toString()},body:JSON.stringify({isActive:!r.isActive})});if(e.ok){let t=await e.json();i(t),h.ZP.success(t.isActive?"Post activado":"Post desactivado")}else{let t=await e.json();h.ZP.error(t.message||"Error al actualizar el post")}}catch(e){console.error("Error toggling post status:",e),h.ZP.error("Error al actualizar el post")}},w=async()=>{if(r&&d&&confirm("\xbfEst\xe1s seguro de que quieres eliminar este post?"))try{let t=await fetch("/api/posts/".concat(r.id),{method:"DELETE",headers:{userid:d.id.toString()}});if(t.ok)h.ZP.success("Post eliminado"),e.push("/posts");else{let e=await t.json();h.ZP.error(e.message||"Error al eliminar el post")}}catch(e){console.error("Error deleting post:",e),h.ZP.error("Error al eliminar el post")}};if(u)return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n(),{children:(0,a.jsx)("title",{children:"Cargando... | Total Awareness"})}),(0,a.jsx)(l.Z,{}),(0,a.jsx)("div",{className:"flex justify-center items-center h-screen",children:(0,a.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"})})]});if(!r)return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n(),{children:(0,a.jsx)("title",{children:"Post no encontrado | Total Awareness"})}),(0,a.jsx)(l.Z,{}),(0,a.jsx)("div",{className:"bg-gray-50 min-h-screen py-8",children:(0,a.jsx)("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,a.jsxs)("div",{className:"text-center",children:[(0,a.jsx)("h1",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Post no encontrado"}),(0,a.jsx)("button",{onClick:()=>e.back(),className:"text-blue-600 hover:underline",children:"Volver"})]})})})]});let N=g[r.type]||g.general,k=N.icon;return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(n(),{children:[(0,a.jsxs)("title",{children:[r.title," | Total Awareness"]}),(0,a.jsx)("meta",{name:"description",content:r.content.substring(0,160)})]}),(0,a.jsx)(l.Z,{}),(0,a.jsx)("div",{className:"bg-gray-50 min-h-screen py-8",children:(0,a.jsxs)("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",children:[(0,a.jsx)("div",{className:"mb-6",children:(0,a.jsxs)("button",{onClick:()=>e.back(),className:"flex items-center text-blue-600 mb-4 hover:underline",children:[(0,a.jsx)(c.x_l,{className:"mr-2"})," Volver"]})}),(0,a.jsxs)("div",{className:"bg-white rounded-lg shadow-lg overflow-hidden",children:[(0,a.jsxs)("div",{className:"p-6 border-b border-gray-200",children:[(0,a.jsxs)("div",{className:"flex justify-between items-start mb-4",children:[(0,a.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,a.jsx)("div",{className:"w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center",children:r.author.profileImage?(0,a.jsx)("img",{src:r.author.profileImage,alt:r.author.name,className:"w-full h-full rounded-full object-cover"}):(0,a.jsx)("span",{className:"text-lg font-semibold text-blue-600",children:r.author.name.charAt(0).toUpperCase()})}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("h3",{className:"text-lg font-semibold text-gray-900 flex items-center",children:[(0,a.jsx)(c.Xws,{className:"mr-2 text-gray-500"}),r.author.name]}),(0,a.jsxs)("div",{className:"flex items-center space-x-4 text-sm text-gray-500 mt-1",children:[(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)(c.m17,{className:"mr-1"}),r.company.name]}),(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)(c.XdU,{className:"mr-1"}),(0,x.WU)(new Date(r.createdAt),"dd MMM yyyy, HH:mm",{locale:f.es})]})]})]})]}),b&&(0,a.jsxs)("div",{className:"flex space-x-2",children:[(0,a.jsx)("button",{onClick:j,className:"p-2 rounded-lg transition-colors ".concat(r.isActive?"text-green-600 hover:bg-green-50":"text-gray-400 hover:bg-gray-50"),title:r.isActive?"Desactivar":"Activar",children:r.isActive?(0,a.jsx)(c.dSq,{size:18}):(0,a.jsx)(c.tgn,{size:18})}),"                    ",(0,a.jsx)("button",{onClick:()=>e.push("/posts?editPost=".concat(r.id)),className:"p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",title:"Editar",children:(0,a.jsx)(c.fmQ,{size:18})}),(0,a.jsx)("button",{onClick:w,className:"p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors",title:"Eliminar",children:(0,a.jsx)(c.Xm5,{size:18})})]})]}),(0,a.jsxs)("div",{className:"mb-4",children:[(0,a.jsxs)("span",{className:"inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ".concat(N.color),children:[(0,a.jsx)(k,{className:"w-4 h-4 mr-2"}),N.label]}),!r.isActive&&(0,a.jsx)("span",{className:"ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800",children:"Inactivo"})]}),(0,a.jsx)("h1",{className:"text-3xl font-bold text-gray-900 mb-4",children:r.title})]}),r.imageUrl&&(0,a.jsx)("div",{className:"w-full",children:(0,a.jsx)("img",{src:r.imageUrl,alt:r.title,className:"w-full h-96 object-cover"})}),(0,a.jsxs)("div",{className:"p-6",children:[(0,a.jsx)("div",{className:"prose max-w-none",children:(0,a.jsx)("p",{className:"text-gray-700 text-lg leading-relaxed whitespace-pre-wrap",children:r.content})}),r.linkUrl&&(0,a.jsx)("div",{className:"mt-6 pt-6 border-t border-gray-200",children:(0,a.jsxs)("a",{href:r.linkUrl,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",children:[(0,a.jsx)(c.CkN,{className:"mr-2"}),"Ver m\xe1s informaci\xf3n"]})}),(0,a.jsx)("div",{className:"mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500",children:(0,a.jsxs)("div",{className:"flex justify-between items-center",children:[(0,a.jsxs)("span",{children:["Publicado el ",(0,x.WU)(new Date(r.createdAt),"dd MMMM yyyy",{locale:f.es})]}),r.updatedAt!==r.createdAt&&(0,a.jsxs)("span",{children:["Actualizado el ",(0,x.WU)(new Date(r.updatedAt),"dd MMMM yyyy",{locale:f.es})]})]})})]})]}),(0,a.jsx)("div",{className:"mt-8 text-center",children:(0,a.jsx)("button",{onClick:()=>e.push("/posts"),className:"px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",children:"Ver todos los posts"})})]})})]})}},1990:function(e,t,r){"use strict";var a=r(7294);let s=a.forwardRef(function(e,t){let{title:r,titleId:s,...o}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":s},o),r?a.createElement("title",{id:s},r):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"}))});t.Z=s},1263:function(e,t,r){"use strict";var a=r(7294);let s=a.forwardRef(function(e,t){let{title:r,titleId:s,...o}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":s},o),r?a.createElement("title",{id:s},r):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"}))});t.Z=s},4931:function(e,t,r){"use strict";var a=r(7294);let s=a.forwardRef(function(e,t){let{title:r,titleId:s,...o}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":s},o),r?a.createElement("title",{id:s},r):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"}))});t.Z=s},219:function(e,t,r){"use strict";var a=r(7294);let s=a.forwardRef(function(e,t){let{title:r,titleId:s,...o}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":s},o),r?a.createElement("title",{id:s},r):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"}))});t.Z=s},6501:function(e,t,r){"use strict";let a,s;r.d(t,{ZP:function(){return Y}});var o,i=r(7294);let n={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||n,c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,m=/\n+/g,u=(e,t)=>{let r="",a="",s="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?r=o+" "+i+";":a+="f"==o[1]?u(i,o):o+"{"+u(i,"k"==o[1]?"":t)+"}":"object"==typeof i?a+=u(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=u.p?u.p(o,i):o+":"+i+";")}return r+(t&&s?t+"{"+s+"}":s)+a},p={},x=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+x(e[r]);return t}return e},f=(e,t,r,a,s)=>{var o;let i=x(e),n=p[i]||(p[i]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(i));if(!p[n]){let t=i!==e?e:(e=>{let t,r,a=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?a.shift():t[3]?(r=t[3].replace(m," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(m," ").trim();return a[0]})(e);p[n]=u(s?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&p.g?p.g:null;return r&&(p.g=p[n]),o=p[n],l?t.data=t.data.replace(l,o):-1===t.data.indexOf(o)&&(t.data=a?o+t.data:t.data+o),n},h=(e,t,r)=>e.reduce((e,a,s)=>{let o=t[s];if(o&&o.call){let e=o(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":u(e,""):!1===e?"":e}return e+a+(null==o?"":o)},"");function g(e){let t=this||{},r=e.call?e(t.p):e;return f(r.unshift?r.raw?h(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}g.bind({g:1});let b,v,y,j=g.bind({k:1});function w(e,t){let r=this||{};return function(){let a=arguments;function s(o,i){let n=Object.assign({},o),l=n.className||s.className;r.p=Object.assign({theme:v&&v()},n),r.o=/ *go\d+/.test(l),n.className=g.apply(r,a)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),y&&c[0]&&y(n),b(c,n)}return t?t(s):s}}var N=e=>"function"==typeof e,k=(e,t)=>N(e)?e(t):e,E=(a=0,()=>(++a).toString()),A=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},Z=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return Z(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+s}))}}},M=[],P={toasts:[],pausedAt:void 0},C=e=>{P=Z(P,e),M.forEach(e=>{e(P)})},$=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||E()}),_=e=>(t,r)=>{let a=$(t,e,r);return C({type:2,toast:a}),a.id},z=(e,t)=>_("blank")(e,t);z.error=_("error"),z.success=_("success"),z.loading=_("loading"),z.custom=_("custom"),z.dismiss=e=>{C({type:3,toastId:e})},z.remove=e=>C({type:4,toastId:e}),z.promise=(e,t,r)=>{let a=z.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?k(t.success,e):void 0;return s?z.success(s,{id:a,...r,...null==r?void 0:r.success}):z.dismiss(a),e}).catch(e=>{let s=t.error?k(t.error,e):void 0;s?z.error(s,{id:a,...r,...null==r?void 0:r.error}):z.dismiss(a)}),e};var O=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,S=j`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,L=j`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,T=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${O} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${S} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,D=j`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,H=w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${D} 1s linear infinite;
`,I=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,U=j`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,V=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${I} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${U} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,F=w("div")`
  position: absolute;
`,W=w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,q=j`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,R=w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${q} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,X=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?i.createElement(R,null,t):t:"blank"===r?null:i.createElement(W,null,i.createElement(H,{...a}),"loading"!==r&&i.createElement(F,null,"error"===r?i.createElement(T,{...a}):i.createElement(V,{...a})))},B=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,J=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,G=w("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Q=w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,K=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=A()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[B(r),J(r)];return{animation:t?`${j(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${j(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};i.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?K(e.position||t||"top-center",e.visible):{opacity:0},o=i.createElement(X,{toast:e}),n=i.createElement(Q,{...e.ariaProps},k(e.message,e));return i.createElement(G,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:o,message:n}):i.createElement(i.Fragment,null,o,n))}),o=i.createElement,u.p=void 0,b=o,v=void 0,y=void 0,g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var Y=z}},function(e){e.O(0,[365,999,114,242,888,774,179],function(){return e(e.s=7411)}),_N_E=e.O()}]);