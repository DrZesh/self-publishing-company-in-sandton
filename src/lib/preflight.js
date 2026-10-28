// Local preflight checks run against computed specs before/after a server-side cover-file review.

export function runPreflight(specs) {
  if (!specs) return { status: 'fail', checks: [], issues: ['No specs provided'] };

  const checks = [];
  const issues = [];
  const add = (label, ok, hint) => { checks.push({ label, ok }); if (!ok && hint) issues.push(hint); };

  add('Full cover width is valid', specs.fullWidth > 0);
  add('Full cover height is valid', specs.fullHeight > 0);
  add('Bleed present on all edges', specs.bleed > 0, 'No bleed set — printers require at least 3 mm bleed.');
  add('Safe margin present', specs.safeMargin >= 3, 'Safe margin is very small — keep text at least 6 mm from the trim.');
  add('Spine is thick enough for text', !specs.warnThinSpine, 'Spine is too thin for visible text — leave it blank.');
  add('Spine width calculated', specs.spine > 0);

  if (specs.coverType === 'dustjacket') {
    add('Flap width set', specs.flapWidth > 0, 'Dust jackets need a flap width.');
  }
  if (specs.coverType === 'hardcover') {
    add('Wraparound / turn-in allowance set', specs.wrap > 0, 'Hardcovers need a wraparound/turn-in allowance.');
  }

  const failed = checks.filter((c) => !c.ok).length;
  const status = failed === 0 ? 'pass' : failed <= 1 ? 'minor' : 'fail';

  return {
    status,
    checks,
    issues,
    summary: status === 'pass'
      ? 'All preflight checks passed — your cover geometry is print-ready.'
      : status === 'minor'
        ? 'Almost there — one minor issue to review before printing.'
        : `${failed} issues found — review before sending to print.`,
  };
}