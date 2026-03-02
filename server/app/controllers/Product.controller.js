const { createController } = require("./controllerFactory");
const AuthService = require("../services/Product.service");
const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");

const baseController = createController(AuthService, {
    create: "Có lỗi xảy ra khi tạo sản phẩm",
    findAll: "Có lỗi xảy ra khi lấy danh sách sản phẩm",
    findOne: "Có lỗi xảy ra khi lấy sản phẩm",
    notFound: "Sản phẩm không tồn tại",
    update: "Có lỗi xảy ra khi cập nhật sản phẩm",
    delete: "Có lỗi xảy ra khi xóa sản phẩm",
    restore: "Có lỗi xảy ra khi khôi phục sản phẩm",
});

const customMethods = {
    
};

module.exports = {
    ...baseController,
    ...customMethods
};
