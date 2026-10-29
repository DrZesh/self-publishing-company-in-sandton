import cfg from './config.js';
export const attachmentTypes=['application/pdf','image/png','image/jpeg','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const invoiceTerms=invoice=>invoice.terms ?? cfg.termsSummary.join('\n');
export const money=n=>`R ${Number(n||0).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export function addresses(value,required=false){
 const list=String(value||'').split(/[;,]/).map(v=>v.trim()).filter(Boolean);
 if((required&&!list.length)||list.length>5||list.some(v=>v.length>254||! /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(v)))throw new Error('Enter valid email addresses, up to five per field.');
 return [...new Set(list)];
}
export function envelope(input,kind,doc,quote){
 const to=addresses(input.to,true),cc=addresses(input.cc);
 const subject=String(input.subject||'').trim(),message=String(input.message||'').trim();
 if(!subject||subject.length>200||/[\r\n]/.test(subject))throw new Error('Enter a subject of 200 characters or less.');
 if(!message||message.length>10000)throw new Error('Enter a message of 10000 characters or less.');
 const link=`${cfg.portalOrigin}${cfg.portalPath}/${quote.public_token}`;
 return {from:`${cfg.company.name} <${cfg.company.email}>`,to,cc,reply_to:cfg.company.email,subject,text:`${message}\n\n${doc.number}: ${money(doc.total)}${kind==='quote'?`\nReview & accept: ${link}\nValid until ${quote.expiry_date}`:''}`,html:emailHtml({message,kind,doc,link})};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function emailHtml({message,kind,doc,link}){
 return `<div style="background:#f4f3f0;padding:28px;font-family:Arial,sans-serif;color:#23232a"><div style="max-width:600px;background:#fff;margin:auto;border:1px solid #ddd;border-radius:10px;overflow:hidden"><div style="padding:24px;text-align:center"><img src="${cfg.portalOrigin}${cfg.company.logoUrl}" width="200" alt="Creative Books SA"></div><div style="background:#B87333;color:#fff;padding:15px 24px;font-weight:bold">${esc(doc.number)}</div><div style="padding:24px;line-height:1.6;white-space:pre-wrap">${esc(message)}</div><div style="background:#f6eee4;padding:20px 24px"><div>${kind==='quote'?'QUOTE':'INVOICE'} AMOUNT</div><strong style="font-size:28px">${esc(money(doc.total))}</strong><p>Your PDF and supporting documents are attached.</p></div>${kind==='quote'?`<div style="padding:24px;text-align:center"><a style="display:inline-block;background:#B87333;color:white;text-decoration:none;padding:14px 22px;border-radius:5px" href="${esc(link)}">Review &amp; Accept Quote</a></div>`:''}<div style="padding:20px 24px;color:#666">${esc(cfg.company.name)} · ${esc(cfg.company.email)}</div></div></div>`;
}
export function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
const clean=s=>String(s??'').normalize('NFC').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2022/g,'*').replace(/\u2026/g,'...').replace(/[^\x20-\x7e\xa0-\xff\n]/g,'?');
export async function documentPdf({PDFDocument,StandardFonts,rgb},kind,doc,quote,client,items,logoBytes){
 const pdf=await PDFDocument.create();const normal=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const copper=rgb(.72,.45,.2),ink=rgb(.12,.13,.17),muted=rgb(.4,.4,.43);
 let page,y;const width=595.28,height=841.89,left=42,right=553;
 const next=()=>{page=pdf.addPage([width,height]);y=height-48;};next();
 const ensure=n=>{if(y-n<50)next();};
 const line=(text,{size=10,font=normal,color=ink,gap=15,x=left}={})=>{ensure(gap);page.drawText(clean(text),{x,y,size,font,color});y-=gap;};
 const wrap=(text,max,font,size)=>{
  const out=[];for(const paragraph of clean(text).split('\n')){let row='';for(const word of paragraph.split(/\s+/)){let rest=word;while(font.widthOfTextAtSize(rest,size)>max){if(row){out.push(row);row='';}let chunk='';while(rest&&font.widthOfTextAtSize(chunk+rest[0],size)<=max){chunk+=rest[0];rest=rest.slice(1);}out.push(chunk);}const trial=row?`${row} ${rest}`:rest;if(font.widthOfTextAtSize(trial,size)>max){out.push(row);row=rest;}else row=trial;}out.push(row);}return out;
 };
 const paragraph=(text,opts={})=>{const size=opts.size||10,font=opts.font||normal;for(const row of wrap(text,right-left,font,size))line(row,{...opts,size,font});};
 const heading=text=>{ensure(36);y-=12;line(text,{font:bold,size:11,color:copper,gap:20});};
 if(logoBytes){try{const logo=await pdf.embedPng(logoBytes);const dim=logo.scale(Math.min(170/logo.width,60/logo.height));page.drawImage(logo,{x:left,y:y-dim.height,width:dim.width,height:dim.height});}catch{}}
 page.drawText(kind==='quote'?'QUOTE':cfg.company.vatNumber?'TAX INVOICE':'INVOICE',{x:380,y,size:23,font:bold,color:copper});y-=30;
 page.drawText(clean(doc.number),{x:380,y,size:12,font:bold,color:ink});y-=48;
 paragraph(cfg.company.name,{font:bold});cfg.company.addressLines.forEach(t=>line(t,{size:9,gap:13}));line(cfg.company.email,{size:9});
 if(cfg.company.vatNumber)line(`VAT No. ${cfg.company.vatNumber}`);
 heading('Bill To');paragraph(client.display_name,{font:bold});if(client.company)paragraph(client.company);if(client.billing_address)paragraph(client.billing_address);line(client.email||'',{size:9});
 heading(kind==='quote'?'Quote details':'Invoice details');
 line(`Date: ${kind==='quote'?quote.quote_date:doc.invoice_date}`);
 line(kind==='quote'?`Valid until: ${quote.expiry_date}`:`Reference: ${quote.number} | ${cfg.rules.invoiceTermsLabel}`);
 if(quote.subject)paragraph(quote.subject,{font:bold});
 heading('Items');
 if(kind==='quote'){
  for(const item of items){ensure(65);paragraph(item.name,{font:bold});if(item.description)paragraph(item.description,{size:9,color:muted,gap:13});paragraph(`Qty ${item.qty} x ${money(item.rate)} | Discount ${item.discount_type==='percent'?`${item.discount}%`:money(item.discount)} | ${money(item.amount)}`);y-=7;}
  heading(`TOTAL: ${money(quote.total)}`);
  heading('Payment schedule');paragraph(`${cfg.rules.depositPercent}% deposit on acceptance: ${money(Number(quote.total)*cfg.rules.depositPercent/100)}. Work starts once funds clear.`);paragraph(`Balance before completion / collection: ${money(Number(quote.total)*(100-cfg.rules.depositPercent)/100)}.`);
  if(quote.notes){heading('Notes');paragraph(quote.notes);}
 }else{
  paragraph(`${doc.type==='deposit'?'Deposit':'Balance'} (${doc.percent}%) on ${quote.number}`,{font:bold});
  paragraph(`Quote total: ${money(quote.total)}`);for(const item of items)paragraph(`${item.name}${item.description?`: ${item.description}`:''}`,{size:9,color:muted,gap:13});
  heading(`INVOICE TOTAL: ${money(doc.total)}`);line(`Paid: ${money(doc.amount_paid)}`);line(`Balance due: ${money(doc.balance_due)}`,{font:bold});
 }
 heading('Payment details');paragraph(`Pay by EFT or cash deposit. Use ${doc.number} as your reference.`);
 for(const b of cfg.banks){paragraph(`${b.bank} | ${b.accountName} | ${b.accountNumber}${b.accountType?` | ${b.accountType}`:''}`);}
 heading('Terms & Conditions');paragraph(kind==='invoice'?invoiceTerms(doc):cfg.termsSummary.join('\n'),{size:9,gap:13});
 if(kind==='quote'&&quote.signature){heading('Client acceptance');paragraph(`${quote.signature.name||'Client'} | ${quote.accepted_at||''}`);if(quote.signature.image?.startsWith('data:image/png;base64,')){try{const sig=await pdf.embedPng(quote.signature.image);ensure(70);const d=sig.scale(Math.min(180/sig.width,60/sig.height));page.drawImage(sig,{x:left,y:y-d.height,width:d.width,height:d.height});y-=70;}catch{}}}
 const pages=pdf.getPages();pages.forEach((p,i)=>p.drawText(`${clean(doc.number)} | Page ${i+1} of ${pages.length}`,{x:left,y:26,size:8,font:normal,color:muted}));
 return pdf.save();
}
