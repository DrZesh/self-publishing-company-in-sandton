# Phase 1 Post-Build Verification Checklist

Run through this checklist systematically once Phase 1 is live. Check off each item as you go.

---

## 1. Admin Portal Access

**Goal:** Verify the admin URL is live and redirects correctly.

- [ ] Visit `https://ink-crafted-stories.base44.app/admin` (or your Base44 staging URL)
- [ ] Confirm you land on `/admin/login` (the login page, not a 404)
- [ ] Refresh the page — does it stay on `/admin/login`?
- [ ] Try visiting `/admin/dashboard` without logging in — you should be redirected back to `/admin/login`
- [ ] Try visiting `/admin/submissions` without logging in — you should be redirected back to `/admin/login`

**Expected result:** All redirects work as expected, no errors.

---

## 2. Owner Account Setup

**Goal:** Confirm your admin account was created correctly.

- [ ] Check your email inbox at **info@creativebooks.co.za** for a setup/password-creation link from Base44
- [ ] If no email exists, Base44 should show a one-time setup screen at `/admin/login` — confirm it's there
- [ ] Click the setup link (or use the one-time screen) and set a strong password
- [ ] Record your password in a password manager (1Password, Bitwarden, etc.)
- [ ] Log in with your email and password — confirm you land on the Dashboard

**Expected result:** You can successfully log in and see the admin dashboard.

---

## 3. Public Site Admin Links

**Goal:** Verify no public site pages link to the admin portal.

Search the live public site for any admin links:

- [ ] Visit the homepage and search for "admin" (Cmd+F / Ctrl+F) — should find 0 results
- [ ] Check the footer — no admin link
- [ ] Check the header/navbar — no admin link
- [ ] Check contact page, FAQ, any other footer navigation — no admin links anywhere

**Expected result:** Zero admin links visible anywhere on the public site.

---

## 4. robots.txt Check

**Goal:** Confirm the admin portal is blocked from search engines.

- [ ] Visit `https://ink-crafted-stories.base44.app/robots.txt` (or your staging URL)
- [ ] Look for the line `Disallow: /admin` — it should be present
- [ ] Confirm the sitemap URL is listed: `Sitemap: https://ink-crafted-stories.base44.app/sitemap.xml`

**Expected result:** robots.txt contains `Disallow: /admin` and sitemap reference.

---

## 5. sitemap.xml Verification

**Goal:** Confirm the admin portal is NOT in the sitemap.

- [ ] Visit `https://ink-crafted-stories.base44.app/sitemap.xml`
- [ ] Search for "/admin" (Cmd+F / Ctrl+F) — should find 0 results
- [ ] Verify it loads without a 301/302 redirect (status should be 200)
- [ ] Confirm the sitemap contains URLs for public pages (homepage, services, blog, etc.)

**Expected result:** sitemap.xml loads cleanly, no /admin URLs, no 301 redirects.

---

## 6. Meta Tags on Login Page

**Goal:** Confirm `/admin/login` has noindex to prevent accidental indexing.

- [ ] Visit `https://ink-crafted-stories.base44.app/admin/login`
- [ ] Right-click → "View Page Source" (or Cmd+U / Ctrl+U)
- [ ] Search for `<meta name="robots" content="noindex">`
- [ ] Confirm it's present in the `<head>`

**Expected result:** noindex meta tag is present on the login page.

---

## 7. Unauthenticated Admin Access Redirect

**Goal:** Verify unauthorized users are redirected to login.

- [ ] Open a new private/incognito browser tab
- [ ] Visit `https://ink-crafted-stories.base44.app/admin/dashboard` directly
- [ ] Confirm you're redirected to `/admin/login`
- [ ] Try `/admin/submissions` — should also redirect to `/admin/login`
- [ ] Close the private tab

