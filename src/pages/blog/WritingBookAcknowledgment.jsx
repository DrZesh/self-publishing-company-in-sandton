import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function WritingBookAcknowledgment() {
  return <BlogArticlePage article={blogArticles['/writingabookacknowledgment']} />;
}