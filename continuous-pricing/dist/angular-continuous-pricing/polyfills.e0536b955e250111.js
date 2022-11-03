"use strict";(self.webpackChunkangular_rm_overview=self.webpackChunkangular_rm_overview||[]).push([[429],{435:(ie,ye,le)=>{le(583),le(568)},568:(ie,ye,le)=>{var Se;void 0!==(Se=function(){Zone.__load_patch("ResizeObserver",function(de,ve,pe){var _e=de.ResizeObserver;if(_e){var $=pe.symbol("ResizeObserver");pe.patchMethod(de,"ResizeObserver",function(Q){return function(J,X){var ee=X.length>0?X[0]:null;return ee&&(X[0]=function(R,ce){for(var me=this,U={},Ge=ve.current,Ce=0,He=R;Ce<He.length;Ce++){var Ie=He[Ce],be=Ie.target[$];be||(be=Ge);var Pe=U[be.name];Pe||(U[be.name]=Pe={entries:[],zone:be}),Pe.entries.push(Ie)}Object.keys(U).forEach(function(Le){var Oe=U[Le];Oe.zone!==ve.current?Oe.zone.run(ee,me,[Oe.entries,ce],"ResizeObserver"):ee.call(me,Oe.entries,ce)})}),X.length>0?new _e(X[0]):new _e}}),pe.patchMethod(_e.prototype,"observe",function(Q){return function(J,X){var ee=X.length>0?X[0]:null;if(!ee)return Q.apply(J,X);var R=J[$];return R||(R=J[$]=[]),R.push(ee),ee[$]=ve.current,Q.apply(J,X)}}),pe.patchMethod(_e.prototype,"unobserve",function(Q){return function(J,X){var ee=X.length>0?X[0]:null;if(!ee)return Q.apply(J,X);var R=J[$];if(R)for(var ce=0;ce<R.length;ce++)if(R[ce]===ee){R.splice(ce,1);break}return ee[$]=void 0,Q.apply(J,X)}}),pe.patchMethod(_e.prototype,"disconnect",function(Q){return function(J,X){var ee=J[$];return ee&&(ee.forEach(function(R){R[$]=void 0}),J[$]=void 0),Q.apply(J,X)}})}})}.call(ye,le,ye,ie))&&(ie.exports=Se)},583:()=>{!function(e){const n=e.performance;function i(L){n&&n.mark&&n.mark(L)}function o(L,E){n&&n.measure&&n.measure(L,E)}i("Zone");const c=e.__Zone_symbol_prefix||"__zone_symbol__";function a(L){return c+L}const y=!0===e[a("forceDuplicateZoneCheck")];if(e.Zone){if(y||"function"!=typeof e.Zone.__symbol__)throw new Error("Zone already loaded.");return e.Zone}let d=(()=>{class L{constructor(t,r){this._parent=t,this._name=r?r.name||"unnamed":"<root>",this._properties=r&&r.properties||{},this._zoneDelegate=new v(this,this._parent&&this._parent._zoneDelegate,r)}static assertZonePatched(){if(e.Promise!==Ee.ZoneAwarePromise)throw new Error("Zone.js has detected that ZoneAwarePromise `(window|global).Promise` has been overwritten.\nMost likely cause is that a Promise polyfill has been loaded after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. If you must load one, do so before loading zone.js.)")}static get root(){let t=L.current;for(;t.parent;)t=t.parent;return t}static get current(){return z.zone}static get currentTask(){return fe}static __load_patch(t,r,k=!1){if(Ee.hasOwnProperty(t)){if(!k&&y)throw Error("Already loaded patch: "+t)}else if(!e["__Zone_disable_"+t]){const O="Zone:"+t;i(O),Ee[t]=r(e,L,K),o(O,O)}}get parent(){return this._parent}get name(){return this._name}get(t){const r=this.getZoneWith(t);if(r)return r._properties[t]}getZoneWith(t){let r=this;for(;r;){if(r._properties.hasOwnProperty(t))return r;r=r._parent}return null}fork(t){if(!t)throw new Error("ZoneSpec required!");return this._zoneDelegate.fork(this,t)}wrap(t,r){if("function"!=typeof t)throw new Error("Expecting function got: "+t);const k=this._zoneDelegate.intercept(this,t,r),O=this;return function(){return O.runGuarded(k,this,arguments,r)}}run(t,r,k,O){z={parent:z,zone:this};try{return this._zoneDelegate.invoke(this,t,r,k,O)}finally{z=z.parent}}runGuarded(t,r=null,k,O){z={parent:z,zone:this};try{try{return this._zoneDelegate.invoke(this,t,r,k,O)}catch(te){if(this._zoneDelegate.handleError(this,te))throw te}}finally{z=z.parent}}runTask(t,r,k){if(t.zone!=this)throw new Error("A task can only be run in the zone of creation! (Creation: "+(t.zone||ne).name+"; Execution: "+this.name+")");if(t.state===x&&(t.type===oe||t.type===w))return;const O=t.state!=p;O&&t._transitionTo(p,j),t.runCount++;const te=fe;fe=t,z={parent:z,zone:this};try{t.type==w&&t.data&&!t.data.isPeriodic&&(t.cancelFn=void 0);try{return this._zoneDelegate.invokeTask(this,t,r,k)}catch(l){if(this._zoneDelegate.handleError(this,l))throw l}}finally{t.state!==x&&t.state!==h&&(t.type==oe||t.data&&t.data.isPeriodic?O&&t._transitionTo(j,p):(t.runCount=0,this._updateTaskCount(t,-1),O&&t._transitionTo(x,p,x))),z=z.parent,fe=te}}scheduleTask(t){if(t.zone&&t.zone!==this){let k=this;for(;k;){if(k===t.zone)throw Error(`can not reschedule task to ${this.name} which is descendants of the original zone ${t.zone.name}`);k=k.parent}}t._transitionTo(Y,x);const r=[];t._zoneDelegates=r,t._zone=this;try{t=this._zoneDelegate.scheduleTask(this,t)}catch(k){throw t._transitionTo(h,Y,x),this._zoneDelegate.handleError(this,k),k}return t._zoneDelegates===r&&this._updateTaskCount(t,1),t.state==Y&&t._transitionTo(j,Y),t}scheduleMicroTask(t,r,k,O){return this.scheduleTask(new m(I,t,r,k,O,void 0))}scheduleMacroTask(t,r,k,O,te){return this.scheduleTask(new m(w,t,r,k,O,te))}scheduleEventTask(t,r,k,O,te){return this.scheduleTask(new m(oe,t,r,k,O,te))}cancelTask(t){if(t.zone!=this)throw new Error("A task can only be cancelled in the zone of creation! (Creation: "+(t.zone||ne).name+"; Execution: "+this.name+")");t._transitionTo(B,j,p);try{this._zoneDelegate.cancelTask(this,t)}catch(r){throw t._transitionTo(h,B),this._zoneDelegate.handleError(this,r),r}return this._updateTaskCount(t,-1),t._transitionTo(x,B),t.runCount=0,t}_updateTaskCount(t,r){const k=t._zoneDelegates;-1==r&&(t._zoneDelegates=null);for(let O=0;O<k.length;O++)k[O]._updateTaskCount(t.type,r)}}return L.__symbol__=a,L})();const P={name:"",onHasTask:(L,E,t,r)=>L.hasTask(t,r),onScheduleTask:(L,E,t,r)=>L.scheduleTask(t,r),onInvokeTask:(L,E,t,r,k,O)=>L.invokeTask(t,r,k,O),onCancelTask:(L,E,t,r)=>L.cancelTask(t,r)};class v{constructor(E,t,r){this._taskCounts={microTask:0,macroTask:0,eventTask:0},this.zone=E,this._parentDelegate=t,this._forkZS=r&&(r&&r.onFork?r:t._forkZS),this._forkDlgt=r&&(r.onFork?t:t._forkDlgt),this._forkCurrZone=r&&(r.onFork?this.zone:t._forkCurrZone),this._interceptZS=r&&(r.onIntercept?r:t._interceptZS),this._interceptDlgt=r&&(r.onIntercept?t:t._interceptDlgt),this._interceptCurrZone=r&&(r.onIntercept?this.zone:t._interceptCurrZone),this._invokeZS=r&&(r.onInvoke?r:t._invokeZS),this._invokeDlgt=r&&(r.onInvoke?t:t._invokeDlgt),this._invokeCurrZone=r&&(r.onInvoke?this.zone:t._invokeCurrZone),this._handleErrorZS=r&&(r.onHandleError?r:t._handleErrorZS),this._handleErrorDlgt=r&&(r.onHandleError?t:t._handleErrorDlgt),this._handleErrorCurrZone=r&&(r.onHandleError?this.zone:t._handleErrorCurrZone),this._scheduleTaskZS=r&&(r.onScheduleTask?r:t._scheduleTaskZS),this._scheduleTaskDlgt=r&&(r.onScheduleTask?t:t._scheduleTaskDlgt),this._scheduleTaskCurrZone=r&&(r.onScheduleTask?this.zone:t._scheduleTaskCurrZone),this._invokeTaskZS=r&&(r.onInvokeTask?r:t._invokeTaskZS),this._invokeTaskDlgt=r&&(r.onInvokeTask?t:t._invokeTaskDlgt),this._invokeTaskCurrZone=r&&(r.onInvokeTask?this.zone:t._invokeTaskCurrZone),this._cancelTaskZS=r&&(r.onCancelTask?r:t._cancelTaskZS),this._cancelTaskDlgt=r&&(r.onCancelTask?t:t._cancelTaskDlgt),this._cancelTaskCurrZone=r&&(r.onCancelTask?this.zone:t._cancelTaskCurrZone),this._hasTaskZS=null,this._hasTaskDlgt=null,this._hasTaskDlgtOwner=null,this._hasTaskCurrZone=null;const k=r&&r.onHasTask;(k||t&&t._hasTaskZS)&&(this._hasTaskZS=k?r:P,this._hasTaskDlgt=t,this._hasTaskDlgtOwner=this,this._hasTaskCurrZone=E,r.onScheduleTask||(this._scheduleTaskZS=P,this._scheduleTaskDlgt=t,this._scheduleTaskCurrZone=this.zone),r.onInvokeTask||(this._invokeTaskZS=P,this._invokeTaskDlgt=t,this._invokeTaskCurrZone=this.zone),r.onCancelTask||(this._cancelTaskZS=P,this._cancelTaskDlgt=t,this._cancelTaskCurrZone=this.zone))}fork(E,t){return this._forkZS?this._forkZS.onFork(this._forkDlgt,this.zone,E,t):new d(E,t)}intercept(E,t,r){return this._interceptZS?this._interceptZS.onIntercept(this._interceptDlgt,this._interceptCurrZone,E,t,r):t}invoke(E,t,r,k,O){return this._invokeZS?this._invokeZS.onInvoke(this._invokeDlgt,this._invokeCurrZone,E,t,r,k,O):t.apply(r,k)}handleError(E,t){return!this._handleErrorZS||this._handleErrorZS.onHandleError(this._handleErrorDlgt,this._handleErrorCurrZone,E,t)}scheduleTask(E,t){let r=t;if(this._scheduleTaskZS)this._hasTaskZS&&r._zoneDelegates.push(this._hasTaskDlgtOwner),r=this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt,this._scheduleTaskCurrZone,E,t),r||(r=t);else if(t.scheduleFn)t.scheduleFn(t);else{if(t.type!=I)throw new Error("Task is missing scheduleFn.");C(t)}return r}invokeTask(E,t,r,k){return this._invokeTaskZS?this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt,this._invokeTaskCurrZone,E,t,r,k):t.callback.apply(r,k)}cancelTask(E,t){let r;if(this._cancelTaskZS)r=this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt,this._cancelTaskCurrZone,E,t);else{if(!t.cancelFn)throw Error("Task is not cancelable");r=t.cancelFn(t)}return r}hasTask(E,t){try{this._hasTaskZS&&this._hasTaskZS.onHasTask(this._hasTaskDlgt,this._hasTaskCurrZone,E,t)}catch(r){this.handleError(E,r)}}_updateTaskCount(E,t){const r=this._taskCounts,k=r[E],O=r[E]=k+t;if(O<0)throw new Error("More tasks executed then were scheduled.");0!=k&&0!=O||this.hasTask(this.zone,{microTask:r.microTask>0,macroTask:r.macroTask>0,eventTask:r.eventTask>0,change:E})}}class m{constructor(E,t,r,k,O,te){if(this._zone=null,this.runCount=0,this._zoneDelegates=null,this._state="notScheduled",this.type=E,this.source=t,this.data=k,this.scheduleFn=O,this.cancelFn=te,!r)throw new Error("callback is not defined");this.callback=r;const l=this;this.invoke=E===oe&&k&&k.useG?m.invokeTask:function(){return m.invokeTask.call(e,l,this,arguments)}}static invokeTask(E,t,r){E||(E=this),se++;try{return E.runCount++,E.zone.runTask(E,t,r)}finally{1==se&&_(),se--}}get zone(){return this._zone}get state(){return this._state}cancelScheduleRequest(){this._transitionTo(x,Y)}_transitionTo(E,t,r){if(this._state!==t&&this._state!==r)throw new Error(`${this.type} '${this.source}': can not transition to '${E}', expecting state '${t}'${r?" or '"+r+"'":""}, was '${this._state}'.`);this._state=E,E==x&&(this._zoneDelegates=null)}toString(){return this.data&&typeof this.data.handleId<"u"?this.data.handleId.toString():Object.prototype.toString.call(this)}toJSON(){return{type:this.type,state:this.state,source:this.source,zone:this.zone.name,runCount:this.runCount}}}const A=a("setTimeout"),N=a("Promise"),M=a("then");let re,V=[],H=!1;function q(L){if(re||e[N]&&(re=e[N].resolve(0)),re){let E=re[M];E||(E=re.then),E.call(re,L)}else e[A](L,0)}function C(L){0===se&&0===V.length&&q(_),L&&V.push(L)}function _(){if(!H){for(H=!0;V.length;){const L=V;V=[];for(let E=0;E<L.length;E++){const t=L[E];try{t.zone.runTask(t,null,null)}catch(r){K.onUnhandledError(r)}}}K.microtaskDrainDone(),H=!1}}const ne={name:"NO ZONE"},x="notScheduled",Y="scheduling",j="scheduled",p="running",B="canceling",h="unknown",I="microTask",w="macroTask",oe="eventTask",Ee={},K={symbol:a,currentZoneFrame:()=>z,onUnhandledError:W,microtaskDrainDone:W,scheduleMicroTask:C,showUncaughtError:()=>!d[a("ignoreConsoleErrorUncaughtError")],patchEventTarget:()=>[],patchOnProperties:W,patchMethod:()=>W,bindArguments:()=>[],patchThen:()=>W,patchMacroTask:()=>W,patchEventPrototype:()=>W,isIEOrEdge:()=>!1,getGlobalObjects:()=>{},ObjectDefineProperty:()=>W,ObjectGetOwnPropertyDescriptor:()=>{},ObjectCreate:()=>{},ArraySlice:()=>[],patchClass:()=>W,wrapWithCurrentZone:()=>W,filterProperties:()=>[],attachOriginToPatched:()=>W,_redefineProperty:()=>W,patchCallbacks:()=>W,nativeScheduleMicroTask:q};let z={parent:null,zone:new d(null,null)},fe=null,se=0;function W(){}o("Zone","Zone"),e.Zone=d}(typeof window<"u"&&window||typeof self<"u"&&self||global);const ie=Object.getOwnPropertyDescriptor,ye=Object.defineProperty,le=Object.getPrototypeOf,he=Object.create,Se=Array.prototype.slice,de="addEventListener",ve="removeEventListener",pe=Zone.__symbol__(de),_e=Zone.__symbol__(ve),$="true",Q="false",J=Zone.__symbol__("");function X(e,n){return Zone.current.wrap(e,n)}function ee(e,n,i,o,c){return Zone.current.scheduleMacroTask(e,n,i,o,c)}const R=Zone.__symbol__,ce=typeof window<"u",me=ce?window:void 0,U=ce&&me||"object"==typeof self&&self||global;function Ce(e,n){for(let i=e.length-1;i>=0;i--)"function"==typeof e[i]&&(e[i]=X(e[i],n+"_"+i));return e}function Ie(e){return!e||!1!==e.writable&&!("function"==typeof e.get&&typeof e.set>"u")}const be=typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope,Pe=!("nw"in U)&&typeof U.process<"u"&&"[object process]"==={}.toString.call(U.process),Le=!Pe&&!be&&!(!ce||!me.HTMLElement),Oe=typeof U.process<"u"&&"[object process]"==={}.toString.call(U.process)&&!be&&!(!ce||!me.HTMLElement),xe={},Xe=function(e){if(!(e=e||U.event))return;let n=xe[e.type];n||(n=xe[e.type]=R("ON_PROPERTY"+e.type));const i=this||e.target||U,o=i[n];let c;if(Le&&i===me&&"error"===e.type){const a=e;c=o&&o.call(this,a.message,a.filename,a.lineno,a.colno,a.error),!0===c&&e.preventDefault()}else c=o&&o.apply(this,arguments),null!=c&&!c&&e.preventDefault();return c};function qe(e,n,i){let o=ie(e,n);if(!o&&i&&ie(i,n)&&(o={enumerable:!0,configurable:!0}),!o||!o.configurable)return;const c=R("on"+n+"patched");if(e.hasOwnProperty(c)&&e[c])return;delete o.writable,delete o.value;const a=o.get,y=o.set,d=n.slice(2);let P=xe[d];P||(P=xe[d]=R("ON_PROPERTY"+d)),o.set=function(v){let m=this;!m&&e===U&&(m=U),m&&("function"==typeof m[P]&&m.removeEventListener(d,Xe),y&&y.call(m,null),m[P]=v,"function"==typeof v&&m.addEventListener(d,Xe,!1))},o.get=function(){let v=this;if(!v&&e===U&&(v=U),!v)return null;const m=v[P];if(m)return m;if(a){let A=a.call(this);if(A)return o.set.call(this,A),"function"==typeof v.removeAttribute&&v.removeAttribute(n),A}return null},ye(e,n,o),e[c]=!0}function Ye(e,n,i){if(n)for(let o=0;o<n.length;o++)qe(e,"on"+n[o],i);else{const o=[];for(const c in e)"on"==c.slice(0,2)&&o.push(c);for(let c=0;c<o.length;c++)qe(e,o[c],i)}}const ue=R("originalInstance");function Ae(e){const n=U[e];if(!n)return;U[R(e)]=n,U[e]=function(){const c=Ce(arguments,e);switch(c.length){case 0:this[ue]=new n;break;case 1:this[ue]=new n(c[0]);break;case 2:this[ue]=new n(c[0],c[1]);break;case 3:this[ue]=new n(c[0],c[1],c[2]);break;case 4:this[ue]=new n(c[0],c[1],c[2],c[3]);break;default:throw new Error("Arg list too long.")}},ke(U[e],n);const i=new n(function(){});let o;for(o in i)"XMLHttpRequest"===e&&"responseBlob"===o||function(c){"function"==typeof i[c]?U[e].prototype[c]=function(){return this[ue][c].apply(this[ue],arguments)}:ye(U[e].prototype,c,{set:function(a){"function"==typeof a?(this[ue][c]=X(a,e+"."+c),ke(this[ue][c],a)):this[ue][c]=a},get:function(){return this[ue][c]}})}(o);for(o in n)"prototype"!==o&&n.hasOwnProperty(o)&&(U[e][o]=n[o])}function ge(e,n,i){let o=e;for(;o&&!o.hasOwnProperty(n);)o=le(o);!o&&e[n]&&(o=e);const c=R(n);let a=null;if(o&&(!(a=o[c])||!o.hasOwnProperty(c))&&(a=o[c]=o[n],Ie(o&&ie(o,n)))){const d=i(a,c,n);o[n]=function(){return d(this,arguments)},ke(o[n],a)}return a}function lt(e,n,i){let o=null;function c(a){const y=a.data;return y.args[y.cbIdx]=function(){a.invoke.apply(this,arguments)},o.apply(y.target,y.args),a}o=ge(e,n,a=>function(y,d){const P=i(y,d);return P.cbIdx>=0&&"function"==typeof d[P.cbIdx]?ee(P.name,d[P.cbIdx],P,c):a.apply(y,d)})}function ke(e,n){e[R("OriginalDelegate")]=n}let Ke=!1,Ve=!1;function ft(){if(Ke)return Ve;Ke=!0;try{const e=me.navigator.userAgent;(-1!==e.indexOf("MSIE ")||-1!==e.indexOf("Trident/")||-1!==e.indexOf("Edge/"))&&(Ve=!0)}catch{}return Ve}Zone.__load_patch("ZoneAwarePromise",(e,n,i)=>{const o=Object.getOwnPropertyDescriptor,c=Object.defineProperty,y=i.symbol,d=[],P=!0===e[y("DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION")],v=y("Promise"),m=y("then");i.onUnhandledError=l=>{if(i.showUncaughtError()){const u=l&&l.rejection;u?console.error("Unhandled Promise rejection:",u instanceof Error?u.message:u,"; Zone:",l.zone.name,"; Task:",l.task&&l.task.source,"; Value:",u,u instanceof Error?u.stack:void 0):console.error(l)}},i.microtaskDrainDone=()=>{for(;d.length;){const l=d.shift();try{l.zone.runGuarded(()=>{throw l.throwOriginal?l.rejection:l})}catch(u){M(u)}}};const N=y("unhandledPromiseRejectionHandler");function M(l){i.onUnhandledError(l);try{const u=n[N];"function"==typeof u&&u.call(this,l)}catch{}}function V(l){return l&&l.then}function H(l){return l}function re(l){return t.reject(l)}const q=y("state"),C=y("value"),_=y("finally"),ne=y("parentPromiseValue"),x=y("parentPromiseState"),j=null,p=!0,B=!1;function I(l,u){return s=>{try{K(l,u,s)}catch(f){K(l,!1,f)}}}const w=function(){let l=!1;return function(s){return function(){l||(l=!0,s.apply(null,arguments))}}},Ee=y("currentTaskTrace");function K(l,u,s){const f=w();if(l===s)throw new TypeError("Promise resolved with itself");if(l[q]===j){let g=null;try{("object"==typeof s||"function"==typeof s)&&(g=s&&s.then)}catch(b){return f(()=>{K(l,!1,b)})(),l}if(u!==B&&s instanceof t&&s.hasOwnProperty(q)&&s.hasOwnProperty(C)&&s[q]!==j)fe(s),K(l,s[q],s[C]);else if(u!==B&&"function"==typeof g)try{g.call(s,f(I(l,u)),f(I(l,!1)))}catch(b){f(()=>{K(l,!1,b)})()}else{l[q]=u;const b=l[C];if(l[C]=s,l[_]===_&&u===p&&(l[q]=l[x],l[C]=l[ne]),u===B&&s instanceof Error){const T=n.currentTask&&n.currentTask.data&&n.currentTask.data.__creationTrace__;T&&c(s,Ee,{configurable:!0,enumerable:!1,writable:!0,value:T})}for(let T=0;T<b.length;)se(l,b[T++],b[T++],b[T++],b[T++]);if(0==b.length&&u==B){l[q]=0;let T=s;try{throw new Error("Uncaught (in promise): "+function a(l){return l&&l.toString===Object.prototype.toString?(l.constructor&&l.constructor.name||"")+": "+JSON.stringify(l):l?l.toString():Object.prototype.toString.call(l)}(s)+(s&&s.stack?"\n"+s.stack:""))}catch(D){T=D}P&&(T.throwOriginal=!0),T.rejection=s,T.promise=l,T.zone=n.current,T.task=n.currentTask,d.push(T),i.scheduleMicroTask()}}}return l}const z=y("rejectionHandledHandler");function fe(l){if(0===l[q]){try{const u=n[z];u&&"function"==typeof u&&u.call(this,{rejection:l[C],promise:l})}catch{}l[q]=B;for(let u=0;u<d.length;u++)l===d[u].promise&&d.splice(u,1)}}function se(l,u,s,f,g){fe(l);const b=l[q],T=b?"function"==typeof f?f:H:"function"==typeof g?g:re;u.scheduleMicroTask("Promise.then",()=>{try{const D=l[C],S=!!s&&_===s[_];S&&(s[ne]=D,s[x]=b);const Z=u.run(T,void 0,S&&T!==re&&T!==H?[]:[D]);K(s,!0,Z)}catch(D){K(s,!1,D)}},s)}const L=function(){},E=e.AggregateError;class t{static toString(){return"function ZoneAwarePromise() { [native code] }"}static resolve(u){return K(new this(null),p,u)}static reject(u){return K(new this(null),B,u)}static any(u){if(!u||"function"!=typeof u[Symbol.iterator])return Promise.reject(new E([],"All promises were rejected"));const s=[];let f=0;try{for(let T of u)f++,s.push(t.resolve(T))}catch{return Promise.reject(new E([],"All promises were rejected"))}if(0===f)return Promise.reject(new E([],"All promises were rejected"));let g=!1;const b=[];return new t((T,D)=>{for(let S=0;S<s.length;S++)s[S].then(Z=>{g||(g=!0,T(Z))},Z=>{b.push(Z),f--,0===f&&(g=!0,D(new E(b,"All promises were rejected")))})})}static race(u){let s,f,g=new this((D,S)=>{s=D,f=S});function b(D){s(D)}function T(D){f(D)}for(let D of u)V(D)||(D=this.resolve(D)),D.then(b,T);return g}static all(u){return t.allWithCallback(u)}static allSettled(u){return(this&&this.prototype instanceof t?this:t).allWithCallback(u,{thenCallback:f=>({status:"fulfilled",value:f}),errorCallback:f=>({status:"rejected",reason:f})})}static allWithCallback(u,s){let f,g,b=new this((Z,F)=>{f=Z,g=F}),T=2,D=0;const S=[];for(let Z of u){V(Z)||(Z=this.resolve(Z));const F=D;try{Z.then(G=>{S[F]=s?s.thenCallback(G):G,T--,0===T&&f(S)},G=>{s?(S[F]=s.errorCallback(G),T--,0===T&&f(S)):g(G)})}catch(G){g(G)}T++,D++}return T-=2,0===T&&f(S),b}constructor(u){const s=this;if(!(s instanceof t))throw new Error("Must be an instanceof Promise.");s[q]=j,s[C]=[];try{const f=w();u&&u(f(I(s,p)),f(I(s,B)))}catch(f){K(s,!1,f)}}get[Symbol.toStringTag](){return"Promise"}get[Symbol.species](){return t}then(u,s){var f;let g=null===(f=this.constructor)||void 0===f?void 0:f[Symbol.species];(!g||"function"!=typeof g)&&(g=this.constructor||t);const b=new g(L),T=n.current;return this[q]==j?this[C].push(T,b,u,s):se(this,T,b,u,s),b}catch(u){return this.then(null,u)}finally(u){var s;let f=null===(s=this.constructor)||void 0===s?void 0:s[Symbol.species];(!f||"function"!=typeof f)&&(f=t);const g=new f(L);g[_]=_;const b=n.current;return this[q]==j?this[C].push(b,g,u,u):se(this,b,g,u,u),g}}t.resolve=t.resolve,t.reject=t.reject,t.race=t.race,t.all=t.all;const r=e[v]=e.Promise;e.Promise=t;const k=y("thenPatched");function O(l){const u=l.prototype,s=o(u,"then");if(s&&(!1===s.writable||!s.configurable))return;const f=u.then;u[m]=f,l.prototype.then=function(g,b){return new t((D,S)=>{f.call(this,D,S)}).then(g,b)},l[k]=!0}return i.patchThen=O,r&&(O(r),ge(e,"fetch",l=>function te(l){return function(u,s){let f=l.apply(u,s);if(f instanceof t)return f;let g=f.constructor;return g[k]||O(g),f}}(l))),Promise[n.__symbol__("uncaughtPromiseErrors")]=d,t}),Zone.__load_patch("toString",e=>{const n=Function.prototype.toString,i=R("OriginalDelegate"),o=R("Promise"),c=R("Error"),a=function(){if("function"==typeof this){const v=this[i];if(v)return"function"==typeof v?n.call(v):Object.prototype.toString.call(v);if(this===Promise){const m=e[o];if(m)return n.call(m)}if(this===Error){const m=e[c];if(m)return n.call(m)}}return n.call(this)};a[i]=n,Function.prototype.toString=a;const y=Object.prototype.toString;Object.prototype.toString=function(){return"function"==typeof Promise&&this instanceof Promise?"[object Promise]":y.call(this)}});let Ze=!1;if(typeof window<"u")try{const e=Object.defineProperty({},"passive",{get:function(){Ze=!0}});window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch{Ze=!1}const ht={useG:!0},ae={},$e={},Je=new RegExp("^"+J+"(\\w+)(true|false)$"),Qe=R("propagationStopped");function et(e,n){const i=(n?n(e):e)+Q,o=(n?n(e):e)+$,c=J+i,a=J+o;ae[e]={},ae[e][Q]=c,ae[e][$]=a}function dt(e,n,i,o){const c=o&&o.add||de,a=o&&o.rm||ve,y=o&&o.listeners||"eventListeners",d=o&&o.rmAll||"removeAllListeners",P=R(c),v="."+c+":",N=function(C,_,ne){if(C.isRemoved)return;const x=C.callback;let Y;"object"==typeof x&&x.handleEvent&&(C.callback=p=>x.handleEvent(p),C.originalDelegate=x);try{C.invoke(C,_,[ne])}catch(p){Y=p}const j=C.options;return j&&"object"==typeof j&&j.once&&_[a].call(_,ne.type,C.originalDelegate?C.originalDelegate:C.callback,j),Y};function M(C,_,ne){if(!(_=_||e.event))return;const x=C||_.target||e,Y=x[ae[_.type][ne?$:Q]];if(Y){const j=[];if(1===Y.length){const p=N(Y[0],x,_);p&&j.push(p)}else{const p=Y.slice();for(let B=0;B<p.length&&(!_||!0!==_[Qe]);B++){const h=N(p[B],x,_);h&&j.push(h)}}if(1===j.length)throw j[0];for(let p=0;p<j.length;p++){const B=j[p];n.nativeScheduleMicroTask(()=>{throw B})}}}const V=function(C){return M(this,C,!1)},H=function(C){return M(this,C,!0)};function re(C,_){if(!C)return!1;let ne=!0;_&&void 0!==_.useG&&(ne=_.useG);const x=_&&_.vh;let Y=!0;_&&void 0!==_.chkDup&&(Y=_.chkDup);let j=!1;_&&void 0!==_.rt&&(j=_.rt);let p=C;for(;p&&!p.hasOwnProperty(c);)p=le(p);if(!p&&C[c]&&(p=C),!p||p[P])return!1;const B=_&&_.eventNameToString,h={},I=p[P]=p[c],w=p[R(a)]=p[a],oe=p[R(y)]=p[y],Ee=p[R(d)]=p[d];let K;function z(s,f){return!Ze&&"object"==typeof s&&s?!!s.capture:Ze&&f?"boolean"==typeof s?{capture:s,passive:!0}:s?"object"==typeof s&&!1!==s.passive?Object.assign(Object.assign({},s),{passive:!0}):s:{passive:!0}:s}_&&_.prepend&&(K=p[R(_.prepend)]=p[_.prepend]);const t=ne?function(s){if(!h.isExisting)return I.call(h.target,h.eventName,h.capture?H:V,h.options)}:function(s){return I.call(h.target,h.eventName,s.invoke,h.options)},r=ne?function(s){if(!s.isRemoved){const f=ae[s.eventName];let g;f&&(g=f[s.capture?$:Q]);const b=g&&s.target[g];if(b)for(let T=0;T<b.length;T++)if(b[T]===s){b.splice(T,1),s.isRemoved=!0,0===b.length&&(s.allRemoved=!0,s.target[g]=null);break}}if(s.allRemoved)return w.call(s.target,s.eventName,s.capture?H:V,s.options)}:function(s){return w.call(s.target,s.eventName,s.invoke,s.options)},O=_&&_.diff?_.diff:function(s,f){const g=typeof f;return"function"===g&&s.callback===f||"object"===g&&s.originalDelegate===f},te=Zone[R("UNPATCHED_EVENTS")],l=e[R("PASSIVE_EVENTS")],u=function(s,f,g,b,T=!1,D=!1){return function(){const S=this||e;let Z=arguments[0];_&&_.transferEventName&&(Z=_.transferEventName(Z));let F=arguments[1];if(!F)return s.apply(this,arguments);if(Pe&&"uncaughtException"===Z)return s.apply(this,arguments);let G=!1;if("function"!=typeof F){if(!F.handleEvent)return s.apply(this,arguments);G=!0}if(x&&!x(s,F,S,arguments))return;const we=Ze&&!!l&&-1!==l.indexOf(Z),Te=z(arguments[2],we);if(te)for(let De=0;De<te.length;De++)if(Z===te[De])return we?s.call(S,Z,F,Te):s.apply(this,arguments);const ze=!!Te&&("boolean"==typeof Te||Te.capture),ot=!(!Te||"object"!=typeof Te)&&Te.once,gt=Zone.current;let We=ae[Z];We||(et(Z,B),We=ae[Z]);const st=We[ze?$:Q];let Fe,Me=S[st],it=!1;if(Me){if(it=!0,Y)for(let De=0;De<Me.length;De++)if(O(Me[De],F))return}else Me=S[st]=[];const ct=S.constructor.name,at=$e[ct];at&&(Fe=at[Z]),Fe||(Fe=ct+f+(B?B(Z):Z)),h.options=Te,ot&&(h.options.once=!1),h.target=S,h.capture=ze,h.eventName=Z,h.isExisting=it;const je=ne?ht:void 0;je&&(je.taskData=h);const Re=gt.scheduleEventTask(Fe,F,je,g,b);return h.target=null,je&&(je.taskData=null),ot&&(Te.once=!0),!Ze&&"boolean"==typeof Re.options||(Re.options=Te),Re.target=S,Re.capture=ze,Re.eventName=Z,G&&(Re.originalDelegate=F),D?Me.unshift(Re):Me.push(Re),T?S:void 0}};return p[c]=u(I,v,t,r,j),K&&(p.prependListener=u(K,".prependListener:",function(s){return K.call(h.target,h.eventName,s.invoke,h.options)},r,j,!0)),p[a]=function(){const s=this||e;let f=arguments[0];_&&_.transferEventName&&(f=_.transferEventName(f));const g=arguments[2],b=!!g&&("boolean"==typeof g||g.capture),T=arguments[1];if(!T)return w.apply(this,arguments);if(x&&!x(w,T,s,arguments))return;const D=ae[f];let S;D&&(S=D[b?$:Q]);const Z=S&&s[S];if(Z)for(let F=0;F<Z.length;F++){const G=Z[F];if(O(G,T))return Z.splice(F,1),G.isRemoved=!0,0===Z.length&&(G.allRemoved=!0,s[S]=null,"string"==typeof f)&&(s[J+"ON_PROPERTY"+f]=null),G.zone.cancelTask(G),j?s:void 0}return w.apply(this,arguments)},p[y]=function(){const s=this||e;let f=arguments[0];_&&_.transferEventName&&(f=_.transferEventName(f));const g=[],b=tt(s,B?B(f):f);for(let T=0;T<b.length;T++){const D=b[T];g.push(D.originalDelegate?D.originalDelegate:D.callback)}return g},p[d]=function(){const s=this||e;let f=arguments[0];if(f){_&&_.transferEventName&&(f=_.transferEventName(f));const g=ae[f];if(g){const D=s[g[Q]],S=s[g[$]];if(D){const Z=D.slice();for(let F=0;F<Z.length;F++){const G=Z[F];this[a].call(this,f,G.originalDelegate?G.originalDelegate:G.callback,G.options)}}if(S){const Z=S.slice();for(let F=0;F<Z.length;F++){const G=Z[F];this[a].call(this,f,G.originalDelegate?G.originalDelegate:G.callback,G.options)}}}}else{const g=Object.keys(s);for(let b=0;b<g.length;b++){const D=Je.exec(g[b]);let S=D&&D[1];S&&"removeListener"!==S&&this[d].call(this,S)}this[d].call(this,"removeListener")}if(j)return this},ke(p[c],I),ke(p[a],w),Ee&&ke(p[d],Ee),oe&&ke(p[y],oe),!0}let q=[];for(let C=0;C<i.length;C++)q[C]=re(i[C],o);return q}function tt(e,n){if(!n){const a=[];for(let y in e){const d=Je.exec(y);let P=d&&d[1];if(P&&(!n||P===n)){const v=e[y];if(v)for(let m=0;m<v.length;m++)a.push(v[m])}}return a}let i=ae[n];i||(et(n),i=ae[n]);const o=e[i[Q]],c=e[i[$]];return o?c?o.concat(c):o.slice():c?c.slice():[]}function _t(e,n){const i=e.Event;i&&i.prototype&&n.patchMethod(i.prototype,"stopImmediatePropagation",o=>function(c,a){c[Qe]=!0,o&&o.apply(c,a)})}function Et(e,n,i,o,c){const a=Zone.__symbol__(o);if(n[a])return;const y=n[a]=n[o];n[o]=function(d,P,v){return P&&P.prototype&&c.forEach(function(m){const A=`${i}.${o}::`+m,N=P.prototype;try{if(N.hasOwnProperty(m)){const M=e.ObjectGetOwnPropertyDescriptor(N,m);M&&M.value?(M.value=e.wrapWithCurrentZone(M.value,A),e._redefineProperty(P.prototype,m,M)):N[m]&&(N[m]=e.wrapWithCurrentZone(N[m],A))}else N[m]&&(N[m]=e.wrapWithCurrentZone(N[m],A))}catch{}}),y.call(n,d,P,v)},e.attachOriginToPatched(n[o],y)}function nt(e,n,i){if(!i||0===i.length)return n;const o=i.filter(a=>a.target===e);if(!o||0===o.length)return n;const c=o[0].ignoreProperties;return n.filter(a=>-1===c.indexOf(a))}function rt(e,n,i,o){e&&Ye(e,nt(e,n,i),o)}function Ue(e){return Object.getOwnPropertyNames(e).filter(n=>n.startsWith("on")&&n.length>2).map(n=>n.substring(2))}Zone.__load_patch("util",(e,n,i)=>{const o=Ue(e);i.patchOnProperties=Ye,i.patchMethod=ge,i.bindArguments=Ce,i.patchMacroTask=lt;const c=n.__symbol__("BLACK_LISTED_EVENTS"),a=n.__symbol__("UNPATCHED_EVENTS");e[a]&&(e[c]=e[a]),e[c]&&(n[c]=n[a]=e[c]),i.patchEventPrototype=_t,i.patchEventTarget=dt,i.isIEOrEdge=ft,i.ObjectDefineProperty=ye,i.ObjectGetOwnPropertyDescriptor=ie,i.ObjectCreate=he,i.ArraySlice=Se,i.patchClass=Ae,i.wrapWithCurrentZone=X,i.filterProperties=nt,i.attachOriginToPatched=ke,i._redefineProperty=Object.defineProperty,i.patchCallbacks=Et,i.getGlobalObjects=()=>({globalSources:$e,zoneSymbolEventNames:ae,eventNames:o,isBrowser:Le,isMix:Oe,isNode:Pe,TRUE_STR:$,FALSE_STR:Q,ZONE_SYMBOL_PREFIX:J,ADD_EVENT_LISTENER_STR:de,REMOVE_EVENT_LISTENER_STR:ve})});const Be=R("zoneTask");function Ne(e,n,i,o){let c=null,a=null;i+=o;const y={};function d(v){const m=v.data;return m.args[0]=function(){return v.invoke.apply(this,arguments)},m.handleId=c.apply(e,m.args),v}function P(v){return a.call(e,v.data.handleId)}c=ge(e,n+=o,v=>function(m,A){if("function"==typeof A[0]){const N={isPeriodic:"Interval"===o,delay:"Timeout"===o||"Interval"===o?A[1]||0:void 0,args:A},M=A[0];A[0]=function(){try{return M.apply(this,arguments)}finally{N.isPeriodic||("number"==typeof N.handleId?delete y[N.handleId]:N.handleId&&(N.handleId[Be]=null))}};const V=ee(n,A[0],N,d,P);if(!V)return V;const H=V.data.handleId;return"number"==typeof H?y[H]=V:H&&(H[Be]=V),H&&H.ref&&H.unref&&"function"==typeof H.ref&&"function"==typeof H.unref&&(V.ref=H.ref.bind(H),V.unref=H.unref.bind(H)),"number"==typeof H||H?H:V}return v.apply(e,A)}),a=ge(e,i,v=>function(m,A){const N=A[0];let M;"number"==typeof N?M=y[N]:(M=N&&N[Be],M||(M=N)),M&&"string"==typeof M.type?"notScheduled"!==M.state&&(M.cancelFn&&M.data.isPeriodic||0===M.runCount)&&("number"==typeof N?delete y[N]:N&&(N[Be]=null),M.zone.cancelTask(M)):v.apply(e,A)})}Zone.__load_patch("legacy",e=>{const n=e[Zone.__symbol__("legacyPatch")];n&&n()}),Zone.__load_patch("queueMicrotask",(e,n,i)=>{i.patchMethod(e,"queueMicrotask",o=>function(c,a){n.current.scheduleMicroTask("queueMicrotask",a[0])})}),Zone.__load_patch("timers",e=>{const n="set",i="clear";Ne(e,n,i,"Timeout"),Ne(e,n,i,"Interval"),Ne(e,n,i,"Immediate")}),Zone.__load_patch("requestAnimationFrame",e=>{Ne(e,"request","cancel","AnimationFrame"),Ne(e,"mozRequest","mozCancel","AnimationFrame"),Ne(e,"webkitRequest","webkitCancel","AnimationFrame")}),Zone.__load_patch("blocking",(e,n)=>{const i=["alert","prompt","confirm"];for(let o=0;o<i.length;o++)ge(e,i[o],(a,y,d)=>function(P,v){return n.current.run(a,e,v,d)})}),Zone.__load_patch("EventTarget",(e,n,i)=>{(function mt(e,n){n.patchEventPrototype(e,n)})(e,i),function pt(e,n){if(Zone[n.symbol("patchEventTarget")])return;const{eventNames:i,zoneSymbolEventNames:o,TRUE_STR:c,FALSE_STR:a,ZONE_SYMBOL_PREFIX:y}=n.getGlobalObjects();for(let P=0;P<i.length;P++){const v=i[P],N=y+(v+a),M=y+(v+c);o[v]={},o[v][a]=N,o[v][c]=M}const d=e.EventTarget;d&&d.prototype&&n.patchEventTarget(e,n,[d&&d.prototype])}(e,i);const o=e.XMLHttpRequestEventTarget;o&&o.prototype&&i.patchEventTarget(e,i,[o.prototype])}),Zone.__load_patch("MutationObserver",(e,n,i)=>{Ae("MutationObserver"),Ae("WebKitMutationObserver")}),Zone.__load_patch("IntersectionObserver",(e,n,i)=>{Ae("IntersectionObserver")}),Zone.__load_patch("FileReader",(e,n,i)=>{Ae("FileReader")}),Zone.__load_patch("on_property",(e,n,i)=>{!function Tt(e,n){if(Pe&&!Oe||Zone[e.symbol("patchEvents")])return;const i=n.__Zone_ignore_on_properties;let o=[];if(Le){const c=window;o=o.concat(["Document","SVGElement","Element","HTMLElement","HTMLBodyElement","HTMLMediaElement","HTMLFrameSetElement","HTMLFrameElement","HTMLIFrameElement","HTMLMarqueeElement","Worker"]);const a=function ut(){try{const e=me.navigator.userAgent;if(-1!==e.indexOf("MSIE ")||-1!==e.indexOf("Trident/"))return!0}catch{}return!1}()?[{target:c,ignoreProperties:["error"]}]:[];rt(c,Ue(c),i&&i.concat(a),le(c))}o=o.concat(["XMLHttpRequest","XMLHttpRequestEventTarget","IDBIndex","IDBRequest","IDBOpenDBRequest","IDBDatabase","IDBTransaction","IDBCursor","WebSocket"]);for(let c=0;c<o.length;c++){const a=n[o[c]];a&&a.prototype&&rt(a.prototype,Ue(a.prototype),i)}}(i,e)}),Zone.__load_patch("customElements",(e,n,i)=>{!function yt(e,n){const{isBrowser:i,isMix:o}=n.getGlobalObjects();(i||o)&&e.customElements&&"customElements"in e&&n.patchCallbacks(n,e.customElements,"customElements","define",["connectedCallback","disconnectedCallback","adoptedCallback","attributeChangedCallback"])}(e,i)}),Zone.__load_patch("XHR",(e,n)=>{!function P(v){const m=v.XMLHttpRequest;if(!m)return;const A=m.prototype;let M=A[pe],V=A[_e];if(!M){const h=v.XMLHttpRequestEventTarget;if(h){const I=h.prototype;M=I[pe],V=I[_e]}}const H="readystatechange",re="scheduled";function q(h){const I=h.data,w=I.target;w[a]=!1,w[d]=!1;const oe=w[c];M||(M=w[pe],V=w[_e]),oe&&V.call(w,H,oe);const Ee=w[c]=()=>{if(w.readyState===w.DONE)if(!I.aborted&&w[a]&&h.state===re){const z=w[n.__symbol__("loadfalse")];if(0!==w.status&&z&&z.length>0){const fe=h.invoke;h.invoke=function(){const se=w[n.__symbol__("loadfalse")];for(let W=0;W<se.length;W++)se[W]===h&&se.splice(W,1);!I.aborted&&h.state===re&&fe.call(h)},z.push(h)}else h.invoke()}else!I.aborted&&!1===w[a]&&(w[d]=!0)};return M.call(w,H,Ee),w[i]||(w[i]=h),p.apply(w,I.args),w[a]=!0,h}function C(){}function _(h){const I=h.data;return I.aborted=!0,B.apply(I.target,I.args)}const ne=ge(A,"open",()=>function(h,I){return h[o]=0==I[2],h[y]=I[1],ne.apply(h,I)}),Y=R("fetchTaskAborting"),j=R("fetchTaskScheduling"),p=ge(A,"send",()=>function(h,I){if(!0===n.current[j]||h[o])return p.apply(h,I);{const w={target:h,url:h[y],isPeriodic:!1,args:I,aborted:!1},oe=ee("XMLHttpRequest.send",C,w,q,_);h&&!0===h[d]&&!w.aborted&&oe.state===re&&oe.invoke()}}),B=ge(A,"abort",()=>function(h,I){const w=function N(h){return h[i]}(h);if(w&&"string"==typeof w.type){if(null==w.cancelFn||w.data&&w.data.aborted)return;w.zone.cancelTask(w)}else if(!0===n.current[Y])return B.apply(h,I)})}(e);const i=R("xhrTask"),o=R("xhrSync"),c=R("xhrListener"),a=R("xhrScheduled"),y=R("xhrURL"),d=R("xhrErrorBeforeScheduled")}),Zone.__load_patch("geolocation",e=>{e.navigator&&e.navigator.geolocation&&function He(e,n){const i=e.constructor.name;for(let o=0;o<n.length;o++){const c=n[o],a=e[c];if(a){if(!Ie(ie(e,c)))continue;e[c]=(d=>{const P=function(){return d.apply(this,Ce(arguments,i+"."+c))};return ke(P,d),P})(a)}}}(e.navigator.geolocation,["getCurrentPosition","watchPosition"])}),Zone.__load_patch("PromiseRejectionEvent",(e,n)=>{function i(o){return function(c){tt(e,o).forEach(y=>{const d=e.PromiseRejectionEvent;if(d){const P=new d(o,{promise:c.promise,reason:c.rejection});y.invoke(P)}})}}e.PromiseRejectionEvent&&(n[R("unhandledPromiseRejectionHandler")]=i("unhandledrejection"),n[R("rejectionHandledHandler")]=i("rejectionhandled"))})}},ie=>{ie(ie.s=435)}]);