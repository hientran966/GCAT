const fs = require("fs");
const path = require("path");

class ProductService {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async extractProductData(payload) {
    const product = {
      code: payload.code,
      name: payload.name,
      total_quantity: payload.total_quantity
    };
    return product;
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
    if (!payload.name) throw new Error("Cần có tên sản phẩm");
    if (!payload.code) throw new Error("Cần có mã sản phẩm");
    if (!payload.total_quantity) throw new Error("Cần có tổng số lượng");

    const [code] = await this.mysql.execute(
      "SELECT id FROM products WHERE code = ?",
      [payload.code]
    );
    if (code.length > 0) throw new Error("Sản phẩm đã tồn tại");

    const product = await this.extractProductData(payload);
    let file_url = null;
    if (payload.file) {
      file_url = await this.saveFileFromPayload(payload);
    }

    const connection = await this.mysql.getConnection();
 
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO products (code, name, total_quantity, image_url)
                VALUES (?, ?, ?, ?)`,
        [product.code, product.name, product.total_quantity, file_url]
      );

      await connection.commit();

      return { id: result.insertId, ...product, image_url: file_url };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async find(filter = {}) {
    let sql = `SELECT id, name, code, total_quantity, image_url FROM products WHERE deleted_at IS NULL`;
    const params = [];

    if (filter.code) {
      sql += " AND code LIKE ?";
      params.push(`%${filter.code}%`);
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
      `SELECT id, name, code, total_quantity, image_url FROM products WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    const product = rows[0] || null;
    if (!product) throw new Error("Sản phẩm không tồn tại");

    return product;
  }

  async update(id, payload) {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    const currentProduct = await this.findById(id);
    if (!currentProduct) throw new Error("Sản phẩm không tồn tại");

    const ALLOWED_FIELDS = ["name", "code", "total_quantity"];

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

    let sql = "UPDATE products SET ";
    const fields = [];
    const params = [];

    for (const key in filteredPayload) {
      fields.push(`${key} = ?`);
      params.push(filteredPayload[key]);
    }

    sql += fields.join(", ") + " WHERE id = ?";
    params.push(id);

    await this.mysql.execute(sql, params);

    if (newImageUrl && currentProduct.image_url) {
      const oldImagePath = path.join(__dirname, "../../", currentProduct.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    return this.findById(id);
  }

  async delete(id) {
    const product = await this.findById(id);
    if (!product) throw new Error("Sản phẩm không tồn tại");
    const deletedAt = new Date();
    await this.mysql.execute("UPDATE products SET deleted_at = ? WHERE id = ?", [
      deletedAt,
      id,
    ]);
    return { ...product, deleted_at: deletedAt };
  }

  async restore(id) {
    const [result] = await this.mysql.execute(
      "UPDATE products SET deleted_at = NULL WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ProductService;