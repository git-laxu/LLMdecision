// app/js/api/knowledgeApi.js

export const KnowledgeApi = {
  async vectorizeKnowledgeItems(items = []) {
    // 先留模拟接口，后续你接后端
    return {
      success: true,
      count: items.length,
      message: `已完成 ${items.length} 条知识的向量化配置（模拟）`
    };
  },

  async splitKnowledgeText(text = '') {
    if (!text) return [];
    return text
      .split(/\n{2,}|。|；/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((content, index) => ({
        id: `chunk_${Date.now()}_${index}`,
        content
      }));
  }
};