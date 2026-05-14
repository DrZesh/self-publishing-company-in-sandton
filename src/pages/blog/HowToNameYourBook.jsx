import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function HowToNameYourBook() {
  return <BlogArticlePage article={blogArticles['/howtonameyourbook']} />;
}