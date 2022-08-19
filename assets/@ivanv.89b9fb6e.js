import"./vue.03290593.js";import{o as r,c as o,w as d,r as h,T as l}from"./@vue.f16def16.js";var c=(e,t)=>{const s=e.__vccOpts||e;for(const[n,a]of t)s[n]=a;return s};const p={name:"CollapseTransition",props:{name:{type:String,required:!1,default:"collapse"},dimension:{type:String,required:!1,default:"height",validator:e=>["height","width"].includes(e)},duration:{type:Number,required:!1,default:300},easing:{type:String,required:!1,default:"ease-in-out"}},watch:{dimension(){this.clearCachedDimensions()}},data(){return{cachedStyles:null}},computed:{transition(){let e=[];return Object.keys(this.cachedStyles).forEach(t=>{e.push(`${this.convertToCssProperty(t)} ${this.duration}ms ${this.easing}`)}),e.join(", ")}},methods:{beforeAppear(e){this.$emit("before-appear",e)},appear(e){this.$emit("appear",e)},afterAppear(e){this.$emit("after-appear",e)},appearCancelled(e){this.$emit("appear-cancelled",e)},beforeEnter(e){this.$emit("before-enter",e)},enter(e,t){this.detectAndCacheDimensions(e),this.setClosedDimensions(e),this.hideOverflow(e),this.forceRepaint(e),this.setTransition(e),this.setOpenedDimensions(e),this.$emit("enter",e,t),setTimeout(t,this.duration)},afterEnter(e){this.unsetOverflow(e),this.unsetTransition(e),this.unsetDimensions(e),this.clearCachedDimensions(),this.$emit("after-enter",e)},enterCancelled(e){this.$emit("enter-cancelled",e)},beforeLeave(e){this.$emit("before-leave",e)},leave(e,t){this.detectAndCacheDimensions(e),this.setOpenedDimensions(e),this.hideOverflow(e),this.forceRepaint(e),this.setTransition(e),this.setClosedDimensions(e),this.$emit("leave",e,t),setTimeout(t,this.duration)},afterLeave(e){this.unsetOverflow(e),this.unsetTransition(e),this.unsetDimensions(e),this.clearCachedDimensions(),this.$emit("after-leave",e)},leaveCancelled(e){this.$emit("leave-cancelled",e)},detectAndCacheDimensions(e){if(this.cachedStyles)return;const t=e.style.visibility,s=e.style.display;e.style.visibility="hidden",e.style.display="",this.cachedStyles=this.detectRelevantDimensions(e),e.style.visibility=t,e.style.display=s},clearCachedDimensions(){this.cachedStyles=null},detectRelevantDimensions(e){return this.dimension==="height"?{height:e.offsetHeight+"px",paddingTop:e.style.paddingTop||this.getCssValue(e,"padding-top"),paddingBottom:e.style.paddingBottom||this.getCssValue(e,"padding-bottom")}:this.dimension==="width"?{width:e.offsetWidth+"px",paddingLeft:e.style.paddingLeft||this.getCssValue(e,"padding-left"),paddingRight:e.style.paddingRight||this.getCssValue(e,"padding-right")}:{}},setTransition(e){e.style.transition=this.transition},unsetTransition(e){e.style.transition=""},hideOverflow(e){e.style.overflow="hidden"},unsetOverflow(e){e.style.overflow=""},setClosedDimensions(e){Object.keys(this.cachedStyles).forEach(t=>{e.style[t]="0"})},setOpenedDimensions(e){Object.keys(this.cachedStyles).forEach(t=>{e.style[t]=this.cachedStyles[t]})},unsetDimensions(e){Object.keys(this.cachedStyles).forEach(t=>{e.style[t]=""})},forceRepaint(e){getComputedStyle(e)[this.dimension]},getCssValue(e,t){return getComputedStyle(e,null).getPropertyValue(t)},convertToCssProperty(e){const t=e.match(/([A-Z])/g);if(!t)return e;for(let s=0,n=t.length;s<n;s++)e=e.replace(new RegExp(t[s]),"-"+t[s].toLowerCase());return e.slice(0,1)==="-"&&(e=e.slice(1)),e}}};function f(e,t,s,n,a,i){return r(),o(l,{name:s.name,onBeforeAppear:i.beforeAppear,onAppear:i.appear,onAfterAppear:i.afterAppear,onAppearCancelled:i.appearCancelled,onBeforeEnter:i.beforeEnter,onEnter:i.enter,onAfterEnter:i.afterEnter,onEnterCancelled:i.enterCancelled,onBeforeLeave:i.beforeLeave,onLeave:i.leave,onAfterLeave:i.afterLeave,onLeaveCancelled:i.leaveCancelled},{default:d(()=>[h(e.$slots,"default")]),_:3},8,["name","onBeforeAppear","onAppear","onAfterAppear","onAppearCancelled","onBeforeEnter","onEnter","onAfterEnter","onEnterCancelled","onBeforeLeave","onLeave","onAfterLeave","onLeaveCancelled"])}var v=c(p,[["render",f]]);export{v as C,c as _};
