import createApiClient from "./api.service";

class AccountService {
    constructor(baseUrl = "/api/accounts") {
        this.api = createApiClient(baseUrl);
    }

    async createAccount(data) {
        return (await this.api.post("/", data)).data;
    }

    async getAccountById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateAccount(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteAccount(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllAccount(filter = {}) {
        return (await this.api.get("/", { params: filter })).data;
    }

    async login(phone, password) {
        return (await this.api.post("/login", { phone, password })).data;
    }

    async changePassword(id, oldPassword, newPassword) {
        return (await this.api.put(`/${id}/password`, { oldPassword, newPassword })).data;
    }
}

export default new AccountService();
