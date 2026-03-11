class ReportService {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async extractReportData(payload) {
    const report = {
      assign_id: payload.assign_id,
      account_id: payload.account_id,
      quantity_done: payload.quantity_done,
      note: payload.note || "",
    };
    return report;
  }

  async create(payload) {
    if (!payload) throw new Error("Không có dữ liệu đầu vào");
    if (!payload.account_id) throw new Error("Cần có người báo cáo");
    if (!payload.assign_id) throw new Error("Cần có mã phân công");
    if (!payload.quantity_done) throw new Error("Cần có số lượng");

    const [assigned_quantity] = await this.mysql.execute(
      "SELECT assigned_quantity FROM stage_assignments WHERE id = ? AND deleted_at IS NULL",
      [payload.assign_id]
    );
    if (assigned_quantity.length === 0) throw new Error("Phân công không tồn tại");
    if (payload.quantity_done > assigned_quantity[0].assigned_quantity) {
      throw new Error("Số lượng báo cáo vượt quá số lượng phân công");
    }

    const report = await this.extractReportData(payload);
    const connection = await this.mysql.getConnection();
 
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO daily_reports (assign_id, account_id, quantity_done)
          VALUES (?, ?, ?)`,
        [report.assign_id, report.account_id, report.quantity_done]
      );

      await connection.commit();

      return { id: result.insertId, ...report };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async find(filter = {}) {
    let sql = `SELECT id, account_id, assign_id, quantity_done, note FROM daily_reports WHERE deleted_at IS NULL`;
    const params = [];

    if (filter.assign_id) {
      sql += " AND assign_id LIKE ?";
      params.push(`%${filter.assign_id}%`);
    }

    if (filter.account_id) {
      sql += " AND account_id LIKE ?";
      params.push(`%${filter.account_id}%`);
    }

    const [rows] = await this.mysql.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.mysql.execute(
      `SELECT id, account_id, assign_id, quantity_done, note FROM daily_reports WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    const report = rows[0] || null;
    if (!report) throw new Error("Báo cáo không tồn tại");

    return report;
  }

  async update(id, payload) {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    const currentReport = await this.findById(id);
    if (!currentReport) throw new Error("Báo cáo không tồn tại");

    const ALLOWED_FIELDS = ["account_id", "assign_id", "quantity_done", "note"];

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    if (Object.keys(filteredPayload).length === 0) {
      throw new Error("Không có trường hợp lệ để cập nhật");
    }

    let sql = "UPDATE daily_reports SET ";
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
    const report = await this.findById(id);
    if (!report) throw new Error("Báo cáo không tồn tại");
    const deletedAt = new Date();
    await this.mysql.execute("UPDATE daily_reports SET deleted_at = ? WHERE id = ?", [
      deletedAt,
      id,
    ]);
    return { ...report, deleted_at: deletedAt };
  }

  async restore(id) {
    const [result] = await this.mysql.execute(
      "UPDATE daily_reports SET deleted_at = NULL WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ReportService;