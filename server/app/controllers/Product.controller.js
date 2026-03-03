const { createController } = require("./controllerFactory");
const ProductService = require("../services/Product.service");
const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");

const baseController = createController(ProductService, {
    create: "Có lỗi xảy ra khi tạo sản phẩm",
    findAll: "Có lỗi xảy ra khi lấy danh sách sản phẩm",
    findOne: "Có lỗi xảy ra khi lấy sản phẩm",
    notFound: "Sản phẩm không tồn tại",
    update: "Có lỗi xảy ra khi cập nhật sản phẩm",
    delete: "Có lỗi xảy ra khi xóa sản phẩm",
    restore: "Có lỗi xảy ra khi khôi phục sản phẩm",
});

const customMethods = {
    create: async (req, res, next) => {
        try {
            const service = new ProductService(MySQL.pool);
            const payload = {
                ...req.body,
                file: req.file,
                file_name: req.file?.originalname
            };

            const result = await service.create(payload);
            res.send(result);
        } catch (err) {
            console.error("Create product error:", err);
            next(new ApiError(401, err.message || "Tạo sản phẩm không thành công"));
        }
    }
};

module.exports = {
    ...baseController,
    ...customMethods
};
