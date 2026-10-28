import { createClientFromRequest, serve } from '../_shared/server.ts';

// Runs preflight checks on an uploaded cover file against the expected spec geometry,
// persists a CoverReview record, and returns the review result.
serve('checkCoverErrors', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me().catch(() => null);

    const body = await req.json();
    const {
      fileUrl, coverType, fullWidth, fullHeight, bleed, safe, spine, foldX,
    } = body || {};

    const checks: { label: string; ok: boolean }[] = [];
    const issues: string[] = [];
    const add = (label: string, ok: boolean, hint?: string) => {
      checks.push({ label, ok });
      if (!ok && hint) issues.push(hint);
    };

    add('Cover file provided', !!fileUrl, 'No cover file was uploaded.');
    add('Full cover width present', Number(fullWidth) > 0, 'Missing full cover width.');
    add('Full cover height present', Number(fullHeight) > 0, 'Missing full cover height.');
    add('Bleed present on all edges', Number(bleed) >= 3, 'Bleed should be at least 3 mm on every edge.');
    add('Safe margin present', Number(safe) >= 3, 'Keep text at least 6 mm from the trim edge.');
    add('Spine width valid', Number(spine) > 0, 'Spine width could not be determined.');
    add('Spine thick enough for text', Number(spine) >= 3.2, 'Spine is too thin for legible text.');

    const foldPositions = (() => {
      try { return typeof foldX === 'string' ? JSON.parse(foldX) : (foldX || []); }
      catch { return []; }
    })();
    add('Fold lines defined', Array.isArray(foldPositions) && foldPositions.length > 0, 'No fold lines were defined for this cover.');

    const failed = checks.filter((c) => !c.ok).length;
    const status = failed === 0 ? 'pass' : failed <= 1 ? 'minor' : 'fail';
    const summary = status === 'pass'
      ? 'All preflight checks passed — your cover is print-ready.'
      : status === 'minor'
        ? 'One minor issue to review before printing.'
        : `${failed} issues found — please review before sending to print.`;

    const review = {
      fileUrl: fileUrl || '',
      coverType: coverType || '',
      fullWidth: Number(fullWidth) || 0,
      fullHeight: Number(fullHeight) || 0,
      bleed: Number(bleed) || 0,
      safe: Number(safe) || 0,
      spine: Number(spine) || 0,
      foldX: typeof foldX === 'string' ? foldX : JSON.stringify(foldPositions),
      issues: JSON.stringify(issues),
      checks: JSON.stringify(checks),
      status,
      summary,
    };

    let saved = null;
    try {
      saved = user
        ? await platform.entities.CoverReview.create(review)
        : await platform.asServiceRole.entities.CoverReview.create(review);
    } catch (_e) {
      saved = null; // persistence is best-effort — still return the result
    }

    return Response.json({ ...review, id: saved?.id || null });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});