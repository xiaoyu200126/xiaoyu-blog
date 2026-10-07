import{g as f,j as r}from"./index-Bbp2ZeUu.js";import{b as c}from"./vendor-react-bhoXslEe.js";import"./vendor-motion-pCaKqtag.js";const h=`## 介绍

"摩西在诗篇90篇里面说：我们经过的日子都在你的震怒之下，我们渡尽的年岁好像是一生叹息。"

## 生活是一场湮灭的花火

生活本身或许也没有啥子意义，不信你看：爱情会远去，身体会衰老，激情会消失。

## 绽放的我们于是有了意义

所以生命本身没有意义，有意义的是活着的我们，我们的喜怒哀乐，我们对生活的感知才有意义。

## 尾

"XIAOYU的随笔"记录着发生过的事、遇见过的人、去过的地方。`;function d(n){const l=n.split(`
`);let t="",s=!1,i="";for(let a=0;a<l.length;a++){const p=l[a],e=p.trim();if(e.startsWith("```")){s?(t+=`<pre><code>${o(i)}</code></pre>`,i="",s=!1):s=!0;continue}if(s){i+=p+`
`;continue}e.startsWith("#### ")?t+=`<h4>${o(e.slice(5))}</h4>`:e.startsWith("### ")?t+=`<h3>${o(e.slice(4))}</h3>`:e.startsWith("## ")?t+=`<h2>${o(e.slice(3))}</h2>`:e.startsWith("# ")?t+=`<h2>${o(e.slice(2))}</h2>`:e.startsWith("> ")?t+=`<blockquote>${e.slice(2)}</blockquote>`:e==="---"||e==="***"?t+="<hr>":e===""?t+="<br>":t+=`<p>${e}</p>`}return s&&i&&(t+=`<pre><code>${o(i)}</code></pre>`),t}function o(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function x(){const n=c.useRef(null),l=c.useMemo(()=>d(h),[]);return c.useEffect(()=>{const t=n.current;t&&f.fromTo(t,{opacity:0,y:40},{opacity:1,y:0,duration:1,ease:"power3.out",delay:.2})},[]),r.jsx("div",{style:{minHeight:"100vh",paddingTop:"140px",paddingBottom:"80px",backgroundColor:"var(--color-bg)"},children:r.jsxs("div",{ref:n,style:{maxWidth:"800px",margin:"0 auto",padding:"0 40px"},children:[r.jsx("span",{className:"badge-month",style:{display:"block",marginBottom:"24px"},children:"About XIAOYU"}),r.jsx("h1",{style:{fontFamily:"var(--font-display)",fontSize:"clamp(28px, 4vw, 42px)",fontWeight:300,lineHeight:1.3,marginBottom:"48px",color:"var(--color-text)",letterSpacing:"-0.02em"},children:"XIAOYU的随笔"}),r.jsx("div",{className:"article-content",dangerouslySetInnerHTML:{__html:l}})]})})}export{x as default};
