const { createController } = require("./controllerFactory");
const AssignService = require("../services/Assign.service");
const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");

const baseController = createController(AssignService, {
    create: "Có lỗi xảy ra khi tạo phân công",
    findAll: "Có lỗi xảy ra khi lấy danh sách phân công",
    findOne: "Có lỗi xảy ra khi lấy phân công",
    notFound: "Phân công không tồn tại",
    update: "Có lỗi xảy ra khi cập nhật phân công",
    delete: "Có lỗi xảy ra khi xóa phân công",
    restore: "Có lỗi xảy ra khi khôi phục phân công",
});

const customMethods = {

};

module.exports = {
    ...baseController,
    ...customMethods
};
