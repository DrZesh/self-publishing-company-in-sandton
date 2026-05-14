import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function CostToSelfPublishKindle() {
  return <BlogArticlePage article={blogArticles['/howmuchdoesitcosttoselfpublishonamazonkindle']} />;
}