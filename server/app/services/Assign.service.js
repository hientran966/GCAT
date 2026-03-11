class AssignService {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async extractAssignData(payload) {
    const assign = {
      account_id: payload.account_id,
      stage_id: payload.stage_id,
      assigned_quantity: payload.assigned_quantity,
    };
    return assign;
  }

  async create(payload) {
    if (!payload) throw new Error("Không có dữ liệu đầu vào");
    if (!payload.stage_id) throw new Error("Cần có tên công đoạn");
    if (!payload.account_id) throw new Error("Cần có mã nhân công");
    if (!payload.assigned_quantity) throw new Error("Cần có số lượng");

    const assign = await this.extractAssignData(payload);
    const connection = await this.mysql.getConnection();

    try {
      await connection.beginTransaction();
      const [account_id] = await this.mysql.execute(
        "SELECT id FROM accounts WHERE id = ?",
        [payload.account_id],
      );
      if (account_id.length === 0) throw new Error("Nhân công không tồn tại");

      const [stage_id] = await this.mysql.execute(
        "SELECT id, assigned_quantity, stage_quantity FROM product_stages WHERE id = ?",
        [payload.stage_id],
      );
      if (stage_id.length === 0) throw new Error("Công đoạn không tồn tại");

      const assignedQty = Number(payload.assigned_quantity);
      const currentAssigned = Number(stage_id[0].assigned_quantity);
      const stageQty = Number(stage_id[0].stage_quantity);
      if (assignedQty + currentAssigned > stageQty) {
        throw new Error("Số lượng phân công vượt quá số lượng công đoạn");
      }

      await connection.execute(
        "UPDATE product_stages SET assigned_quantity = assigned_quantity + ? WHERE id = ?",
        [payload.assigned_quantity, payload.stage_id],
      );

      const [result] = await connection.execute(
        `INSERT INTO stage_assignments (account_id, stage_id, assigned_quantity)
          VALUES (?, ?, ?)`,
        [assign.account_id, assign.stage_id, assign.assigned_quantity],
      );

      await connection.commit();

      return { id: result.insertId, ...assign };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async find(filter = {}) {
    let sql = `
      SELECT 
        sa.id,
        sa.stage_id,
        sa.account_id,
        sa.done_quantity,
        sa.assigned_quantity,

        p.code AS product_code,
        ps.stage_name,
        a.name AS worker_name

      FROM stage_assignments sa
      JOIN product_stages ps ON sa.stage_id = ps.id
      JOIN products p ON ps.product_id = p.id
      JOIN accounts a ON sa.account_id = a.id

      WHERE sa.deleted_at IS NULL
    `;

    const params = [];

    if (filter.account_id) {
      sql += " AND sa.account_id = ?";
      params.push(filter.account_id);
    }

    if (filter.stage_id) {
      sql += " AND sa.stage_id = ?";
      params.push(filter.stage_id);
    }

    const [rows] = await this.mysql.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.mysql.execute(
      `
      SELECT 
        sa.id,
        sa.stage_id,
        sa.account_id,
        sa.done_quantity,
        sa.assigned_quantity,

        p.code AS product_code,
        ps.stage_name,
        a.name AS worker_name

      FROM stage_assignments sa
      JOIN product_stages ps ON sa.stage_id = ps.id
      JOIN products p ON ps.product_id = p.id
      JOIN accounts a ON sa.account_id = a.id

      WHERE sa.id = ? AND sa.deleted_at IS NULL
      `,
      [id],
    );

    const assign = rows[0] || null;
    if (!assign) throw new Error("Phân công không tồn tại");

    return assign;
  }

  async update(id, payload) {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    const currentAssign = await this.findById(id);
    if (!currentAssign) throw new Error("Phân công không tồn tại");

    const ALLOWED_FIELDS = ["stage_id", "account_id", "assigned_quantity"];

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => ALLOWED_FIELDS.includes(key)),
    );

    if (Object.keys(filteredPayload).length === 0) {
      throw new Error("Không có trường hợp lệ để cập nhật");
    }

    let sql = "UPDATE stage_assignments SET ";
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
    const assign = await this.findById(id);
    if (!assign) throw new Error("Phân công không tồn tại");
    const deletedAt = new Date();
    await this.mysql.execute(
      "UPDATE stage_assignments SET deleted_at = ? WHERE id = ?",
      [deletedAt, id],
    );
    return { ...assign, deleted_at: deletedAt };
  }

  async restore(id) {
    const [result] = await this.mysql.execute(
      "UPDATE stage_assignments SET deleted_at = NULL WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = AssignService;
