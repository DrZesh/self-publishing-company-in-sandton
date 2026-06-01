export const WORKFLOWS = {
  'Book Printing': [
    {
      key: 'intro', label: 'Introduction / Project Started',
      subject: 'Your Book Printing Project Has Started',
      defaultBody: `Thank you for choosing Creative Books SA for your book printing project.\n\nWe are thrilled to have you on board and wanted to take a moment to introduce your project officially.\n\nYour book printing project titled <strong>{{project_title}}</strong> has now been registered in our system and your dedicated team is ready to begin. We will keep you updated at every key stage of the printing process.\n\nShould you have any questions or additional instructions at this stage, please feel free to reach out to us at any time.`,
      isWelcome: true,
    },
    {
      key: 'queued', label: 'Queued for Print',
      subject: 'Your Book Has Been Queued for Printing',
      defaultBody: `We are pleased to let you know that <strong>{{project_title}}</strong> has been successfully queued in our print production schedule.\n\nYour book will proceed to the printing phase shortly. We will notify you as soon as printing begins.`,
    },
    {
      key: 'printing', label: 'Started Printing',
      subject: 'Printing Has Started on Your Book',
      defaultBody: `Exciting news! Printing has officially started on <strong>{{project_title}}</strong>.\n\nOur production team has begun running your book through our high-quality printing process. We will keep you updated as each stage is completed.`,
    },
    {
      key: 'covers', label: 'Covers Printed',
      subject: 'Your Book Covers Have Been Printed',
      defaultBody: `We are pleased to let you know that the covers for <strong>{{project_title}}</strong> have been successfully printed.\n\nYour covers have come out beautifully and are ready for the next stage of production. We will be in touch as soon as the binding phase begins.`,
    },
    {
      key: 'binding', label: 'Binding Phase',
      subject: 'Your Books Are Now in the Binding Phase',
      defaultBody: `<strong>{{project_title}}</strong> has now entered the binding phase of production.\n\nOur team is carefully binding your books to ensure a professional, durable finish. We will notify you once binding is complete and your books move to the trimming phase.`,
    },
    {
      key: 'trimming', label: 'Trimming Phase',
      subject: 'Your Books Are Now Being Trimmed',
      defaultBody: `<strong>{{project_title}}</strong> is now in the trimming phase.\n\nOur team is trimming your books to the correct dimensions to ensure a clean, professional edge on every copy. We are nearly at the finish line and will be in touch shortly.`,
    },
    {
      key: 'packaging', label: 'Packaging',
      subject: 'Your Books Are Now Being Packaged',
      defaultBody: `Great news! <strong>{{project_title}}</strong> is now being carefully packaged and prepared for delivery or collection.\n\nWe handle every copy with care to ensure your books arrive in perfect condition. We will notify you as soon as your order is ready.`,
    },
    {
      key: 'ready', label: 'Ready for Delivery or Collection',
      subject: 'Your Books Are Ready for Delivery or Collection',
      defaultBody: `Your books for <strong>{{project_title}}</strong> are ready!\n\nYour completed order is now ready for delivery or collection. Our team will be in contact shortly to arrange the final step.\n\nThank you for trusting Creative Books SA with your publishing journey. We hope you love the result.`,
    },
  ],
  'Book Editing': [
    {
      key: 'intro', label: 'Introduction / Project Started',
      subject: 'Your Book Editing Project Has Started',
      defaultBody: `Thank you for choosing Creative Books SA for your book editing project.\n\nWe are delighted to welcome you and confirm that your editing project titled <strong>{{project_title}}</strong> has been officially registered. Your dedicated editor will be assigned and will begin as soon as your manuscript is received.\n\nWe look forward to helping your book reach its full potential.`,
      isWelcome: true,
    },
    {
      key: 'manuscript_received', label: 'Manuscript Received',
      subject: 'Your Manuscript Has Been Received',
      defaultBody: `We are pleased to confirm that we have received the manuscript for <strong>{{project_title}}</strong>.\n\nOur editing team is reviewing the document and will begin the initial review shortly. We will keep you informed as the process progresses.`,
    },
    {
      key: 'initial_review', label: 'Initial Review',
      subject: 'Initial Review Has Started on Your Manuscript',
      defaultBody: `The initial review of <strong>{{project_title}}</strong> has begun.\n\nOur editor is carefully reviewing the structure, flow, and overall content of your manuscript before proceeding with the full edit. This stage ensures that we approach the editing process with the most effective strategy for your book.`,
    },
    {
      key: 'editing_in_progress', label: 'Editing in Progress',
      subject: 'Editing Is Now in Progress',
      defaultBody: `We are happy to let you know that editing is now actively in progress on <strong>{{project_title}}</strong>.\n\nOur editor is working carefully through your manuscript to improve clarity, consistency, grammar, and overall readability. We will notify you once editing is complete and your manuscript is ready for review.`,
    },
    {
      key: 'quality_check', label: 'Internal Quality Check',
      subject: 'Your Manuscript Is Undergoing an Internal Quality Check',
      defaultBody: `The edited version of <strong>{{project_title}}</strong> is now undergoing an internal quality check.\n\nThis additional review ensures that all editing is consistent, accurate, and meets our high standards before the manuscript is returned to you. We will be in touch shortly.`,
    },
    {
      key: 'ready_for_review', label: 'Edited Manuscript Ready for Review',
      subject: 'Your Edited Manuscript Is Ready for Review',
      defaultBody: `Great news! The edited manuscript for <strong>{{project_title}}</strong> is now ready for your review.\n\nWe will be sending your edited manuscript to you shortly. Please review all tracked changes and comments carefully and let us know if you have any questions or if any further adjustments are required.`,
    },
    {
      key: 'awaiting_feedback', label: 'Awaiting Client Feedback',
      subject: 'Awaiting Your Feedback on the Edited Manuscript',
      defaultBody: `We have sent you the edited manuscript for <strong>{{project_title}}</strong> and are now awaiting your feedback.\n\nPlease take your time to review the changes carefully and let us know your thoughts. You are welcome to contact us at any time if you have questions or would like to discuss any of the edits.`,
    },
    {
      key: 'final_adjustments', label: 'Final Adjustments',
      subject: 'Final Adjustments Are Being Made',
      defaultBody: `Based on your feedback, our editor is now making the final adjustments to <strong>{{project_title}}</strong>.\n\nWe appreciate your input and are committed to ensuring the manuscript is exactly as you envisioned. We will be in touch as soon as the final version is ready.`,
    },
    {
      key: 'completed', label: 'Editing Completed',
      subject: 'Your Book Editing Project Has Been Completed',
      defaultBody: `Congratulations! Your book editing project for <strong>{{project_title}}</strong> has been successfully completed.\n\nIt has been a pleasure working on your manuscript. We hope the final result exceeds your expectations. Should you need any further assistance with your publishing journey, our team is always here to help.\n\nThank you for trusting Creative Books SA.`,
    },
  ],
  'Book Cover Design': [
    {
      key: 'intro', label: 'Introduction / Project Started',
      subject: 'Your Book Cover Design Project Has Started',
      defaultBody: `Thank you for choosing Creative Books SA for your book cover design project.\n\nWe are excited to begin working on the cover for <strong>{{project_title}}</strong>. Your project has been officially registered and your designer will be in touch regarding the design brief shortly.\n\nA great cover is the first thing readers notice, and we are committed to creating something truly special for your book.`,
      isWelcome: true,
    },
    {
      key: 'brief_received', label: 'Design Brief Received',
      subject: 'Your Cover Design Brief Has Been Received',
      defaultBody: `We have received the design brief for <strong>{{project_title}}</strong>.\n\nOur design team is reviewing your brief carefully and will begin developing initial concepts shortly. We will be in touch as soon as we have something ready for your review.`,
    },
    {
      key: 'concept_development', label: 'Concept Development',
      subject: 'Your Book Cover Concept Is in Development',
      defaultBody: `The concept development phase for <strong>{{project_title}}</strong> is now underway.\n\nOur designer is working on creating a cover concept that reflects your vision and captures the essence of your book. We will notify you as soon as the first concept is ready for your review.`,
    },
    {
      key: 'first_concept_sent', label: 'First Concept Sent for Review',
      subject: 'Your First Book Cover Concept Is Ready for Review',
      defaultBody: `We are excited to let you know that the first cover concept for <strong>{{project_title}}</strong> is ready and has been sent to you for review.\n\nPlease take your time to review the design and share your thoughts, feedback, or any changes you would like to see. Your input is important to us and we want to make sure the cover is exactly right.`,
    },
    {
      key: 'awaiting_feedback', label: 'Awaiting Client Feedback',
      subject: 'Awaiting Your Feedback on the Cover Design',
      defaultBody: `We are currently awaiting your feedback on the cover design for <strong>{{project_title}}</strong>.\n\nPlease review the design concept and let us know if you are happy to proceed or if you would like any changes. We are here to make any adjustments needed to ensure you are completely satisfied.`,
    },
    {
      key: 'revisions', label: 'Revisions in Progress',
      subject: 'Cover Design Revisions Are in Progress',
      defaultBody: `Based on your feedback, our designer is now working on revisions to the cover design for <strong>{{project_title}}</strong>.\n\nWe appreciate your input and are making the requested changes carefully. We will notify you as soon as the revised design is ready for your review.`,
    },
    {
      key: 'final_approval', label: 'Final Cover Sent for Approval',
      subject: 'Your Final Cover Design Has Been Sent for Approval',
      defaultBody: `The final cover design for <strong>{{project_title}}</strong> has been sent to you for your final approval.\n\nPlease review the design carefully and confirm your approval so we can proceed to the print-ready preparation phase. If any last-minute adjustments are required, please let us know.`,
    },
    {
      key: 'print_ready', label: 'Print-Ready Cover Preparation',
      subject: 'Your Print-Ready Cover Is Being Prepared',
      defaultBody: `Following your approval, we are now preparing the print-ready version of the cover for <strong>{{project_title}}</strong>.\n\nThis stage involves optimising the file to meet all print specifications. We will be in touch as soon as the process is complete.`,
    },
    {
      key: 'completed', label: 'Cover Design Completed',
      subject: 'Your Book Cover Design Has Been Completed',
      defaultBody: `Congratulations! The book cover design for <strong>{{project_title}}</strong> has been successfully completed.\n\nIt has been a pleasure designing your cover and we hope you love the final result. Your print-ready cover file will be sent to you shortly.\n\nThank you for choosing Creative Books SA.`,
    },
  ],
};

export const SERVICE_TYPES = [
  'Book Printing',
  'Book Editing',
  'Book Cover Design',
  'Typesetting and Layout',
  'Manuscript Evaluation',
  'Ghostwriting',
  'Author Website',
  'Ebook Publishing',
];

export const STATUS_COLORS = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  on_hold: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

export const SERVICE_COLORS = {
  'Book Printing': { bg: 'bg-violet-50', accent: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-200' },
  'Book Editing': { bg: 'bg-sky-50', accent: 'bg-sky-500', text: 'text-sky-700', border: 'border-sky-200' },
  'Book Cover Design': { bg: 'bg-rose-50', accent: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200' },
  'Typesetting and Layout': { bg: 'bg-amber-50', accent: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
  'Manuscript Evaluation': { bg: 'bg-teal-50', accent: 'bg-teal-500', text: 'text-teal-700', border: 'border-teal-200' },
  'Ghostwriting': { bg: 'bg-indigo-50', accent: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Author Website': { bg: 'bg-orange-50', accent: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200' },
  'Ebook Publishing': { bg: 'bg-lime-50', accent: 'bg-lime-500', text: 'text-lime-700', border: 'border-lime-200' },
};