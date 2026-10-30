import fontkit from '@pdf-lib/fontkit';
import {regularFont,boldFont} from './fonts.js';
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
// One canonical renderer for the CRM preview, downloaded PDF and email attachment.
export async function documentPdf({PDFDocument,rgb},kind,doc,quote,client,items,logoBytes){
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
 const decode=b=>Uint8Array.from(atob(b),c=>c.charCodeAt(0));
 const normal=await pdf.embedFont(decode(regularFont),{subset:true}),bold=await pdf.embedFont(decode(boldFont),{subset:true});
 const ink=rgb(.15,.15,.15),muted=rgb(.28,.28,.28),rule=rgb(.68,.68,.68),band=rgb(.96,.96,.96),white=rgb(1,1,1),head=rgb(.235,.239,.227);
 const W=595.42,H=841.69,L=45.6,R=560.63,B=775;let page,y;
 const pages=[];const next=()=>{page=pdf.addPage([W,H]);pages.push(page);y=50;};next();
 const ensure=n=>{if(y+n>B)next();};
 const text=(value,x,top,{size=9,font=normal,color=ink,align='left'}={})=>{const valueClean=clean(value);const w=font.widthOfTextAtSize(valueClean,size);page.drawText(valueClean,{x:align==='right'?x-w:x,y:H-top-size,size,font,color});};
 const rect=(x,top,w,h,color)=>page.drawRectangle({x,y:H-top-h,width:w,height:h,color});
 const hr=(top,x=L,end=R)=>page.drawLine({start:{x,y:H-top},end:{x:end,y:H-top},thickness:.5,color:rule});
 const wrap=(value,width,size=9,font=normal)=>{
  const rows=[];for(const paragraph of clean(value).split('\n')){let row='';for(const word of paragraph.split(/\s+/)){let rest=word;if(!rest)continue;while(font.widthOfTextAtSize(rest,size)>width){if(row){rows.push(row);row='';}let chunk='';while(rest&&font.widthOfTextAtSize(chunk+rest[0],size)<=width){chunk+=rest[0];rest=rest.slice(1);}if(!chunk){chunk=rest[0];rest=rest.slice(1);}rows.push(chunk);}if(row&&font.widthOfTextAtSize(row+' '+rest,size)>width){rows.push(row);row=rest;}else row=row?row+' '+rest:rest;}rows.push(row);}return rows;
 };
 const paragraph=(value,{size=9,font=normal,gap=13,x=L,width=R-L,color=ink}={})=>{for(const row of wrap(value,width,size,font)){ensure(gap);text(row,x,y,{size,font,color});y+=gap;}};
 const heading=value=>{ensure(34);y+=17;text(value,L,y,{size:10});y+=20;};
 const date=value=>{if(!value)return '';const d=new Date(String(value).slice(0,10)+'T12:00:00Z');return Number.isNaN(d.valueOf())?String(value):d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});};
 const amount=value=>Number(value||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 const cash=value=>'R'+amount(value);
 const title=kind==='quote'?'QUOTE':cfg.company.vatNumber?'TAX INVOICE':'INVOICE';
 text(title,R,58,{size:28,align:'right'});text('# '+doc.number,R,95,{size:10,font:bold,align:'right'});
 if(kind==='invoice'){text('Balance Due',R,117,{size:9,align:'right',color:muted});text(cash(doc.balance_due),R,132,{size:14,font:bold,align:'right'});}
 // The supplied template gives the logo a spacious 180 pt block.
 if(logoBytes){try{const logo=await pdf.embedPng(logoBytes);const d=logo.scale(Math.min(145/logo.width,100/logo.height));page.drawImage(logo,{x:L+12,y:H-144-d.height/2,width:d.width,height:d.height});}catch{throw new Error('The document logo could not be rendered');}}
 y=240;paragraph(cfg.company.name,{size:10,font:bold,gap:14});for(const line of cfg.company.addressLines)paragraph(line,{size:9,gap:12});if(cfg.company.vatNumber)paragraph('VAT No. '+cfg.company.vatNumber);
 y+=25;const metaTop=y;text('Bill To',L,y,{size:10});y+=14;paragraph(client.display_name||'',{size:9,font:bold,gap:13,width:285});if(client.company&&client.company!==client.display_name)paragraph(client.company,{width:285});if(client.billing_address)paragraph(client.billing_address,{width:285});if(client.vat_number)paragraph('VAT No. '+client.vat_number,{width:285});
 const details=kind==='quote'?[['Estimate Date',date(quote.quote_date)],['Valid Until',date(quote.expiry_date)]]:[['Invoice Date',date(doc.invoice_date)],['Terms',cfg.rules.invoiceTermsLabel],['Reference',quote.number]];
 details.forEach(([k,v],i)=>{text(k+' :',380,metaTop+10+i*15,{size:9});text(v,R,metaTop+10+i*15,{size:9,align:'right'});});y=Math.max(y,metaTop+10+details.length*15)+22;
 const discount=kind==='quote'&&items.some(i=>Number(i.discount));
 const cols=discount?[L+9,L+40,389,446,493,R-8]:[L+9,L+40,419,476,R-8];
 const numeric=discount?['Qty','Rate','Discount','Amount']:['Qty','Rate','Amount'];
 const tableHead=()=>{ensure(50);rect(L,y,R-L,24,head);text('#',cols[0],y+6,{color:white,size:9});text('Item & Description',cols[1],y+6,{color:white,size:9});numeric.forEach((h,i)=>text(h,cols[i+2],y+6,{color:white,size:9,align:'right'}));y+=29;};
 const row=(n,name,description,values)=>{
  const descWidth=(discount?315:368)-cols[1];const lines=[...wrap(name,descWidth,9),...wrap(description||'',descWidth,8)];
  if(y+Math.min(lines.length*12+12,90)>B){next();tableHead();}
  let first=true;let offset=0;
  for(const line of lines){if(y+12>B){hr(y);next();tableHead();first=true;}
   if(first){text(n,cols[0],y,{size:9});values.forEach((v,i)=>text(v,cols[i+2],y,{size:9,align:'right'}));first=false;}
   text(line,cols[1],y,{size:offset<wrap(name,descWidth,9).length?9:8,color:offset<wrap(name,descWidth,9).length?ink:muted});y+=12;offset++;
  }y+=9;hr(y);y+=10;
 };
 tableHead();
 if(kind==='quote')items.forEach((it,i)=>row(i+1,it.name,it.description,[amount(it.qty),amount(it.rate),...(discount?[it.discount_type==='percent'?amount(it.discount)+'%':amount(it.discount)]:[]),amount(it.amount)]));
 else row(1,`${doc.type==='deposit'?'Deposit':'Balance'} (${doc.percent}%) on ${quote.number}`,items.map(i=>i.name+(i.description?'\n'+i.description:'')).join('\n')+'\nQuote total '+cash(quote.total),['1.00',amount(doc.total),amount(doc.total)]);
 const totalLine=(label,value,highlight=false)=>{ensure(highlight?30:22);if(highlight)rect(303,y,R-303,30,band);text(label,453,y+(highlight?8:3),{size:9,font:highlight?bold:normal,align:'right'});text(value,R-8,y+(highlight?8:3),{size:9,font:highlight?bold:normal,align:'right'});y+=highlight?31:23;};
 ensure(kind==='quote'?54:112);totalLine('Sub Total',amount(kind==='quote'?quote.sub_total??quote.total:doc.total));totalLine('Total',cash(doc.total),true);
 if(kind==='invoice'){totalLine('Paid',amount(doc.amount_paid));totalLine('Balance Due',cash(doc.balance_due),true);}
 if(kind==='quote'){
  heading('Payment schedule');paragraph(`${cfg.rules.depositPercent}% deposit on acceptance: ${cash(Number(quote.total)*cfg.rules.depositPercent/100)}. Work starts once funds clear (4.2).`);paragraph(`Balance on completion, before final delivery: ${cash(Number(quote.total)*(100-cfg.rules.depositPercent)/100)} (4.3).`);
 }
 ensure(quote.notes?45:210);heading('Notes');if(quote.notes)paragraph(quote.notes);
 if(kind==='invoice')paragraph('Pay by EFT or cash deposit only. Cheques are not accepted. Use '+doc.number+' as your reference.');
 ensure(135);paragraph('Banking Details',{size:8});y+=7;
 cfg.banks.forEach((b,i)=>{if(i){ensure(35);y+=5;paragraph('OR',{size:8});y+=5;}ensure(65);paragraph(b.bank,{size:8,gap:11});paragraph('Account Name: '+b.accountName,{size:8,gap:11});if(b.accountType)paragraph(b.accountType,{size:8,gap:11});paragraph('Account Number: '+b.accountNumber,{size:8,gap:11});});
 heading('Terms & Conditions');paragraph(kind==='invoice'?invoiceTerms(doc):cfg.termsSummary.join('\n\n'),{size:9,gap:13});
 if(kind==='quote'){
  ensure(100);y+=30;const sigTop=y;
  if(quote.signature?.image?.startsWith('data:image/png;base64,')){try{const sig=await pdf.embedPng(quote.signature.image);const d=sig.scale(Math.min(160/sig.width,45/sig.height));page.drawImage(sig,{x:L,y:H-y-d.height,width:d.width,height:d.height});}catch{throw new Error('The saved signature could not be rendered');}}
  y=sigTop+48;hr(y,L,L+215);hr(y,345,R);y+=5;paragraph('Client signature & date'+(quote.signature?' : '+(quote.signature.name||'')+' '+date(quote.signature.signed_at||quote.accepted_at):''),{size:8,width:255,gap:12});text('Authorized Signature',345,sigTop+53,{size:8});
 }
 pages.forEach((p,i)=>{p.drawLine({start:{x:39.6,y:50.4},end:{x:566.63,y:50.4},thickness:.5,color:rule});p.drawText(`${i+1}`,{x:R-4,y:34,size:6,font:normal,color:muted});});
 const recordedDate=new Date((kind==='invoice'?doc.invoice_date:quote.quote_date)+'T00:00:00Z');const metadataDate=Number.isNaN(recordedDate.valueOf())?new Date(0):recordedDate;pdf.setCreationDate(metadataDate);pdf.setModificationDate(metadataDate);
 pdf.setTitle(doc.number);pdf.setAuthor(cfg.company.name);pdf.setSubject(kind==='quote'?'Quotation':'Invoice');return pdf.save();
}
