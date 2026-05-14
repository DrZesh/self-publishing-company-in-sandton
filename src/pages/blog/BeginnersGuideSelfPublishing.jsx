import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function BeginnersGuideSelfPublishing() {
  return <BlogArticlePage article={blogArticles['/abeginnersguide']} />;
}