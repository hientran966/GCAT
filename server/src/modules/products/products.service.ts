import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProductsService {
  constructor(@Inject('MYSQL') private readonly db: any) {}

  // ================= GET ALL
  async findAll(query: any, userId?: number) {
    const { page, limit, keyword } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const offset = (pageNum - 1) * limitNum;

    let where = `WHERE deleted_at IS NULL`;
    const params: any[] = [];

    if (keyword) {
      where += ` AND name LIKE ?`;
      params.push(`%${keyword}%`);
    }

    if (userId) {
      where += ` AND created_by = ?`;
      params.push(userId);
    }

    const [rows] = await this.db.execute(
      `
      SELECT id, name, code, image, supplier, total_quantity, created_at
      FROM products
      ${where}
      ORDER BY id DESC
      LIMIT ${limitNum} OFFSET ${offset}
      `,
      [...params],
    );

    const [count]: any = await this.db.execute(
      `SELECT COUNT(*) as total FROM products ${where}`,
      params,
    );

    return {
      data: rows,
      total: count[0].total,
      page: pageNum,
      limit: limitNum,
    };
  }

  // ================= GET ONE
  async findOne(id: number) {
    const [rows]: any = await this.db.execute(
      `
      SELECT *
      FROM products
      WHERE id = ? AND deleted_at IS NULL
      `,
      [id],
    );

    if (!rows.length) throw new NotFoundException('Product not found');

    return rows[0];
  }

  // ================= CREATE
  async create(data: any, file?: Express.Multer.File) {
    const { name, code, supplier, total_quantity } = data;

    if (!name) throw new BadRequestException('Name is required');
    if (!code) throw new BadRequestException('Code is required');

    const image = file ? `/uploads/products/${file.filename}` : null;

    const [res]: any = await this.db.execute(
      `
      INSERT INTO products (name, code, supplier, image, total_quantity)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, code, supplier || null, image, total_quantity || null],
    );

    return {
      id: res.insertId,
      name,
      code,
      supplier,
      image,
      total_quantity,
    };
  }

  // ================= UPDATE
  async update(id: number, data: any, file?: Express.Multer.File) {
    const { name, code, supplier, total_quantity } = data;

    const [exist]: any = await this.db.execute(
      `SELECT * FROM products WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!exist.length) throw new NotFoundException('Product not found');

    const current = exist[0];

    const image = file ? `/uploads/products/${file.filename}` : current.image;

    await this.db.execute(
      `
      UPDATE products
      SET name = ?, code = ?, supplier = ?, image = ?, total_quantity = ?
      WHERE id = ?
      `,
      [name, code, supplier || null, image, total_quantity || null, id],
    );

    return { message: 'Updated successfully' };
  }

  // ================= DELETE (soft delete)
  async remove(id: number) {
    const [exist]: any = await this.db.execute(
      `SELECT id FROM products WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!exist.length) throw new NotFoundException('Product not found');

    await this.db.execute(
      `UPDATE products SET deleted_at = NOW() WHERE id = ?`,
      [id],
    );

    return { message: 'Deleted successfully' };
  }
}
