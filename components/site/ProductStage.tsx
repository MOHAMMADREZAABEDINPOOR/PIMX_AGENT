'use client';
import Image from 'next/image';
import {motion,useMotionValue,useSpring,useReducedMotion} from 'motion/react';
import {useLocale} from '@/components/i18n/LocaleProvider';
import {usePublicTheme} from './SiteFrame';

export function ProductStage(){
  const fa=useLocale()==='fa',light=usePublicTheme()==='light',reduced=useReducedMotion();
  const x=useMotionValue(0),y=useMotionValue(0),rotateX=useSpring(x,{stiffness:100,damping:22}),rotateY=useSpring(y,{stiffness:100,damping:22});
  return <motion.div className="product-stage" style={{rotateX:reduced?0:rotateX,rotateY:reduced?0:rotateY,transformPerspective:1600}}
    onPointerMove={event=>{if(reduced||event.pointerType!=='mouse')return;const bounds=event.currentTarget.getBoundingClientRect();x.set((.5-(event.clientY-bounds.top)/bounds.height)*5);y.set(((event.clientX-bounds.left)/bounds.width-.5)*7);}}
    onPointerLeave={()=>{x.set(0);y.set(0);}}>
    <Image src={light?'/media/pimx-workspace-light.webp':'/media/pimx-workspace-dark.webp'}
      alt={fa?'رابط واقعی چت PIMX Agent روی لپ‌تاپ و آیفون؛ انتخاب مدل، استدلال و ابزارهای ساخت':'The PIMX Agent chat workspace on a laptop and iPhone, with model selection, reasoning and creative tools'}
      width={1672} height={941} sizes="(max-width: 760px) 100vw, 65vw" loading="eager" fetchPriority="high"/>
    <div className="product-stage-caption"><span><i/>{fa?'فضای کاری واقعی PIMX Agent':'THE PIMX AGENT WORKSPACE'}</span><span>{fa?'روی لپ‌تاپ. روی گوشی.':'ON YOUR LAPTOP. ON YOUR PHONE.'}</span></div>
  </motion.div>;
}
