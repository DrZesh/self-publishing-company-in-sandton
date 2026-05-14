import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function BecomeAWriter() {
  return <BlogArticlePage article={blogArticles['/howtobecomeawriterinsouthafrica']} />;
}