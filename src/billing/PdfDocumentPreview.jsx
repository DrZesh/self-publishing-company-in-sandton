import React,{useEffect,useState} from 'react';
export default function PdfDocumentPreview({kind,deal,invoice,compact}){
 const [result,setResult]=useState(null),[error,setError]=useState('');
 const snapshot=JSON.stringify({kind,quote:deal.quote,client:deal.client,items:deal.items,invoice});
 useEffect(()=>{let active=true,url;setResult(null);setError('');
  (async()=>{const [{documentPdf},pdfLib,{default:logo64}]=await Promise.all([import('../../supabase/functions/billingDocumentEmail/document.js'),import('pdf-lib'),import('../../supabase/functions/billingDocumentEmail/logo.js')]);const d=JSON.parse(snapshot);const bytes=await documentPdf(pdfLib,d.kind,d.kind==='quote'?d.quote:d.invoice,d.quote,d.client,d.items,Uint8Array.from(atob(logo64),c=>c.charCodeAt(0)));if(!active)return;url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));setResult({url,number:d.kind==='quote'?d.quote.number:d.invoice.number});})().catch(e=>{if(active)setError(e.message);});
  return()=>{active=false;if(url)URL.revokeObjectURL(url);};
 },[snapshot]);
 return <section className="cb-pdf-document" aria-label={`${kind} PDF preview`}><div className="cb-pdf-tools"><b>PDF preview</b><span className="cb-help">This is the document attached to the email.</span>{result&&<><a className="cb-btn sm" href={result.url} target="_blank" rel="noreferrer">Open PDF / Print</a><a className="cb-btn sm" href={result.url} download={result.number+'.pdf'}>Save this PDF</a></>}</div>{error?<p className="cb-err" role="alert">PDF preview could not load: {error}</p>:!result?<p role="status" className="cb-help">Preparing PDF preview…</p>:<object className={compact?'compact':''} data={result.url+'#toolbar=0&navpanes=0&view=FitH'} type="application/pdf" aria-label={`${kind} document`}><p>Your browser can open the PDF using <a href={result.url} target="_blank" rel="noreferrer">Open PDF / Print</a>.</p></object>}</section>;
}
