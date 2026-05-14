import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function HowToPrintSelfPublishedBook() {
  return <BlogArticlePage article={blogArticles['/howtoprintyourselfpublishedbookinsouthafrica']} />;
}