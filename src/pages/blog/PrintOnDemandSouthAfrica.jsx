import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function PrintOnDemandSouthAfrica() {
  return <BlogArticlePage article={blogArticles['/printondemandbooksinsouthafrica']} />;
}