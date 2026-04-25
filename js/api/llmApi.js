// app/js/api/llmApi.js

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const LlmApi = {
  async generateStrategy(payload) {
    const { semanticContext, modelConfig, constraints = {}, knowledgeRefs = [] } = payload || {};

    // ====== 这里先做模拟返回，后面你再改成真实 fetch ======
    await sleep(900);

    const task = constraints?.goal || '办公建筑热环境调节';
    const constraintText = [
      constraints?.energyPriority ? '节能优先' : null,
      constraints?.localFirst ? '优先局部调节' : null,
      constraints?.deviceLimit ? `设备约束：${constraints.deviceLimit}` : null
    ].filter(Boolean).join('；') || '未设置特殊约束';

    const knowledgeText = knowledgeRefs.length
      ? knowledgeRefs.map((k, i) => `${i + 1}. ${k.title || k.id || '知识条目'}`).join('\n')
      : '未调用显式知识条目';

    return {
      task,
      constraints: constraintText,
      rules: knowledgeText,
      decision: {
        action: '降低空调设定温度并启动局部气流辅助调节',
        target: '办公区主要占用区域',
        value: '空调设定温度下调 1.5℃；局部风速提升至 0.4 m/s',
        priority: '高',
        scope: '中部办公区及高热不适人员周边',
        note: semanticContext
          ? `基于当前语义状态上下文完成策略生成，模型：${modelConfig?.modelId || 'unknown'}`
          : '未检测到语义化状态上下文'
      },
      rawText: `建议优先通过降低空调设定温度并辅以局部风速提升的方式改善当前办公区热不适状态。`,
      timestamp: new Date().toISOString()
    };
  }

  // ====== 后面接真实接口时，改成这种结构 ======
  // async generateStrategy(payload) {
  //   const res = await fetch('/api/strategy/generate', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  //   });
  //   if (!res.ok) throw new Error(`策略生成失败: ${res.status}`);
  //   return await res.json();
  // }
};