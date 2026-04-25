// app/js/pages/projects/dataManagementPage.js
import { ProjectManager } from './projectManager.js';
import { HistoryManager } from './historyManager.js';
import { Modal } from '../../components/modal.js';

export const DataManagementPage = {
  init() {
    Modal.bindClose('newProjectModal', ['closeNewProjectModal', 'cancelNewProject']);
    ProjectManager.init();
    HistoryManager.init();
  }
};