**Expected result:** All /admin/* routes redirect to /admin/login when not logged in.

---

## 8. Failed Login Lockout

**Goal:** Verify the 5-attempt lockout is active.

**⚠️ Warning:** Do this only on a test account or a device you control. Don't lock out your real account.

If you have a test admin account available:

- [ ] Attempt to log in with wrong password 5 times
- [ ] After the 5th failed attempt, confirm you see an error: *"Too many login attempts. Please try again in 15 minutes."*
- [ ] Wait 15 minutes or restart your browser, then retry with the correct password
- [ ] Confirm login succeeds after the lockout window expires

**If you don't have a test account:** Skip this for now and ask Base44 for a test account before going live.

**Expected result:** 5-attempt lockout is enforced; users can retry after 15 minutes.

---

## 9. Form Submission Capture

**Goal:** Verify form submissions are being captured in the admin database.

- [ ] Visit the public Contact page (`https://ink-crafted-stories.base44.app/contact`)
- [ ] Fill out and submit the contact form with test data
  - Name: "Test Admin"
  - Email: "test@example.com"
  - Phone: "+27123456789"
  - Message: "This is a test submission."
- [ ] Confirm you see a success message: *"Thanks, Test! Your message has been received."*
- [ ] Check your email (test@example.com) for a confirmation email
- [ ] Log in to the admin dashboard
- [ ] Visit `/admin/submissions` (the inbox)
- [ ] Confirm your test submission appears in the list with status "new"
- [ ] Click on it to view the details

**Expected result:** Test submission appears in the admin inbox with all data captured.

---

## 10. Admin Dashboard Overview

**Goal:** Verify the dashboard displays key metrics and data.

Once logged in:

- [ ] Check the main Dashboard page (`/admin/dashboard`)
- [ ] Confirm you see the greeting with the current date/time
- [ ] Look for summary cards showing:
  - [ ] Total submissions/inbox count
  - [ ] New submissions count
  - [ ] Any other KPI cards if implemented
- [ ] Verify all numbers load without errors

**Expected result:** Dashboard displays metrics and loads without errors.

---

## 11. Admin Inbox Navigation

**Goal:** Verify submission filtering and detail viewing works.

In the admin inbox:

- [ ] View the full list of submissions
- [ ] Click on your test submission to open the detail modal
- [ ] Confirm you can see:
  - [ ] Full name, email, phone
  - [ ] Message content
  - [ ] Submission date/time
  - [ ] Form type
  - [ ] Any other captured metadata
- [ ] Close the modal and return to the list
- [ ] Test the search/filter (if implemented) to narrow submissions

**Expected result:** Inbox loads, detail view works, filtering functions correctly.

---

## 12. Session Persistence (Remember Me)

**Goal:** Verify the "Remember me" checkbox extends session length.

- [ ] Log out
- [ ] Log in again with "Remember me" checked
- [ ] Refresh the page a few times — confirm you stay logged in
- [ ] Close the browser tab, wait 5 minutes, then reopen the admin URL
- [ ] Confirm you're still logged in (session should be 30 days with "Remember me")

**Expected result:** Session persists across browser restarts when "Remember me" is checked.

---

## 13. Search Console & Sitemap Submission

**Goal:** Ensure search engines can crawl public content but not the admin area.

- [ ] Go to [Google Search Console](https://search.google.com/search-console) and sign in with your Google account
- [ ] Add your live domain (once custom domain is set)
- [ ] Submit the sitemap: `https://www.creativebooks.co.za/sitemap.xml`
- [ ] Verify it's accepted (status should show "Success" after a few hours)
- [ ] Check "Coverage" to see which pages are indexed
- [ ] Confirm NO /admin URLs appear in the indexed pages

**Expected result:** Sitemap is submitted, public pages are indexed, /admin is never indexed.

---

## 14. Bookmark for Future Access

**Goal:** Create an easy shortcut for daily access.

Once everything above passes:

- [ ] Bookmark the login page (`/admin/login`) in your browser
- [ ] Name it: "Creative Books Admin"
- [ ] Optional: Pin it to your bookmarks bar for one-click access
- [ ] Save your password in your password manager with the same name

**Expected result:** You have a quick way to access the admin portal daily.

---

## 15. Logout and Re-login Cycle

**Goal:** Verify logout works and login can be repeated.

- [ ] While logged in, look for a "Logout" button (likely in the top-right corner of the Dashboard)
- [ ] Click it and confirm you're redirected to `/admin/login`
- [ ] Log in again with your password to confirm it still works

**Expected result:** Logout clears session, login works on repeat.

---

## Troubleshooting

If any step fails, note which one and what the error was:

| Step | Issue | Notes |
|------|-------|-------|
|      |       |       |
|      |       |       |
|      |       |       |

---

## Final Sign-Off

Once all 15 steps pass, you're ready to go live. Sign off here:

- **Checklist completed by:** ________________
- **Date completed:** ________________
- **Any blockers or concerns?** ________________

---

## Next Steps

Once Phase 1 is verified and live:

1. Add the admin login URL to your password manager
2. Bookmark it in your browser
3. Set up 2FA (two-factor authentication) if Base44 supports it
4. Invite any team members who need admin access (if applicable)
5. Start monitoring form submissions and leads daily