import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function HowToGetISBN() {
  return <BlogArticlePage article={blogArticles['/howtogetanisbnforyourbook']} />;
}