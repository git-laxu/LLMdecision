// app/js/api/knowledgeProcessApi.js
export const knowledgeProcessApi = {
  async parseAndChunk(payload) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const knowledgeCount = Array.isArray(payload.knowledgeIds) ? payload.knowledgeIds.length : 0;
    const chunkCount = knowledgeCount * 4;

    return {
      success: true,
      status: 'chunked',
      chunkCount,
      message: `已完成文本解析与切分，共生成 ${chunkCount} 个知识片段`,
      payload
    };
  },

  async vectorize(payload) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const chunkCount = Number(payload.chunkCount || 0);

    return {
      success: true,
      status: 'completed',
      vectorizedCount: chunkCount,
      message: `已完成文本向量化与知识表示，共向量化 ${chunkCount} 个片段`,
      payload
    };
  },

  async processAll(payload) {
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const knowledgeCount = Array.isArray(payload.knowledgeIds) ? payload.knowledgeIds.length : 0;
    const chunkCount = knowledgeCount * 4;

    return {
      success: true,
      status: 'completed',
      chunkCount,
      vectorizedCount: chunkCount,
      message: `一键完成知识处理，共切分 ${chunkCount} 个片段并完成向量化`,
      payload
    };
  }
};