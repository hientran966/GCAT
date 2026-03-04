const { createController } = require("./controllerFactory");
const ReportService = require("../services/Report.service");
const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");

const baseController = createController(ReportService, {
    create: "Có lỗi xảy ra khi tạo báo cáo",
    findAll: "Có lỗi xảy ra khi lấy danh sách báo cáo",
    findOne: "Có lỗi xảy ra khi lấy báo cáo",
    notFound: "Báo cáo không tồn tại",
    update: "Có lỗi xảy ra khi cập nhật báo cáo",
    delete: "Có lỗi xảy ra khi xóa báo cáo",
    restore: "Có lỗi xảy ra khi khôi phục báo cáo",
});

const customMethods = {

};

module.exports = {
    ...baseController,
    ...customMethods
};
