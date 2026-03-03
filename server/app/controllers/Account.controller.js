const { createController } = require("./controllerFactory");
const AuthService = require("../services/Account.service");
const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");

const baseController = createController(AuthService, {
    create: "Có lỗi xảy ra khi tạo tài khoản",
    findAll: "Có lỗi xảy ra khi lấy danh sách tài khoản",
    findOne: "Có lỗi xảy ra khi lấy tài khoản",
    notFound: "Tài khoản không tồn tại",
    update: "Có lỗi xảy ra khi cập nhật tài khoản",
    delete: "Có lỗi xảy ra khi xóa tài khoản",
    restore: "Có lỗi xảy ra khi khôi phục tài khoản",
});

const customMethods = {
    login: async (req, res, next) => {
        try {
            const authService = new AuthService(MySQL.connection);
            const account = await authService.login(req.body.phone, req.body.password);
            res.send(account);
        } catch (error) {
            console.error("Login error:", error);
            next(new ApiError(401, error.message || "Đăng nhập không thành công"));
        }
    },

    changePassword: async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new ApiError(400, "Trường mật khẩu cũ và mật khẩu mới là bắt buộc"));
        }

        try {
            const authService = new AuthService(MySQL.connection);
            const result = await authService.changePassword(req.params.id, oldPassword, newPassword);
            return res.send(result);
        } catch (error) {
            console.error("Lỗi:", error);
            const statusCode = error.statusCode || 500;
            next(new ApiError(statusCode, error.message || "Có lỗi xảy ra khi đổi mật khẩu"));
        }
    },
};

module.exports = {
    ...baseController,
    ...customMethods
};
