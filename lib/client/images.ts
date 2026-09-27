'use client';
export async function compressImage(file:File,maxDimension=1920):Promise<string>{
  if(file.size>10*1024*1024)throw new Error('Images must be smaller than 10 MB.');
  const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const png=bytes[0]===137 && bytes[1]===80 && bytes[2]===78 && bytes[3]===71;
  const jpeg=bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
  const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF' && new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
  if(!png&&!jpeg&&!webp)throw new Error('Use a valid PNG, JPEG or WebP image.');
  const bitmap=await createImageBitmap(file);
  try{if(bitmap.width*bitmap.height>40_000_000)throw new Error('This image is too large to process.');const scale=Math.min(1,maxDimension/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const context=canvas.getContext('2d');if(!context)throw new Error('Image processing is unavailable.');context.drawImage(bitmap,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/webp',0.82);if(data.length>3_000_000)throw new Error('The compressed image is too large. Use a smaller image.');return data;}finally{bitmap.close();}
}
