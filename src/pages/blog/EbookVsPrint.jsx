import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function EbookVsPrint() {
  return <BlogArticlePage article={blogArticles['/ebookvsprintbookselfpublishing']} />;
}