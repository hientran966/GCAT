const { createController } = require("./controllerFactory");
const StageService = require("../services/Stage.service");
const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");

const baseController = createController(StageService, {
    create: "Có lỗi xảy ra khi tạo công đoạn",
    findAll: "Có lỗi xảy ra khi lấy danh sách công đoạn",
    findOne: "Có lỗi xảy ra khi lấy công đoạn",
    notFound: "Công đoạn không tồn tại",
    update: "Có lỗi xảy ra khi cập nhật công đoạn",
    delete: "Có lỗi xảy ra khi xóa công đoạn",
    restore: "Có lỗi xảy ra khi khôi phục công đoạn",
});

const customMethods = {
    create: async (req, res, next) => {
        try {
            const service = new StageService(MySQL.pool);
            const payload = {
                ...req.body,
                file: req.file,
                file_name: req.file?.originalname
            };

            const result = await service.create(payload);
            res.send(result);
        } catch (err) {
            console.error("Create stage error:", err);
            next(new ApiError(401, err.message || "Tạo công đoạn không thành công"));
        }
    }
};

module.exports = {
    ...baseController,
    ...customMethods
};
