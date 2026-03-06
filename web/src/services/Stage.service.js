import createApiClient from "./api.service";

class StageService {
    constructor(baseUrl = "/api/stages") {
        this.api = createApiClient(baseUrl);
    }

    async createStage(data) {
        return (await this.api.post("/", data)).data;
    }

    async getStageById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateStage(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteStage(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllStage(filter = {}) {
        return (await this.api.get("/", { params: filter })).data;
    }

}

export default new StageService();
