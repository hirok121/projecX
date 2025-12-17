// Blog API Integration for Frontend
// Copy this to frontend/src/services/blogAPI.js

import api from './api';

/**
 * Blog API Service
 * Base URL: /blogs
 */
export const blogAPI = {
  /**
   * List blogs with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.author_id - Filter by author ID
   * @param {string} params.tag - Filter by tag
   * @param {boolean} params.published - Filter by published status
   * @param {string} params.q - Search query
   * @param {number} params.limit - Max results (default: 20, max: 100)
   * @param {number} params.offset - Pagination offset
   * @returns {Promise<Array>} Array of blog posts
   */
  list: async (params = {}) => {
    const { data } = await api.get('/blogs/', { params });
    return data;
  },

  /**
   * Get single blog by ID or slug
   * @param {string|number} idOrSlug - Blog ID or slug
   * @returns {Promise<Object>} Blog with author details
   */
  get: async (idOrSlug) => {
    const { data } = await api.get(`/blogs/${idOrSlug}`);
    return data;
  },

  /**
   * Create new blog post (requires authentication)
   * @param {Object} blogData
   * @param {string} blogData.title - Blog title
   * @param {string} blogData.slug - URL-safe slug
   * @param {string} blogData.content - Markdown content
   * @param {string} blogData.summary - Optional summary
   * @param {Array<string>} blogData.tags - Optional tags
   * @param {boolean} blogData.published - Published status
   * @returns {Promise<Object>} Created blog
   */
  create: async (blogData) => {
    const { data } = await api.post('/blogs/', blogData);
    return data;
  },

  /**
   * Update existing blog post (requires authentication & ownership)
   * @param {number} blogId - Blog ID
   * @param {Object} updates - Fields to update (partial)
   * @returns {Promise<Object>} Updated blog
   */
  update: async (blogId, updates) => {
    const { data } = await api.put(`/blogs/${blogId}`, updates);
    return data;
  },

  /**
   * Delete blog post (requires authentication & ownership)
   * @param {number} blogId - Blog ID
   * @returns {Promise<void>}
   */
  delete: async (blogId) => {
    await api.delete(`/blogs/${blogId}`);
  },

  /**
   * Generate unique slug from title
   * @param {string} title - Blog title
   * @returns {Promise<Object>} { slug: string }
   */
  generateSlug: async (title) => {
    const { data } = await api.post('/blogs/slug/generate', null, {
      params: { title }
    });
    return data;
  },

  /**
   * Check if slug is available
   * @param {string} slug - Slug to check
   * @param {number} excludeId - Optional blog ID to exclude
   * @returns {Promise<Object>} { available: boolean, slug: string }
   */
  checkSlug: async (slug, excludeId = null) => {
    const params = excludeId ? { exclude_id: excludeId } : {};
    const { data } = await api.get(`/blogs/slug/check/${slug}`, { params });
    return data;
  },
};

// Usage Examples:

// 1. List all published blogs
// const blogs = await blogAPI.list({ published: true, limit: 10 });

// 2. Search blogs
// const results = await blogAPI.list({ q: 'machine learning', tag: 'tutorial' });

// 3. Get single blog
// const blog = await blogAPI.get('my-blog-slug');
// const blog = await blogAPI.get(123);

// 4. Create blog
// const newBlog = await blogAPI.create({
//   title: 'My New Post',
//   slug: 'my-new-post',
//   content: '# Hello\n\nMarkdown content',
//   summary: 'Brief summary',
//   tags: ['tutorial', 'intro'],
//   published: false
// });

// 5. Update blog
// const updated = await blogAPI.update(123, { published: true });

// 6. Delete blog
// await blogAPI.delete(123);

// 7. Generate slug from title
// const { slug } = await blogAPI.generateSlug('My Awesome Blog Post');
// console.log(slug); // 'my-awesome-blog-post'

// 8. Check slug availability
// const { available } = await blogAPI.checkSlug('my-slug');
// if (available) {
//   // Slug is available
// }
