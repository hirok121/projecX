import api from './api'

/**
 * Blog API Service
 * Base URL: /blogs
 */
export const blogAPI = {
  list: async (params = {}) => {
    const { data } = await api.get('/blogs/', { params })
    return data
  },

  get: async (idOrSlug) => {
    const { data } = await api.get(`/blogs/${idOrSlug}`)
    return data
  },

  create: async (blogData) => {
    const form = new FormData()
    form.append('title', blogData.title)
    if (blogData.slug) form.append('slug', blogData.slug)
    form.append('content', blogData.content)
    if (blogData.summary) form.append('summary', blogData.summary)
    if (blogData.tags && Array.isArray(blogData.tags)) form.append('tags', blogData.tags.join(','))
    form.append('published', blogData.published ? 'true' : 'false')
    if (blogData.image) form.append('image', blogData.image)

    const { data } = await api.post('/blogs/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  update: async (blogId, updates) => {
    const form = new FormData()
    if (updates.title) form.append('title', updates.title)
    if (updates.slug) form.append('slug', updates.slug)
    if (updates.content) form.append('content', updates.content)
    if (updates.summary !== undefined) form.append('summary', updates.summary || '')
    if (updates.tags && Array.isArray(updates.tags)) form.append('tags', updates.tags.join(','))
    if (updates.published !== undefined) form.append('published', updates.published ? 'true' : 'false')
    if (updates.image) form.append('image', updates.image)

    const { data } = await api.put(`/blogs/${blogId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  delete: async (blogId) => {
    await api.delete(`/blogs/${blogId}`)
  },

  generateSlug: async (title) => {
    const { data } = await api.post('/blogs/slug/generate', null, {
      params: { title },
    })
    return data
  },

  checkSlug: async (slug, excludeId = null) => {
    const params = excludeId ? { exclude_id: excludeId } : {}
    const { data } = await api.get(`/blogs/slug/check/${slug}`, { params })
    return data
  },
}

export default blogAPI
