// app/js/state.js
export const AppState = {
  currentModule: 'knowledge',
  currentTab: 'knowledge',
  currentSampleMode: 'direct',

  knowledgeBase: [],
  knowledgeCategories: [
    { id: 'default', name: '默认分类', createdAt: new Date().toISOString() }
  ],
  currentKnowledgeCategoryId: 'default',
  knowledgeGroupOpenState: {},

  sampleBase: [],
  projects: [],
  history: [],

  currentProjectId: null,
  currentResult: null,
  semanticContext: '',

  climate: {
    location: '',
    climateType: ''
  },

  building: {
    spaceType: '',
    maxCapacity: 1,
    layoutType: '',
    dimensions: { width: 10, depth: 8, height: 3 },
    windowWallRatio: 40,
    orientation: ''
  },

  environment: {
    airTemp: 26,
    relativeHumidity: 55,
    airVelocity: 0.2,
    blackGlobeTemp: 27,
    meanRadiantTemp: 26.5
  },

  occupants: {
    count: 0,
    persons: []
  },

  comfort: {
    tsvList: [],
    tsvById: {}
  },

  modelConfig: {
    apiKey: '',
    modelId: 'qwen-plus',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2000
  },

  uploads: {
    pdf: [],
    word: [],
    json: []
  },

  importedFiles: {
    pdf: [],
    word: [],
    json: []
  },

  knowledgeProcessConfig: {
    chunkSize: 1000,
    chunkOverlap: 50,
    embeddingModel: 'text-embedding-v1',
    similarityMetric: 'cosine',
    vectorStore: 'building_env_knowledge'
  },

  knowledgeProcessState: {
    status: 'idle', // idle | chunking | chunked | vectorizing | completed | error
    chunkCount: 0,
    vectorizedCount: 0,
    lastProcessedAt: '',
    logs: []
  },
};