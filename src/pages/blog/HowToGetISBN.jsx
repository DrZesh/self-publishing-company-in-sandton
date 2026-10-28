import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function HowToGetISBN() {
  return <BlogArticlePage article={blogArticles['/how-to-get-an-isbn-for-your-book']} />;
}