import{P as g,i as I,E as b,r as U,T as k,U as X,a as R,w as m,e as M,C as B}from"./index-5ef7ee66.js";import"./init-576ee8b3.js";class T{constructor(e){this.bubbles=!0,this.cancelBubble=!0,this.cancelable=!1,this.composed=!1,this.defaultPrevented=!1,this.eventPhase=T.prototype.NONE,this.propagationStopped=!1,this.propagationImmediatelyStopped=!1,this.layer=new g,this.page=new g,this.NONE=0,this.CAPTURING_PHASE=1,this.AT_TARGET=2,this.BUBBLING_PHASE=3,this.manager=e}get layerX(){return this.layer.x}get layerY(){return this.layer.y}get pageX(){return this.page.x}get pageY(){return this.page.y}get data(){return this}composedPath(){return this.manager&&(!this.path||this.path[this.path.length-1]!==this.target)&&(this.path=this.target?this.manager.propagationPath(this.target):[]),this.path}initEvent(e,t,i){throw new Error("initEvent() is a legacy DOM API. It is not implemented in the Federated Events API.")}initUIEvent(e,t,i,s,n){throw new Error("initUIEvent() is a legacy DOM API. It is not implemented in the Federated Events API.")}preventDefault(){this.nativeEvent instanceof Event&&this.nativeEvent.cancelable&&this.nativeEvent.preventDefault(),this.defaultPrevented=!0}stopImmediatePropagation(){this.propagationImmediatelyStopped=!0}stopPropagation(){this.propagationStopped=!0}}const Y=I.default??I,H=Y(globalThis.navigator),F=9,P=100,N=0,K=0,x=2,L=1,$=-1e3,j=-1e3,G=2,D=class C{constructor(e,t=H){this._mobileInfo=t,this.debug=!1,this._activateOnTab=!0,this._deactivateOnMouseMove=!0,this._isActive=!1,this._isMobileAccessibility=!1,this._div=null,this._pool=[],this._renderId=0,this._children=[],this._androidUpdateCount=0,this._androidUpdateFrequency=500,this._hookDiv=null,(t.tablet||t.phone)&&this._createTouchHook(),this._renderer=e}get isActive(){return this._isActive}get isMobileAccessibility(){return this._isMobileAccessibility}get hookDiv(){return this._hookDiv}_createTouchHook(){const e=document.createElement("button");e.style.width=`${L}px`,e.style.height=`${L}px`,e.style.position="absolute",e.style.top=`${$}px`,e.style.left=`${j}px`,e.style.zIndex=G.toString(),e.style.backgroundColor="#FF0000",e.title="select to enable accessibility for this content",e.addEventListener("focus",()=>{this._isMobileAccessibility=!0,this._activate(),this._destroyTouchHook()}),document.body.appendChild(e),this._hookDiv=e}_destroyTouchHook(){this._hookDiv&&(document.body.removeChild(this._hookDiv),this._hookDiv=null)}_activate(){if(this._isActive)return;this._isActive=!0,this._div||(this._div=document.createElement("div"),this._div.style.width=`${P}px`,this._div.style.height=`${P}px`,this._div.style.position="absolute",this._div.style.top=`${N}px`,this._div.style.left=`${K}px`,this._div.style.zIndex=x.toString(),this._div.style.pointerEvents="none"),this._activateOnTab&&(this._onKeyDown=this._onKeyDown.bind(this),globalThis.addEventListener("keydown",this._onKeyDown,!1)),this._deactivateOnMouseMove&&(this._onMouseMove=this._onMouseMove.bind(this),globalThis.document.addEventListener("mousemove",this._onMouseMove,!0));const e=this._renderer.view.canvas;if(e.parentNode)e.parentNode.appendChild(this._div),this._initAccessibilitySetup();else{const t=new MutationObserver(()=>{e.parentNode&&(e.parentNode.appendChild(this._div),t.disconnect(),this._initAccessibilitySetup())});t.observe(document.body,{childList:!0,subtree:!0})}}_initAccessibilitySetup(){this._renderer.runners.postrender.add(this),this._renderer.lastObjectRendered&&this._updateAccessibleObjects(this._renderer.lastObjectRendered)}_deactivate(){if(!(!this._isActive||this._isMobileAccessibility)){this._isActive=!1,globalThis.document.removeEventListener("mousemove",this._onMouseMove,!0),this._activateOnTab&&globalThis.addEventListener("keydown",this._onKeyDown,!1),this._renderer.runners.postrender.remove(this);for(const e of this._children)e._accessibleDiv&&e._accessibleDiv.parentNode&&(e._accessibleDiv.parentNode.removeChild(e._accessibleDiv),e._accessibleDiv=null),e._accessibleActive=!1;this._pool.forEach(e=>{e.parentNode&&e.parentNode.removeChild(e)}),this._div&&this._div.parentNode&&this._div.parentNode.removeChild(this._div),this._pool=[],this._children=[]}}_updateAccessibleObjects(e){if(!e.visible||!e.accessibleChildren)return;e.accessible&&(e._accessibleActive||this._addChild(e),e._renderId=this._renderId);const t=e.children;if(t)for(let i=0;i<t.length;i++)this._updateAccessibleObjects(t[i])}init(e){const i={accessibilityOptions:{...C.defaultOptions,...(e==null?void 0:e.accessibilityOptions)||{}}};this.debug=i.accessibilityOptions.debug,this._activateOnTab=i.accessibilityOptions.activateOnTab,this._deactivateOnMouseMove=i.accessibilityOptions.deactivateOnMouseMove,i.accessibilityOptions.enabledByDefault?this._activate():this._activateOnTab&&(this._onKeyDown=this._onKeyDown.bind(this),globalThis.addEventListener("keydown",this._onKeyDown,!1)),this._renderer.runners.postrender.remove(this)}postrender(){const e=performance.now();if(this._mobileInfo.android.device&&e<this._androidUpdateCount||(this._androidUpdateCount=e+this._androidUpdateFrequency,!this._renderer.renderingToScreen||!this._renderer.view.canvas))return;const t=new Set;if(this._renderer.lastObjectRendered){this._updateAccessibleObjects(this._renderer.lastObjectRendered);for(const i of this._children)i._renderId===this._renderId&&t.add(this._children.indexOf(i))}for(let i=this._children.length-1;i>=0;i--){const s=this._children[i];t.has(i)||(s._accessibleDiv&&s._accessibleDiv.parentNode&&(s._accessibleDiv.parentNode.removeChild(s._accessibleDiv),this._pool.push(s._accessibleDiv),s._accessibleDiv=null),s._accessibleActive=!1,U(this._children,i,1))}if(this._renderer.renderingToScreen){const{x:i,y:s,width:n,height:o}=this._renderer.screen,r=this._div;r.style.left=`${i}px`,r.style.top=`${s}px`,r.style.width=`${n}px`,r.style.height=`${o}px`}for(let i=0;i<this._children.length;i++){const s=this._children[i];if(!s._accessibleActive||!s._accessibleDiv)continue;const n=s._accessibleDiv,o=s.hitArea||s.getBounds().rectangle;if(s.hitArea){const r=s.worldTransform,l=this._renderer.resolution,u=this._renderer.resolution;n.style.left=`${(r.tx+o.x*r.a)*l}px`,n.style.top=`${(r.ty+o.y*r.d)*u}px`,n.style.width=`${o.width*r.a*l}px`,n.style.height=`${o.height*r.d*u}px`}else{this._capHitArea(o);const r=this._renderer.resolution,l=this._renderer.resolution;n.style.left=`${o.x*r}px`,n.style.top=`${o.y*l}px`,n.style.width=`${o.width*r}px`,n.style.height=`${o.height*l}px`}}this._renderId++}_updateDebugHTML(e){e.innerHTML=`type: ${e.type}</br> title : ${e.title}</br> tabIndex: ${e.tabIndex}`}_capHitArea(e){e.x<0&&(e.width+=e.x,e.x=0),e.y<0&&(e.height+=e.y,e.y=0);const{width:t,height:i}=this._renderer;e.x+e.width>t&&(e.width=t-e.x),e.y+e.height>i&&(e.height=i-e.y)}_addChild(e){let t=this._pool.pop();t||(e.accessibleType==="button"?t=document.createElement("button"):(t=document.createElement(e.accessibleType),t.style.cssText=`
                        color: transparent;
                        pointer-events: none;
                        padding: 0;
                        margin: 0;
                        border: 0;
                        outline: 0;
                        background: transparent;
                        box-sizing: border-box;
                        user-select: none;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                    `,e.accessibleText&&(t.innerText=e.accessibleText)),t.style.width=`${P}px`,t.style.height=`${P}px`,t.style.backgroundColor=this.debug?"rgba(255,255,255,0.5)":"transparent",t.style.position="absolute",t.style.zIndex=x.toString(),t.style.borderStyle="none",navigator.userAgent.toLowerCase().includes("chrome")?t.setAttribute("aria-live","off"):t.setAttribute("aria-live","polite"),navigator.userAgent.match(/rv:.*Gecko\//)?t.setAttribute("aria-relevant","additions"):t.setAttribute("aria-relevant","text"),t.addEventListener("click",this._onClick.bind(this)),t.addEventListener("focus",this._onFocus.bind(this)),t.addEventListener("focusout",this._onFocusOut.bind(this))),t.style.pointerEvents=e.accessiblePointerEvents,t.type=e.accessibleType,e.accessibleTitle&&e.accessibleTitle!==null?t.title=e.accessibleTitle:(!e.accessibleHint||e.accessibleHint===null)&&(t.title=`container ${e.tabIndex}`),e.accessibleHint&&e.accessibleHint!==null&&t.setAttribute("aria-label",e.accessibleHint),this.debug&&this._updateDebugHTML(t),e._accessibleActive=!0,e._accessibleDiv=t,t.container=e,this._children.push(e),this._div.appendChild(e._accessibleDiv),e.interactive&&(e._accessibleDiv.tabIndex=e.tabIndex)}_dispatchEvent(e,t){const{container:i}=e.target,s=this._renderer.events.rootBoundary,n=Object.assign(new T(s),{target:i});s.rootTarget=this._renderer.lastObjectRendered,t.forEach(o=>s.dispatchEvent(n,o))}_onClick(e){this._dispatchEvent(e,["click","pointertap","tap"])}_onFocus(e){e.target.getAttribute("aria-live")||e.target.setAttribute("aria-live","assertive"),this._dispatchEvent(e,["mouseover"])}_onFocusOut(e){e.target.getAttribute("aria-live")||e.target.setAttribute("aria-live","polite"),this._dispatchEvent(e,["mouseout"])}_onKeyDown(e){e.keyCode!==F||!this._activateOnTab||this._activate()}_onMouseMove(e){e.movementX===0&&e.movementY===0||this._deactivate()}destroy(){this._deactivate(),this._destroyTouchHook(),this._div=null,this._pool=null,this._children=null,this._renderer=null,this._activateOnTab&&globalThis.removeEventListener("keydown",this._onKeyDown)}setAccessibilityEnabled(e){e?this._activate():this._deactivate()}};D.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"accessibility"};D.defaultOptions={enabledByDefault:!1,debug:!1,activateOnTab:!0,deactivateOnMouseMove:!0};let W=D;const z={accessible:!1,accessibleTitle:null,accessibleHint:null,tabIndex:0,_accessibleActive:!1,_accessibleDiv:null,accessibleType:"button",accessibleText:null,accessiblePointerEvents:"auto",accessibleChildren:!0,_renderId:-1};class Z{constructor(){this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}init(e){this.removeTickerListener(),this.events=e,this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}get pauseUpdate(){return this._pauseUpdate}set pauseUpdate(e){this._pauseUpdate=e}addTickerListener(){this._tickerAdded||!this.domElement||(k.system.add(this._tickerUpdate,this,X.INTERACTION),this._tickerAdded=!0)}removeTickerListener(){this._tickerAdded&&(k.system.remove(this._tickerUpdate,this),this._tickerAdded=!1)}pointerMoved(){this._didMove=!0}_update(){if(!this.domElement||this._pauseUpdate)return;if(this._didMove){this._didMove=!1;return}const e=this.events._rootPointerEvent;this.events.supportsTouchEvents&&e.pointerType==="touch"||globalThis.document.dispatchEvent(new PointerEvent("pointermove",{clientX:e.clientX,clientY:e.clientY,pointerType:e.pointerType,pointerId:e.pointerId}))}_tickerUpdate(e){this._deltaTime+=e.deltaTime,!(this._deltaTime<this.interactionFrequency)&&(this._deltaTime=0,this._update())}}const y=new Z;class w extends T{constructor(){super(...arguments),this.client=new g,this.movement=new g,this.offset=new g,this.global=new g,this.screen=new g}get clientX(){return this.client.x}get clientY(){return this.client.y}get x(){return this.clientX}get y(){return this.clientY}get movementX(){return this.movement.x}get movementY(){return this.movement.y}get offsetX(){return this.offset.x}get offsetY(){return this.offset.y}get globalX(){return this.global.x}get globalY(){return this.global.y}get screenX(){return this.screen.x}get screenY(){return this.screen.y}getLocalPosition(e,t,i){return e.worldTransform.applyInverse(i||this.global,t)}getModifierState(e){return"getModifierState"in this.nativeEvent&&this.nativeEvent.getModifierState(e)}initMouseEvent(e,t,i,s,n,o,r,l,u,p,d,a,v,c,ie){throw new Error("Method not implemented.")}}class f extends w{constructor(){super(...arguments),this.width=0,this.height=0,this.isPrimary=!1}getCoalescedEvents(){return this.type==="pointermove"||this.type==="mousemove"||this.type==="touchmove"?[this]:[]}getPredictedEvents(){throw new Error("getPredictedEvents is not supported!")}}class _ extends w{constructor(){super(...arguments),this.DOM_DELTA_PIXEL=0,this.DOM_DELTA_LINE=1,this.DOM_DELTA_PAGE=2}}_.DOM_DELTA_PIXEL=0;_.DOM_DELTA_LINE=1;_.DOM_DELTA_PAGE=2;const V=2048,q=new g,E=new g;class J{constructor(e){this.dispatch=new R,this.moveOnAll=!1,this.enableGlobalMoveEvents=!0,this.mappingState={trackingData:{}},this.eventPool=new Map,this._allInteractiveElements=[],this._hitElements=[],this._isPointerMoveEvent=!1,this.rootTarget=e,this.hitPruneFn=this.hitPruneFn.bind(this),this.hitTestFn=this.hitTestFn.bind(this),this.mapPointerDown=this.mapPointerDown.bind(this),this.mapPointerMove=this.mapPointerMove.bind(this),this.mapPointerOut=this.mapPointerOut.bind(this),this.mapPointerOver=this.mapPointerOver.bind(this),this.mapPointerUp=this.mapPointerUp.bind(this),this.mapPointerUpOutside=this.mapPointerUpOutside.bind(this),this.mapWheel=this.mapWheel.bind(this),this.mappingTable={},this.addEventMapping("pointerdown",this.mapPointerDown),this.addEventMapping("pointermove",this.mapPointerMove),this.addEventMapping("pointerout",this.mapPointerOut),this.addEventMapping("pointerleave",this.mapPointerOut),this.addEventMapping("pointerover",this.mapPointerOver),this.addEventMapping("pointerup",this.mapPointerUp),this.addEventMapping("pointerupoutside",this.mapPointerUpOutside),this.addEventMapping("wheel",this.mapWheel)}addEventMapping(e,t){this.mappingTable[e]||(this.mappingTable[e]=[]),this.mappingTable[e].push({fn:t,priority:0}),this.mappingTable[e].sort((i,s)=>i.priority-s.priority)}dispatchEvent(e,t){e.propagationStopped=!1,e.propagationImmediatelyStopped=!1,this.propagate(e,t),this.dispatch.emit(t||e.type,e)}mapEvent(e){if(!this.rootTarget)return;const t=this.mappingTable[e.type];if(t)for(let i=0,s=t.length;i<s;i++)t[i].fn(e);else m(`[EventBoundary]: Event mapping not defined for ${e.type}`)}hitTest(e,t){y.pauseUpdate=!0;const s=this._isPointerMoveEvent&&this.enableGlobalMoveEvents?"hitTestMoveRecursive":"hitTestRecursive",n=this[s](this.rootTarget,this.rootTarget.eventMode,q.set(e,t),this.hitTestFn,this.hitPruneFn);return n&&n[0]}propagate(e,t){if(!e.target)return;const i=e.composedPath();e.eventPhase=e.CAPTURING_PHASE;for(let s=0,n=i.length-1;s<n;s++)if(e.currentTarget=i[s],this.notifyTarget(e,t),e.propagationStopped||e.propagationImmediatelyStopped)return;if(e.eventPhase=e.AT_TARGET,e.currentTarget=e.target,this.notifyTarget(e,t),!(e.propagationStopped||e.propagationImmediatelyStopped)){e.eventPhase=e.BUBBLING_PHASE;for(let s=i.length-2;s>=0;s--)if(e.currentTarget=i[s],this.notifyTarget(e,t),e.propagationStopped||e.propagationImmediatelyStopped)return}}all(e,t,i=this._allInteractiveElements){if(i.length===0)return;e.eventPhase=e.BUBBLING_PHASE;const s=Array.isArray(t)?t:[t];for(let n=i.length-1;n>=0;n--)s.forEach(o=>{e.currentTarget=i[n],this.notifyTarget(e,o)})}propagationPath(e){const t=[e];for(let i=0;i<V&&e!==this.rootTarget&&e.parent;i++){if(!e.parent)throw new Error("Cannot find propagation path to disconnected target");t.push(e.parent),e=e.parent}return t.reverse(),t}hitTestMoveRecursive(e,t,i,s,n,o=!1){let r=!1;if(this._interactivePrune(e))return null;if((e.eventMode==="dynamic"||t==="dynamic")&&(y.pauseUpdate=!1),e.interactiveChildren&&e.children){const p=e.children;for(let d=p.length-1;d>=0;d--){const a=p[d],v=this.hitTestMoveRecursive(a,this._isInteractive(t)?t:a.eventMode,i,s,n,o||n(e,i));if(v){if(v.length>0&&!v[v.length-1].parent)continue;const c=e.isInteractive();(v.length>0||c)&&(c&&this._allInteractiveElements.push(e),v.push(e)),this._hitElements.length===0&&(this._hitElements=v),r=!0}}}const l=this._isInteractive(t),u=e.isInteractive();return u&&u&&this._allInteractiveElements.push(e),o||this._hitElements.length>0?null:r?this._hitElements:l&&!n(e,i)&&s(e,i)?u?[e]:[]:null}hitTestRecursive(e,t,i,s,n){if(this._interactivePrune(e)||n(e,i))return null;if((e.eventMode==="dynamic"||t==="dynamic")&&(y.pauseUpdate=!1),e.interactiveChildren&&e.children){const l=e.children,u=i;for(let p=l.length-1;p>=0;p--){const d=l[p],a=this.hitTestRecursive(d,this._isInteractive(t)?t:d.eventMode,u,s,n);if(a){if(a.length>0&&!a[a.length-1].parent)continue;const v=e.isInteractive();return(a.length>0||v)&&a.push(e),a}}}const o=this._isInteractive(t),r=e.isInteractive();return o&&s(e,i)?r?[e]:[]:null}_isInteractive(e){return e==="static"||e==="dynamic"}_interactivePrune(e){return!e||!e.visible||!e.renderable||!e.measurable||e.eventMode==="none"||e.eventMode==="passive"&&!e.interactiveChildren}hitPruneFn(e,t){if(e.hitArea&&(e.worldTransform.applyInverse(t,E),!e.hitArea.contains(E.x,E.y)))return!0;if(e.effects&&e.effects.length)for(let i=0;i<e.effects.length;i++){const s=e.effects[i];if(s.containsPoint&&!s.containsPoint(t,this.hitTestFn))return!0}return!1}hitTestFn(e,t){return e.hitArea?!0:e!=null&&e.containsPoint?(e.worldTransform.applyInverse(t,E),e.containsPoint(E)):!1}notifyTarget(e,t){var n,o;if(!e.currentTarget.isInteractive())return;t??(t=e.type);const i=`on${t}`;(o=(n=e.currentTarget)[i])==null||o.call(n,e);const s=e.eventPhase===e.CAPTURING_PHASE||e.eventPhase===e.AT_TARGET?`${t}capture`:t;this._notifyListeners(e,s),e.eventPhase===e.AT_TARGET&&this._notifyListeners(e,t)}mapPointerDown(e){if(!(e instanceof f)){m("EventBoundary cannot map a non-pointer event as a pointer event");return}const t=this.createPointerEvent(e);if(this.dispatchEvent(t,"pointerdown"),t.pointerType==="touch")this.dispatchEvent(t,"touchstart");else if(t.pointerType==="mouse"||t.pointerType==="pen"){const s=t.button===2;this.dispatchEvent(t,s?"rightdown":"mousedown")}const i=this.trackingData(e.pointerId);i.pressTargetsByButton[e.button]=t.composedPath(),this.freeEvent(t)}mapPointerMove(e){var l,u;if(!(e instanceof f)){m("EventBoundary cannot map a non-pointer event as a pointer event");return}this._allInteractiveElements.length=0,this._hitElements.length=0,this._isPointerMoveEvent=!0;const t=this.createPointerEvent(e);this._isPointerMoveEvent=!1;const i=t.pointerType==="mouse"||t.pointerType==="pen",s=this.trackingData(e.pointerId),n=this.findMountedTarget(s.overTargets);if(((l=s.overTargets)==null?void 0:l.length)>0&&n!==t.target){const p=e.type==="mousemove"?"mouseout":"pointerout",d=this.createPointerEvent(e,p,n);if(this.dispatchEvent(d,"pointerout"),i&&this.dispatchEvent(d,"mouseout"),!t.composedPath().includes(n)){const a=this.createPointerEvent(e,"pointerleave",n);for(a.eventPhase=a.AT_TARGET;a.target&&!t.composedPath().includes(a.target);)a.currentTarget=a.target,this.notifyTarget(a),i&&this.notifyTarget(a,"mouseleave"),a.target=a.target.parent;this.freeEvent(a)}this.freeEvent(d)}if(n!==t.target){const p=e.type==="mousemove"?"mouseover":"pointerover",d=this.clonePointerEvent(t,p);this.dispatchEvent(d,"pointerover"),i&&this.dispatchEvent(d,"mouseover");let a=n==null?void 0:n.parent;for(;a&&a!==this.rootTarget.parent&&a!==t.target;)a=a.parent;if(!a||a===this.rootTarget.parent){const c=this.clonePointerEvent(t,"pointerenter");for(c.eventPhase=c.AT_TARGET;c.target&&c.target!==n&&c.target!==this.rootTarget.parent;)c.currentTarget=c.target,this.notifyTarget(c),i&&this.notifyTarget(c,"mouseenter"),c.target=c.target.parent;this.freeEvent(c)}this.freeEvent(d)}const o=[],r=this.enableGlobalMoveEvents??!0;this.moveOnAll?o.push("pointermove"):this.dispatchEvent(t,"pointermove"),r&&o.push("globalpointermove"),t.pointerType==="touch"&&(this.moveOnAll?o.splice(1,0,"touchmove"):this.dispatchEvent(t,"touchmove"),r&&o.push("globaltouchmove")),i&&(this.moveOnAll?o.splice(1,0,"mousemove"):this.dispatchEvent(t,"mousemove"),r&&o.push("globalmousemove"),this.cursor=(u=t.target)==null?void 0:u.cursor),o.length>0&&this.all(t,o),this._allInteractiveElements.length=0,this._hitElements.length=0,s.overTargets=t.composedPath(),this.freeEvent(t)}mapPointerOver(e){var o;if(!(e instanceof f)){m("EventBoundary cannot map a non-pointer event as a pointer event");return}const t=this.trackingData(e.pointerId),i=this.createPointerEvent(e),s=i.pointerType==="mouse"||i.pointerType==="pen";this.dispatchEvent(i,"pointerover"),s&&this.dispatchEvent(i,"mouseover"),i.pointerType==="mouse"&&(this.cursor=(o=i.target)==null?void 0:o.cursor);const n=this.clonePointerEvent(i,"pointerenter");for(n.eventPhase=n.AT_TARGET;n.target&&n.target!==this.rootTarget.parent;)n.currentTarget=n.target,this.notifyTarget(n),s&&this.notifyTarget(n,"mouseenter"),n.target=n.target.parent;t.overTargets=i.composedPath(),this.freeEvent(i),this.freeEvent(n)}mapPointerOut(e){if(!(e instanceof f)){m("EventBoundary cannot map a non-pointer event as a pointer event");return}const t=this.trackingData(e.pointerId);if(t.overTargets){const i=e.pointerType==="mouse"||e.pointerType==="pen",s=this.findMountedTarget(t.overTargets),n=this.createPointerEvent(e,"pointerout",s);this.dispatchEvent(n),i&&this.dispatchEvent(n,"mouseout");const o=this.createPointerEvent(e,"pointerleave",s);for(o.eventPhase=o.AT_TARGET;o.target&&o.target!==this.rootTarget.parent;)o.currentTarget=o.target,this.notifyTarget(o),i&&this.notifyTarget(o,"mouseleave"),o.target=o.target.parent;t.overTargets=null,this.freeEvent(n),this.freeEvent(o)}this.cursor=null}mapPointerUp(e){if(!(e instanceof f)){m("EventBoundary cannot map a non-pointer event as a pointer event");return}const t=performance.now(),i=this.createPointerEvent(e);if(this.dispatchEvent(i,"pointerup"),i.pointerType==="touch")this.dispatchEvent(i,"touchend");else if(i.pointerType==="mouse"||i.pointerType==="pen"){const r=i.button===2;this.dispatchEvent(i,r?"rightup":"mouseup")}const s=this.trackingData(e.pointerId),n=this.findMountedTarget(s.pressTargetsByButton[e.button]);let o=n;if(n&&!i.composedPath().includes(n)){let r=n;for(;r&&!i.composedPath().includes(r);){if(i.currentTarget=r,this.notifyTarget(i,"pointerupoutside"),i.pointerType==="touch")this.notifyTarget(i,"touchendoutside");else if(i.pointerType==="mouse"||i.pointerType==="pen"){const l=i.button===2;this.notifyTarget(i,l?"rightupoutside":"mouseupoutside")}r=r.parent}delete s.pressTargetsByButton[e.button],o=r}if(o){const r=this.clonePointerEvent(i,"click");r.target=o,r.path=null,s.clicksByButton[e.button]||(s.clicksByButton[e.button]={clickCount:0,target:r.target,timeStamp:t});const l=s.clicksByButton[e.button];if(l.target===r.target&&t-l.timeStamp<200?++l.clickCount:l.clickCount=1,l.target=r.target,l.timeStamp=t,r.detail=l.clickCount,r.pointerType==="mouse"){const u=r.button===2;this.dispatchEvent(r,u?"rightclick":"click")}else r.pointerType==="touch"&&this.dispatchEvent(r,"tap");this.dispatchEvent(r,"pointertap"),this.freeEvent(r)}this.freeEvent(i)}mapPointerUpOutside(e){if(!(e instanceof f)){m("EventBoundary cannot map a non-pointer event as a pointer event");return}const t=this.trackingData(e.pointerId),i=this.findMountedTarget(t.pressTargetsByButton[e.button]),s=this.createPointerEvent(e);if(i){let n=i;for(;n;)s.currentTarget=n,this.notifyTarget(s,"pointerupoutside"),s.pointerType==="touch"?this.notifyTarget(s,"touchendoutside"):(s.pointerType==="mouse"||s.pointerType==="pen")&&this.notifyTarget(s,s.button===2?"rightupoutside":"mouseupoutside"),n=n.parent;delete t.pressTargetsByButton[e.button]}this.freeEvent(s)}mapWheel(e){if(!(e instanceof _)){m("EventBoundary cannot map a non-wheel event as a wheel event");return}const t=this.createWheelEvent(e);this.dispatchEvent(t),this.freeEvent(t)}findMountedTarget(e){if(!e)return null;let t=e[0];for(let i=1;i<e.length&&e[i].parent===t;i++)t=e[i];return t}createPointerEvent(e,t,i){const s=this.allocateEvent(f);return this.copyPointerData(e,s),this.copyMouseData(e,s),this.copyData(e,s),s.nativeEvent=e.nativeEvent,s.originalEvent=e,s.target=i??this.hitTest(s.global.x,s.global.y)??this._hitElements[0],typeof t=="string"&&(s.type=t),s}createWheelEvent(e){const t=this.allocateEvent(_);return this.copyWheelData(e,t),this.copyMouseData(e,t),this.copyData(e,t),t.nativeEvent=e.nativeEvent,t.originalEvent=e,t.target=this.hitTest(t.global.x,t.global.y),t}clonePointerEvent(e,t){const i=this.allocateEvent(f);return i.nativeEvent=e.nativeEvent,i.originalEvent=e.originalEvent,this.copyPointerData(e,i),this.copyMouseData(e,i),this.copyData(e,i),i.target=e.target,i.path=e.composedPath().slice(),i.type=t??i.type,i}copyWheelData(e,t){t.deltaMode=e.deltaMode,t.deltaX=e.deltaX,t.deltaY=e.deltaY,t.deltaZ=e.deltaZ}copyPointerData(e,t){e instanceof f&&t instanceof f&&(t.pointerId=e.pointerId,t.width=e.width,t.height=e.height,t.isPrimary=e.isPrimary,t.pointerType=e.pointerType,t.pressure=e.pressure,t.tangentialPressure=e.tangentialPressure,t.tiltX=e.tiltX,t.tiltY=e.tiltY,t.twist=e.twist)}copyMouseData(e,t){e instanceof w&&t instanceof w&&(t.altKey=e.altKey,t.button=e.button,t.buttons=e.buttons,t.client.copyFrom(e.client),t.ctrlKey=e.ctrlKey,t.metaKey=e.metaKey,t.movement.copyFrom(e.movement),t.screen.copyFrom(e.screen),t.shiftKey=e.shiftKey,t.global.copyFrom(e.global))}copyData(e,t){t.isTrusted=e.isTrusted,t.srcElement=e.srcElement,t.timeStamp=performance.now(),t.type=e.type,t.detail=e.detail,t.view=e.view,t.which=e.which,t.layer.copyFrom(e.layer),t.page.copyFrom(e.page)}trackingData(e){return this.mappingState.trackingData[e]||(this.mappingState.trackingData[e]={pressTargetsByButton:{},clicksByButton:{},overTarget:null}),this.mappingState.trackingData[e]}allocateEvent(e){this.eventPool.has(e)||this.eventPool.set(e,[]);const t=this.eventPool.get(e).pop()||new e(this);return t.eventPhase=t.NONE,t.currentTarget=null,t.defaultPrevented=!1,t.path=null,t.target=null,t}freeEvent(e){if(e.manager!==this)throw new Error("It is illegal to free an event not managed by this EventBoundary!");const t=e.constructor;this.eventPool.has(t)||this.eventPool.set(t,[]),this.eventPool.get(t).push(e)}_notifyListeners(e,t){const i=e.currentTarget._events[t];if(i)if("fn"in i)i.once&&e.currentTarget.removeListener(t,i.fn,void 0,!0),i.fn.call(i.context,e);else for(let s=0,n=i.length;s<n&&!e.propagationImmediatelyStopped;s++)i[s].once&&e.currentTarget.removeListener(t,i[s].fn,void 0,!0),i[s].fn.call(i[s].context,e)}}const Q=1,ee={touchstart:"pointerdown",touchend:"pointerup",touchendoutside:"pointerupoutside",touchmove:"pointermove",touchcancel:"pointercancel"},A=class O{constructor(e){this.supportsTouchEvents="ontouchstart"in globalThis,this.supportsPointerEvents=!!globalThis.PointerEvent,this.domElement=null,this.resolution=1,this.renderer=e,this.rootBoundary=new J(null),y.init(this),this.autoPreventDefault=!0,this._eventsAdded=!1,this._rootPointerEvent=new f(null),this._rootWheelEvent=new _(null),this.cursorStyles={default:"inherit",pointer:"pointer"},this.features=new Proxy({...O.defaultEventFeatures},{set:(t,i,s)=>(i==="globalMove"&&(this.rootBoundary.enableGlobalMoveEvents=s),t[i]=s,!0)}),this._onPointerDown=this._onPointerDown.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._onPointerUp=this._onPointerUp.bind(this),this._onPointerOverOut=this._onPointerOverOut.bind(this),this.onWheel=this.onWheel.bind(this)}static get defaultEventMode(){return this._defaultEventMode}init(e){const{canvas:t,resolution:i}=this.renderer;this.setTargetElement(t),this.resolution=i,O._defaultEventMode=e.eventMode??"passive",Object.assign(this.features,e.eventFeatures??{}),this.rootBoundary.enableGlobalMoveEvents=this.features.globalMove}resolutionChange(e){this.resolution=e}destroy(){this.setTargetElement(null),this.renderer=null,this._currentCursor=null}setCursor(e){e||(e="default");let t=!0;if(globalThis.OffscreenCanvas&&this.domElement instanceof OffscreenCanvas&&(t=!1),this._currentCursor===e)return;this._currentCursor=e;const i=this.cursorStyles[e];if(i)switch(typeof i){case"string":t&&(this.domElement.style.cursor=i);break;case"function":i(e);break;case"object":t&&Object.assign(this.domElement.style,i);break}else t&&typeof e=="string"&&!Object.prototype.hasOwnProperty.call(this.cursorStyles,e)&&(this.domElement.style.cursor=e)}get pointer(){return this._rootPointerEvent}_onPointerDown(e){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;const t=this._normalizeToPointerData(e);this.autoPreventDefault&&t[0].isNormalized&&(e.cancelable||!("cancelable"in e))&&e.preventDefault();for(let i=0,s=t.length;i<s;i++){const n=t[i],o=this._bootstrapEvent(this._rootPointerEvent,n);this.rootBoundary.mapEvent(o)}this.setCursor(this.rootBoundary.cursor)}_onPointerMove(e){if(!this.features.move)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,y.pointerMoved();const t=this._normalizeToPointerData(e);for(let i=0,s=t.length;i<s;i++){const n=this._bootstrapEvent(this._rootPointerEvent,t[i]);this.rootBoundary.mapEvent(n)}this.setCursor(this.rootBoundary.cursor)}_onPointerUp(e){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let t=e.target;e.composedPath&&e.composedPath().length>0&&(t=e.composedPath()[0]);const i=t!==this.domElement?"outside":"",s=this._normalizeToPointerData(e);for(let n=0,o=s.length;n<o;n++){const r=this._bootstrapEvent(this._rootPointerEvent,s[n]);r.type+=i,this.rootBoundary.mapEvent(r)}this.setCursor(this.rootBoundary.cursor)}_onPointerOverOut(e){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;const t=this._normalizeToPointerData(e);for(let i=0,s=t.length;i<s;i++){const n=this._bootstrapEvent(this._rootPointerEvent,t[i]);this.rootBoundary.mapEvent(n)}this.setCursor(this.rootBoundary.cursor)}onWheel(e){if(!this.features.wheel)return;const t=this.normalizeWheelEvent(e);this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,this.rootBoundary.mapEvent(t)}setTargetElement(e){this._removeEvents(),this.domElement=e,y.domElement=e,this._addEvents()}_addEvents(){if(this._eventsAdded||!this.domElement)return;y.addTickerListener();const e=this.domElement.style;e&&(globalThis.navigator.msPointerEnabled?(e.msContentZooming="none",e.msTouchAction="none"):this.supportsPointerEvents&&(e.touchAction="none")),this.supportsPointerEvents?(globalThis.document.addEventListener("pointermove",this._onPointerMove,!0),this.domElement.addEventListener("pointerdown",this._onPointerDown,!0),this.domElement.addEventListener("pointerleave",this._onPointerOverOut,!0),this.domElement.addEventListener("pointerover",this._onPointerOverOut,!0),globalThis.addEventListener("pointerup",this._onPointerUp,!0)):(globalThis.document.addEventListener("mousemove",this._onPointerMove,!0),this.domElement.addEventListener("mousedown",this._onPointerDown,!0),this.domElement.addEventListener("mouseout",this._onPointerOverOut,!0),this.domElement.addEventListener("mouseover",this._onPointerOverOut,!0),globalThis.addEventListener("mouseup",this._onPointerUp,!0),this.supportsTouchEvents&&(this.domElement.addEventListener("touchstart",this._onPointerDown,!0),this.domElement.addEventListener("touchend",this._onPointerUp,!0),this.domElement.addEventListener("touchmove",this._onPointerMove,!0))),this.domElement.addEventListener("wheel",this.onWheel,{passive:!0,capture:!0}),this._eventsAdded=!0}_removeEvents(){if(!this._eventsAdded||!this.domElement)return;y.removeTickerListener();const e=this.domElement.style;e&&(globalThis.navigator.msPointerEnabled?(e.msContentZooming="",e.msTouchAction=""):this.supportsPointerEvents&&(e.touchAction="")),this.supportsPointerEvents?(globalThis.document.removeEventListener("pointermove",this._onPointerMove,!0),this.domElement.removeEventListener("pointerdown",this._onPointerDown,!0),this.domElement.removeEventListener("pointerleave",this._onPointerOverOut,!0),this.domElement.removeEventListener("pointerover",this._onPointerOverOut,!0),globalThis.removeEventListener("pointerup",this._onPointerUp,!0)):(globalThis.document.removeEventListener("mousemove",this._onPointerMove,!0),this.domElement.removeEventListener("mousedown",this._onPointerDown,!0),this.domElement.removeEventListener("mouseout",this._onPointerOverOut,!0),this.domElement.removeEventListener("mouseover",this._onPointerOverOut,!0),globalThis.removeEventListener("mouseup",this._onPointerUp,!0),this.supportsTouchEvents&&(this.domElement.removeEventListener("touchstart",this._onPointerDown,!0),this.domElement.removeEventListener("touchend",this._onPointerUp,!0),this.domElement.removeEventListener("touchmove",this._onPointerMove,!0))),this.domElement.removeEventListener("wheel",this.onWheel,!0),this.domElement=null,this._eventsAdded=!1}mapPositionToPoint(e,t,i){const s=this.domElement.isConnected?this.domElement.getBoundingClientRect():{x:0,y:0,width:this.domElement.width,height:this.domElement.height,left:0,top:0},n=1/this.resolution;e.x=(t-s.left)*(this.domElement.width/s.width)*n,e.y=(i-s.top)*(this.domElement.height/s.height)*n}_normalizeToPointerData(e){const t=[];if(this.supportsTouchEvents&&e instanceof TouchEvent)for(let i=0,s=e.changedTouches.length;i<s;i++){const n=e.changedTouches[i];typeof n.button>"u"&&(n.button=0),typeof n.buttons>"u"&&(n.buttons=1),typeof n.isPrimary>"u"&&(n.isPrimary=e.touches.length===1&&e.type==="touchstart"),typeof n.width>"u"&&(n.width=n.radiusX||1),typeof n.height>"u"&&(n.height=n.radiusY||1),typeof n.tiltX>"u"&&(n.tiltX=0),typeof n.tiltY>"u"&&(n.tiltY=0),typeof n.pointerType>"u"&&(n.pointerType="touch"),typeof n.pointerId>"u"&&(n.pointerId=n.identifier||0),typeof n.pressure>"u"&&(n.pressure=n.force||.5),typeof n.twist>"u"&&(n.twist=0),typeof n.tangentialPressure>"u"&&(n.tangentialPressure=0),typeof n.layerX>"u"&&(n.layerX=n.offsetX=n.clientX),typeof n.layerY>"u"&&(n.layerY=n.offsetY=n.clientY),n.isNormalized=!0,n.type=e.type,t.push(n)}else if(!globalThis.MouseEvent||e instanceof MouseEvent&&(!this.supportsPointerEvents||!(e instanceof globalThis.PointerEvent))){const i=e;typeof i.isPrimary>"u"&&(i.isPrimary=!0),typeof i.width>"u"&&(i.width=1),typeof i.height>"u"&&(i.height=1),typeof i.tiltX>"u"&&(i.tiltX=0),typeof i.tiltY>"u"&&(i.tiltY=0),typeof i.pointerType>"u"&&(i.pointerType="mouse"),typeof i.pointerId>"u"&&(i.pointerId=Q),typeof i.pressure>"u"&&(i.pressure=.5),typeof i.twist>"u"&&(i.twist=0),typeof i.tangentialPressure>"u"&&(i.tangentialPressure=0),i.isNormalized=!0,t.push(i)}else t.push(e);return t}normalizeWheelEvent(e){const t=this._rootWheelEvent;return this._transferMouseData(t,e),t.deltaX=e.deltaX,t.deltaY=e.deltaY,t.deltaZ=e.deltaZ,t.deltaMode=e.deltaMode,this.mapPositionToPoint(t.screen,e.clientX,e.clientY),t.global.copyFrom(t.screen),t.offset.copyFrom(t.screen),t.nativeEvent=e,t.type=e.type,t}_bootstrapEvent(e,t){return e.originalEvent=null,e.nativeEvent=t,e.pointerId=t.pointerId,e.width=t.width,e.height=t.height,e.isPrimary=t.isPrimary,e.pointerType=t.pointerType,e.pressure=t.pressure,e.tangentialPressure=t.tangentialPressure,e.tiltX=t.tiltX,e.tiltY=t.tiltY,e.twist=t.twist,this._transferMouseData(e,t),this.mapPositionToPoint(e.screen,t.clientX,t.clientY),e.global.copyFrom(e.screen),e.offset.copyFrom(e.screen),e.isTrusted=t.isTrusted,e.type==="pointerleave"&&(e.type="pointerout"),e.type.startsWith("mouse")&&(e.type=e.type.replace("mouse","pointer")),e.type.startsWith("touch")&&(e.type=ee[e.type]||e.type),e}_transferMouseData(e,t){e.isTrusted=t.isTrusted,e.srcElement=t.srcElement,e.timeStamp=performance.now(),e.type=t.type,e.altKey=t.altKey,e.button=t.button,e.buttons=t.buttons,e.client.x=t.clientX,e.client.y=t.clientY,e.ctrlKey=t.ctrlKey,e.metaKey=t.metaKey,e.movement.x=t.movementX,e.movement.y=t.movementY,e.page.x=t.pageX,e.page.y=t.pageY,e.relatedTarget=null,e.shiftKey=t.shiftKey}};A.extension={name:"events",type:[b.WebGLSystem,b.CanvasSystem,b.WebGPUSystem],priority:-1};A.defaultEventFeatures={move:!0,globalMove:!0,click:!0,wheel:!0};let S=A;const te={onclick:null,onmousedown:null,onmouseenter:null,onmouseleave:null,onmousemove:null,onglobalmousemove:null,onmouseout:null,onmouseover:null,onmouseup:null,onmouseupoutside:null,onpointercancel:null,onpointerdown:null,onpointerenter:null,onpointerleave:null,onpointermove:null,onglobalpointermove:null,onpointerout:null,onpointerover:null,onpointertap:null,onpointerup:null,onpointerupoutside:null,onrightclick:null,onrightdown:null,onrightup:null,onrightupoutside:null,ontap:null,ontouchcancel:null,ontouchend:null,ontouchendoutside:null,ontouchmove:null,onglobaltouchmove:null,ontouchstart:null,onwheel:null,get interactive(){return this.eventMode==="dynamic"||this.eventMode==="static"},set interactive(h){this.eventMode=h?"static":"passive"},_internalEventMode:void 0,get eventMode(){return this._internalEventMode??S.defaultEventMode},set eventMode(h){this._internalEventMode=h},isInteractive(){return this.eventMode==="static"||this.eventMode==="dynamic"},interactiveChildren:!0,hitArea:null,addEventListener(h,e,t){const i=typeof t=="boolean"&&t||typeof t=="object"&&t.capture,s=typeof t=="object"?t.signal:void 0,n=typeof t=="object"?t.once===!0:!1,o=typeof e=="function"?void 0:e;h=i?`${h}capture`:h;const r=typeof e=="function"?e:e.handleEvent,l=this;s&&s.addEventListener("abort",()=>{l.off(h,r,o)}),n?l.once(h,r,o):l.on(h,r,o)},removeEventListener(h,e,t){const i=typeof t=="boolean"&&t||typeof t=="object"&&t.capture,s=typeof e=="function"?void 0:e;h=i?`${h}capture`:h,e=typeof e=="function"?e:e.handleEvent,this.off(h,e,s)},dispatchEvent(h){if(!(h instanceof T))throw new Error("Container cannot propagate events outside of the Federated Events API");return h.defaultPrevented=!1,h.path=null,h.target=this,h.manager.dispatchEvent(h),!h.defaultPrevented}};M.add(W);M.mixin(B,z);M.add(S);M.mixin(B,te);
