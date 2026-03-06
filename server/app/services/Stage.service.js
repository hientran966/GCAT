const fs = require("fs");
const path = require("path");

class StageService {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async extractStageData(payload) {
    const stage = {
      product_id: payload.product_id,
      stage_name: payload.stage_name,
      price: payload.price,
      stage_quantity: payload.stage_quantity,
    };
    return stage;
  }

  async saveFileFromPayload(payload) {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let sourcePath;
    if (payload.file?.path) {
      sourcePath = payload.file.path;
    } else if (
      typeof payload.file === "string" &&
      fs.existsSync(payload.file)
    ) {
      sourcePath = payload.file;
    } else {
      throw new Error("Không tìm thấy file để lưu.");
    }

    const originalname = payload.file.originalname;
    const ext = path.extname(originalname);
    const baseName = path.basename(originalname, ext);
    const uniqueName = `${baseName}_${Date.now()}${ext}`;
    const destPath = path.join(uploadDir, uniqueName);
    fs.copyFileSync(sourcePath, destPath);

    return path.join("uploads", uniqueName);
  }

  async create(payload) {
    if (!payload) throw new Error("Không có dữ liệu đầu vào");
    if (!payload.stage_name) throw new Error("Cần có tên công đoạn");
    if (!payload.product_id) throw new Error("Cần có mã sản phẩm");
    if (!payload.price) throw new Error("Cần có giá công đoạn");
    if (!payload.stage_quantity) throw new Error("Cần có số lượng công đoạn");

    const [product_id] = await this.mysql.execute(
      "SELECT id FROM products WHERE id = ?",
      [payload.product_id]
    );
    if (product_id.length === 0) throw new Error("Sản phẩm không tồn tại");

    const stage = await this.extractStageData(payload);
    let file_url = null;
    if (payload.file) {
      file_url = await this.saveFileFromPayload(payload);
    }

    const connection = await this.mysql.getConnection();
 
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO product_stages (product_id, stage_name, price, stage_quantity, image_url)
                VALUES (?, ?, ?, ?, ?)`,
        [stage.product_id, stage.stage_name, stage.price, stage.stage_quantity, file_url]
      );

      await connection.commit();

      return { id: result.insertId, ...stage, image_url: file_url };
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
        ps.id,
        ps.stage_name,
        ps.product_id,
        p.code AS product_code,
        ps.price,
        ps.stage_quantity,
        ps.image_url
      FROM product_stages ps
      JOIN products p ON ps.product_id = p.id
      WHERE ps.deleted_at IS NULL
    `;

    const params = [];

    if (filter.product_id) {
      sql += " AND ps.product_id = ?";
      params.push(filter.product_id);
    }

    if (filter.stage_name) {
      sql += " AND ps.stage_name LIKE ?";
      params.push(`%${filter.stage_name}%`);
    }

    const [rows] = await this.mysql.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.mysql.execute(
      `
      SELECT 
        ps.id,
        ps.stage_name,
        ps.product_id,
        p.code AS product_code,
        ps.price,
        ps.stage_quantity,
        ps.image_url
      FROM product_stages ps
      JOIN products p ON ps.product_id = p.id
      WHERE ps.id = ? AND ps.deleted_at IS NULL
      `,
      [id]
    );

    const stage = rows[0] || null;
    if (!stage) throw new Error("Công đoạn không tồn tại");

    return stage;
  }

  async update(id, payload) {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    const currentStage = await this.findById(id);
    if (!currentStage) throw new Error("Công đoạn không tồn tại");

    const ALLOWED_FIELDS = ["stage_name", "product_id", "price", "stage_quantity"];

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    let newImageUrl = null;
    if (payload.file) {
      newImageUrl = await this.saveFileFromPayload(payload);
      filteredPayload.image_url = newImageUrl;
    }

    if (Object.keys(filteredPayload).length === 0) {
      throw new Error("Không có trường hợp lệ để cập nhật");
    }

    let sql = "UPDATE product_stages SET ";
    const fields = [];
    const params = [];

    for (const key in filteredPayload) {
      fields.push(`${key} = ?`);
      params.push(filteredPayload[key]);
    }

    sql += fields.join(", ") + " WHERE id = ?";
    params.push(id);

    await this.mysql.execute(sql, params);

    if (newImageUrl && currentStage.image_url) {
      const oldImagePath = path.join(__dir_name, "../../", currentStage.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    return this.findById(id);
  }

  async delete(id) {
    const stage = await this.findById(id);
    if (!stage) throw new Error("Công đoạn không tồn tại");
    const deletedAt = new Date();
    await this.mysql.execute("UPDATE product_stages SET deleted_at = ? WHERE id = ?", [
      deletedAt,
      id,
    ]);
    return { ...stage, deleted_at: deletedAt };
  }

  async restore(id) {
    const [result] = await this.mysql.execute(
      "UPDATE product_stages SET deleted_at = NULL WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = StageService;