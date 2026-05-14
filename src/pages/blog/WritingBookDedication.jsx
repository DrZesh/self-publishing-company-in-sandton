import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function WritingBookDedication() {
  return <BlogArticlePage article={blogArticles['/writingabookdedication']} />;
}