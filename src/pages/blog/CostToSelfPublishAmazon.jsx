import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function CostToSelfPublishAmazon() {
  return <BlogArticlePage article={blogArticles['/howmuchdoesitcosttoselfpublishonamazon']} />;
}