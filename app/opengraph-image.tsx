import { ImageResponse } from 'next/og';
export const alt='PIMX Agent — Research. Create. Refine.';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#101325',color:'#efecff',padding:'65px 78px',flexDirection:'column',position:'relative'}}><div style={{display:'flex',fontSize:22,color:'#ad99ed',letterSpacing:6}}>PIMX / AGENT</div><div style={{display:'flex',fontSize:88,fontWeight:800,lineHeight:1.14,marginTop:75}}>From an idea<br/>to something real.</div><div style={{display:'flex',gap:22,marginTop:42,fontSize:18,color:'#ac9ac7'}}><span>DEEP RESEARCH</span><span>•</span><span>WEB DEV</span><span>•</span><span>SLIDE STUDIO</span></div><div style={{display:'flex',position:'absolute',bottom:38,right:60,fontSize:16,color:'#76668e'}}>pimxagent.pages.dev</div></div>,size);}
