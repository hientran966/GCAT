const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AccountService {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async extractAccountData(payload) {
    const account = {
      phone: payload.phone,
      name: payload.name,
      role: payload.role ?? "account",
      address: payload.address ?? null,
    };
    return account;
  }

  async create(payload) {
    if (!payload) throw new Error("Không có dữ liệu đầu vào");
    if (!payload.name) throw new Error("Cần có tên người dùng");
    if (!payload.phone) throw new Error("Cần có số điện thoại");

    const [phone] = await this.mysql.execute(
      "SELECT id FROM accounts WHERE phone = ?",
      [payload.phone]
    );
    if (phone.length > 0) throw new Error("Tài khoản đã tồn tại");

    if (!payload.password) payload.password = "defaultPW";

    const account = await this.extractAccountData(payload);
    const connection = await this.mysql.getConnection();
 
    try {
      await connection.beginTransaction();

      const hashedPassword = await bcrypt.hash(payload.password, 10);

      const [result] = await connection.execute(
        `INSERT INTO accounts (phone, name, role, address, password_hash)
                VALUES (?, ?, ?, ?, ?)`,
        [account.phone, account.name, account.role, account.address, hashedPassword]
      );

      await connection.commit();

      return { id: result.insertId, ...account };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async find(filter = {}) {
    let sql = `SELECT id, name, phone, role, address FROM accounts WHERE deleted_at IS NULL`;
    const params = [];

    if (filter.phone) {
      sql += " AND phone LIKE ?";
      params.push(`%${filter.phone}%`);
    }

    if (filter.name) {
      sql += " AND name LIKE ?";
      params.push(`%${filter.name}%`);
    }

    const [rows] = await this.mysql.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.mysql.execute(
      `SELECT id, name, phone, role, address
      FROM accounts
      WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    const account = rows[0];
    if (!account) throw new Error("Người dùng không tồn tại");

    const [assignments] = await this.mysql.execute(
      `SELECT 
        sa.id,
        sa.stage_id,
        sa.account_id,
        sa.done_quantity,
        sa.assigned_quantity,

        p.code AS product_code,
        ps.stage_name,
        ps.price

      FROM stage_assignments sa
      JOIN product_stages ps ON sa.stage_id = ps.id AND ps.deleted_at IS NULL
      JOIN products p ON ps.product_id = p.id AND p.deleted_at IS NULL

      WHERE sa.deleted_at IS NULL
      AND sa.account_id = ?`,
      [id]
    );

    const [monthlyStats] = await this.mysql.execute(
      `SELECT 
        DATE_FORMAT(dr.created_at,'%Y-%m') AS month,
        SUM(ps.price * dr.reported_quantity) AS total_money

      FROM daily_reports dr
      JOIN stage_assignments sa ON dr.assign_id = sa.id AND sa.deleted_at IS NULL
      JOIN product_stages ps ON sa.stage_id = ps.id AND ps.deleted_at IS NULL

      WHERE dr.account_id = ?
      AND dr.deleted_at IS NULL

      GROUP BY month
      ORDER BY month DESC`,
      [id]
    );

    return {
      ...account,
      assignments,
      monthlyStats
    };
  }

  async update(id, payload) {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    const currentAccount = await this.findById(id);
    if (!currentAccount) throw new Error("Người dùng không tồn tại");

    const ALLOWED_FIELDS = ["name", "phone", "role", "address"];

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    if (Object.keys(filteredPayload).length === 0) {
      throw new Error("Không có trường hợp lệ để cập nhật");
    }

    let sql = "UPDATE accounts SET ";
    const fields = [];
    const params = [];

    for (const key in filteredPayload) {
      fields.push(`${key} = ?`);
      params.push(filteredPayload[key]);
    }

    sql += fields.join(", ") + " WHERE id = ?";
    params.push(id);

    await this.mysql.execute(sql, params);
    return this.findById(id);
  }

  async delete(id) {
    const account = await this.findById(id);
    if (!account) throw new Error("Người dùng không tồn tại");
    const deletedAt = new Date();
    await this.mysql.execute("UPDATE accounts SET deleted_at = ? WHERE id = ?", [
      deletedAt,
      id,
    ]);
    return { ...account, deleted_at: deletedAt };
  }

  async restore(id) {
    const [result] = await this.mysql.execute(
      "UPDATE accounts SET deleted_at = NULL WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  async comparePassword(inputPassword, storedPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
  }

  async login(identifier, password) {
    if (!identifier || !password) {
      throw new Error("Cần có số điện thoại và mật khẩu");
    }

    const [rows] = await this.mysql.execute(
      "SELECT id, phone, name, role, password_hash FROM accounts WHERE (phone = ? OR name = ?) AND deleted_at IS NULL",
      [identifier, identifier]
    );

    const account = rows[0];
    if (!account) throw new Error("Tài khoản không tồn tại");

    const isMatch = await this.comparePassword(password, account.password_hash);
    if (!isMatch) throw new Error("Mật khẩu không đúng");

    const payload = {
      id: account.id,
      phone: account.phone,
      name: account.name,
      role: account.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    return {
      message: "Đăng nhập thành công",
      token,
      account: {
        id: account.id,
        name: account.name,
        phone: account.phone,
        role: account.role,
      },
    };
  }

  async changePassword(id, oldPassword, newPassword) {
    const [rows] = await this.mysql.execute(
      "SELECT password_hash FROM accounts WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      const error = new Error("Tài khoản không tồn tại");
      error.statusCode = 404;
      throw error;
    }

    const storedPassword = rows[0].password_hash;
    if (!(await this.comparePassword(oldPassword, storedPassword))) {
      const error = new Error("Mật khẩu cũ không đúng");
      error.statusCode = 400;
      throw error;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.mysql.execute(
      "UPDATE accounts SET password_hash = ?, updated_at = ? WHERE id = ?",
      [hashedNewPassword, new Date(), id]
    );

    return { message: "Đổi mật khẩu thành công" };
  }
}

module.exports = AccountService;