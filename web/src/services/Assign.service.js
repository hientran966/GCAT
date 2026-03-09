import createApiClient from "./api.service";

class AssignService {
    constructor(baseUrl = "/api/assigns") {
        this.api = createApiClient(baseUrl);
    }

    async createAssign(data) {
        return (await this.api.post("/", data)).data;
    }

    async getAssignById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateAssign(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteAssign(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllAssign(filter = {}) {
        return (await this.api.get("/", { params: filter })).data;
    }

}

export default new AssignService();
