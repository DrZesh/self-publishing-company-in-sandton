import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function ChildrensBookIllustrations() {
  return <BlogArticlePage article={blogArticles['/childrensbookillustrationsprinting']} />;
}