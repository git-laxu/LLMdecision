// app/js/api/projectApi.js

export const ProjectApi = {
  async exportProject(project) {
    return {
      success: true,
      project
    };
  },

  async getProjectDetail(project) {
    return {
      success: true,
      project
    };
  }
};