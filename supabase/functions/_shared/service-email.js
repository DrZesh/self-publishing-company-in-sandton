import {brandedWorkflowEmail} from './email-templates.js';
export function serviceEmailMessage(payload){
 const subject=payload.template_subject;
 const body=payload.template_body;
 if(!subject||!body||/[\r\n]/.test(subject))throw new Error('Stage email subject or body is missing');
 const completed=['Project Completed','Request Google Review'].includes(payload.stage);
 return {subject,text:body,html:brandedWorkflowEmail({heading:subject,introduction:'',message:body,fields:[],actionUrl:completed?'https://g.page/r/CYluusLzUm24EBM/review':payload.portal_url,actionLabel:completed?'Share your experience on Google':'View your project',inlineActionMarker:completed?'[Share your experience on Google](https://g.page/r/CYluusLzUm24EBM/review)':null,includeSignature:false})};
}
export function previewTemplate(template,firstName='',bookTitle='',paid=false,instructions='Review the supplied file and return your comments.'){
 const values={client_first_name:firstName.trim()||'there',book_title:bookTitle.trim()||'your book',printing_balance_paragraph:paid?'Please contact us to arrange collection or courier delivery. If you require courier delivery, we can now confirm the cost based on the packed order.':'We will now send you the remaining balance for payment so that you can settle it before collecting your books or having them dispatched by courier. If you require courier delivery, we can now confirm the cost based on the packed order.',review_instructions:instructions,review_link:'[Your secure project review link]'};
 const fill=s=>s.replace(/\{\{([^}]+)\}\}/g,(m,k)=>values[k]??m);
 return {template_subject:fill(template.subject),template_body:fill(template.body)};
}
