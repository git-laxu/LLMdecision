import { FileUpload } from '../../components/fileUpload.js';
import { KnowledgeManager } from './knowledgeManager.js';
import { SampleManager } from './sampleManager.js';
import { KnowledgeProcessingPanel } from './knowledgeProcessingPanel.js';

export const KnowledgePage = {
  init() {
    FileUpload.initKnowledgeUploads();
    KnowledgeManager.init();
    KnowledgeProcessingPanel.init();
    SampleManager.init();
  }
};