(()=>{"use strict";var e,a={512:()=>{const e=window.wp.blocks,a=window.wp.blockEditor,t=window.wp.components,s=window.ReactJSXRuntime;(0,e.registerBlockType)("rs/bar-chart",{title:"Bar Chart Comparison",icon:"chart-bar",category:"design",attributes:{barOneStart:{type:"number",default:0},barOneEnd:{type:"number",default:50},barOneText:{type:"string",default:"Bar One"},barTwoStart:{type:"number",default:0},barTwoEnd:{type:"number",default:50},barTwoText:{type:"string",default:"Bar Two"},barTwoColour:{type:"string",default:"rgb(0, 0, 0)"},suffix:{type:"string",default:"%"},isBold:{type:"boolean",default:!1},isItalic:{type:"boolean",default:!1},isUnderlined:{type:"boolean",default:!1},htmlAnchor:{type:"string",default:""},extraClassNames:{type:"string",default:""}},edit({attributes:e,setAttributes:l}){const{barOneStart:r,barOneEnd:n,barOneText:i,barTwoStart:o,barTwoEnd:d,barTwoText:c,barTwoColour:x,suffix:h,isBold:m,isItalic:b,isUnderlined:p}=e,u=(0,a.useBlockProps)(),g=(e,a)=>{isNaN(a)||l({[e]:parseFloat(a)})},j=parseFloat(n)>parseFloat(d)||Math.abs(parseFloat(n)-parseFloat(d))<=2?"rgb(1, 170, 41)":Math.abs(parseFloat(n)-parseFloat(d))<=5?"rgb(231, 181, 0)":"rgb(240, 0, 0)",v=parseFloat(d)-parseFloat(o),y=parseFloat(n)-parseFloat(r),w=v/Math.max(v,y)*100,C=y/Math.max(v,y)*100,f=Math.min(100,Math.max(0,w)),T=Math.min(100,Math.max(0,C)),N={fontWeight:m?"bold":"normal",fontStyle:b?"italic":"normal",textDecoration:p?"underline":"none"};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(a.InspectorControls,{children:(0,s.jsx)(t.TabPanel,{className:"my-custom-tabs",activeClass:"active-tab",tabs:[{name:"general",title:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("span",{className:"dashicons dashicons-block-default"})," ","General"]}),className:"tab-general"},{name:"style",title:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("span",{className:"dashicons dashicons-admin-customizer"})," ","Style"]}),className:"tab-style"},{name:"advanced",title:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("span",{className:"dashicons dashicons-ellipsis"})," ","Advanced"]}),className:"tab-advanced"}],children:u=>{switch(u.name){case"general":return(0,s.jsxs)(t.PanelBody,{title:"General Settings",children:[(0,s.jsx)(t.TextControl,{label:"Bar One Start Value",value:r,onChange:e=>g("barOneStart",e)}),(0,s.jsx)(t.TextControl,{label:"Bar One End Value",value:n,onChange:e=>g("barOneEnd",e)}),(0,s.jsx)(t.TextControl,{label:"Bar One Text",value:i,onChange:e=>l({barOneText:e})}),(0,s.jsx)(t.TextControl,{label:"Bar Two Start Value",value:o,onChange:e=>g("barTwoStart",e)}),(0,s.jsx)(t.TextControl,{label:"Bar Two End Value",value:d,onChange:e=>g("barTwoEnd",e)}),(0,s.jsx)(t.TextControl,{label:"Bar Two Text",value:c,onChange:e=>l({barTwoText:e})}),(0,s.jsx)(t.TextControl,{label:"Value Suffix",value:h,onChange:e=>l({suffix:e})})]});case"style":return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(t.PanelBody,{title:"Bar Colour",children:[(0,s.jsx)(a.ColorPalette,{colors:wp.data.select("core/block-editor").getSettings().colors,value:x,onChange:e=>l({barTwoColour:e})}),(0,s.jsx)(t.ColorPicker,{color:x,onChange:e=>l({barTwoColour:e})})]}),(0,s.jsx)(t.PanelBody,{title:"Title Text Styling",children:(0,s.jsxs)("div",{className:"text-styling-buttons",children:[(0,s.jsx)(t.Button,{onClick:()=>l({isBold:!m}),className:e.isBold?"active":"",children:"B"}),(0,s.jsx)(t.Button,{onClick:()=>l({isItalic:!b}),className:e.isItalic?"active":"",children:"I"}),(0,s.jsx)(t.Button,{onClick:()=>l({isUnderlined:!p}),className:e.isUnderlined?"active":"",children:"U"})]})})]});case"advanced":return(0,s.jsxs)(t.PanelBody,{title:"Advanced Settings",children:[(0,s.jsx)(t.TextControl,{label:"HTML Anchor",help:"Specify a unique ID for the block (e.g., 'my-block-id').",value:e.htmlAnchor,onChange:e=>l({htmlAnchor:e})}),(0,s.jsx)(t.TextControl,{label:"Additional CSS Class(es)",help:"Add extra CSS class names for custom styling. Separate with spaces.",value:e.extraClassNames,onChange:e=>l({extraClassNames:e})})]});default:return null}}})}),(0,s.jsx)("div",{...u,children:(0,s.jsxs)("div",{className:"bar-chart",children:[(0,s.jsxs)("div",{className:"bar",style:{marginBottom:"20px"},children:[(0,s.jsx)("p",{className:"wp-block-paragraph",style:N,children:i}),(0,s.jsx)("div",{className:"bar-fill",style:{backgroundColor:j,width:`${T}%`}})]},`bar-one-${n}`),(0,s.jsxs)("div",{className:"bar",style:{marginBottom:"20px"},children:[(0,s.jsx)("p",{className:"wp-block-paragraph",style:N,children:c}),(0,s.jsx)("div",{className:"bar-fill",style:{backgroundColor:x,width:`${f}%`}})]},`bar-two-${d}`),(0,s.jsxs)("div",{className:"value-indicators",children:[(0,s.jsx)("span",{children:Math.min(parseFloat(o),parseFloat(r))}),(0,s.jsxs)("span",{children:[Math.max(parseFloat(d),parseFloat(n)),h]})]})]})})]})},save({attributes:e}){const{barOneStart:a,barOneEnd:t,barOneText:l,barTwoStart:r,barTwoEnd:n,barTwoText:i,barTwoColour:o,suffix:d,isBold:c,isItalic:x,isUnderlined:h}=e,m=parseFloat(t)>parseFloat(n)||Math.abs(parseFloat(t)-parseFloat(n))<=2?"rgb(1, 170, 41)":Math.abs(parseFloat(t)-parseFloat(n))<=5?"rgb(231, 181, 0)":"rgb(240, 0, 0)",b=parseFloat(n)-parseFloat(r),p=parseFloat(t)-parseFloat(a),u=b/Math.max(b,p)*100,g=p/Math.max(b,p)*100,j=Math.min(100,Math.max(0,u)),v=Math.min(100,Math.max(0,g)),y={fontWeight:c?"bold":"normal",fontStyle:x?"italic":"normal",textDecoration:h?"underline":"none"};return(0,s.jsx)("div",{children:(0,s.jsxs)("div",{className:"bar-chart",children:[(0,s.jsxs)("div",{className:"bar",children:[(0,s.jsx)("p",{className:"wp-block-paragraph",style:y,children:l}),(0,s.jsx)("div",{className:"bar-fill animating-bar","data-final-width":v,style:{backgroundColor:m,width:(t-a)/100+"%"}})]}),(0,s.jsxs)("div",{className:"bar",children:[(0,s.jsx)("p",{className:"wp-block-paragraph",style:y,children:i}),(0,s.jsx)("div",{className:"bar-fill animating-bar","data-final-width":j,style:{backgroundColor:o,width:(n-r)/100+"%"}})]}),(0,s.jsxs)("div",{className:"value-indicators",children:[(0,s.jsx)("span",{children:Math.min(parseFloat(r),parseFloat(a))}),(0,s.jsxs)("span",{children:[Math.max(parseFloat(n),parseFloat(t)),d]})]})]})})}}),(0,e.registerBlockType)("rs/my-new-block",{title:"My New Block",icon:"smiley",category:"common",attributes:{text:{type:"string",default:"Hello, World!"},alignment:{type:"string",default:"center"}},edit({attributes:e,setAttributes:t}){const{text:l,alignment:r}=e;return(0,s.jsxs)("div",{style:{textAlign:r},children:[(0,s.jsx)(a.BlockControls,{children:(0,s.jsx)(a.AlignmentToolbar,{value:r,onChange:e=>t({alignment:e})})}),(0,s.jsx)("input",{type:"text",value:l,onChange:e=>t({text:e.target.value})})]})},save:({attributes:e})=>(0,s.jsx)("div",{style:{textAlign:e.alignment},children:e.text})}),(0,e.registerBlockType)("rs/generic-slider",{title:"Generic Slider",icon:"images-alt2",category:"widgets",attributes:{slides:{type:"array",default:[]}},edit:({attributes:e,setAttributes:l})=>{const{slides:r}=e,n=(e,a,t)=>{const s=[...r];s[e][a]=t,l({slides:s})};return(0,s.jsxs)("div",{className:"generic-slider-editor",children:[(0,s.jsx)(a.InspectorControls,{children:(0,s.jsx)(t.PanelBody,{title:"Settings",children:(0,s.jsx)(t.PanelRow,{children:(0,s.jsx)(t.Button,{isPrimary:!0,onClick:()=>{l({slides:[...r,{text:"",image:""}]})},children:"Add Slide"})})})}),(0,s.jsx)("div",{className:"slider-preview",children:r.map(((e,i)=>(0,s.jsxs)("div",{className:"slider-item",children:[(0,s.jsx)(a.MediaUpload,{onSelect:e=>n(i,"image",e.url),allowedTypes:["image"],render:({open:a})=>(0,s.jsx)(t.Button,{isSecondary:!0,onClick:a,children:e.image?(0,s.jsx)("img",{src:e.image,alt:`Slide ${i}`}):"Select Image"})}),(0,s.jsx)(a.RichText,{tagName:"div",placeholder:"Slide Text",value:e.text,onChange:e=>n(i,"text",e),multiline:"p"}),(0,s.jsx)(t.Button,{isDestructive:!0,onClick:()=>(e=>{const a=r.filter(((a,t)=>t!==e));l({slides:a})})(i),children:"Remove"})]},i)))})]})},save:({attributes:e})=>{const{slides:a}=e;return(0,s.jsxs)("div",{className:"carousel",children:[(0,s.jsx)("div",{className:"entries",children:a.map(((e,a)=>(0,s.jsxs)("div",{className:"slider-entry",id:`slide${a+1}`,children:[e.image&&(0,s.jsx)("div",{className:"image-container",children:(0,s.jsx)("img",{src:e.image,alt:`Slide ${a}`})}),e.text&&(0,s.jsx)("div",{children:e.text.split("\n").map(((e,a)=>(0,s.jsx)("p",{className:"wp-block-paragraph",children:e},a)))})]},a)))}),(0,s.jsx)("div",{className:"markers",children:a.map(((e,a)=>(0,s.jsx)("button",{className:"marker","data-slide":a+1},a)))})]})}})}},t={};function s(e){var l=t[e];if(void 0!==l)return l.exports;var r=t[e]={exports:{}};return a[e](r,r.exports,s),r.exports}s.m=a,e=[],s.O=(a,t,l,r)=>{if(!t){var n=1/0;for(c=0;c<e.length;c++){for(var[t,l,r]=e[c],i=!0,o=0;o<t.length;o++)(!1&r||n>=r)&&Object.keys(s.O).every((e=>s.O[e](t[o])))?t.splice(o--,1):(i=!1,r<n&&(n=r));if(i){e.splice(c--,1);var d=l();void 0!==d&&(a=d)}}return a}r=r||0;for(var c=e.length;c>0&&e[c-1][2]>r;c--)e[c]=e[c-1];e[c]=[t,l,r]},s.o=(e,a)=>Object.prototype.hasOwnProperty.call(e,a),(()=>{var e={57:0,350:0};s.O.j=a=>0===e[a];var a=(a,t)=>{var l,r,[n,i,o]=t,d=0;if(n.some((a=>0!==e[a]))){for(l in i)s.o(i,l)&&(s.m[l]=i[l]);if(o)var c=o(s)}for(a&&a(t);d<n.length;d++)r=n[d],s.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return s.O(c)},t=globalThis.webpackChunkrs_blocks=globalThis.webpackChunkrs_blocks||[];t.forEach(a.bind(null,0)),t.push=a.bind(null,t.push.bind(t))})();var l=s.O(void 0,[350],(()=>s(512)));l=s.O(l)})();