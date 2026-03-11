import createApiClient from "./api.service";

class ProductService {
    constructor(baseUrl = "/api/products") {
        this.api = createApiClient(baseUrl);
    }

    async createProduct(data) {
        return (await this.api.post("/", data)).data;
    }

    async getProductById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateProduct(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteProduct(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllProduct(filter = {}) {
        return (await this.api.get("/", { params: filter })).data;
    }
}

export default new ProductService();
