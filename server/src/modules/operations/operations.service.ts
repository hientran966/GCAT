import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class OperationsService {
  constructor(@Inject('MYSQL') private readonly db: any) {}

  // ================= GET ALL
  async findAll(query: any) {
    const { page, limit, product_id, keyword, is_open, min_price, max_price } =
      query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const offset = (pageNum - 1) * limitNum;

    let where = `WHERE o.deleted_at IS NULL`;
    const params: any[] = [];

    if (product_id) {
      where += ` AND o.product_id = ?`;
      params.push(product_id);
    }

    if (keyword) {
      where += ` AND (o.name LIKE ? OR p.code LIKE ? OR p.name LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (is_open === 'true') {
      where += ` AND o.is_open = TRUE`;
    }

    if (min_price) {
      where += ` AND o.price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      where += ` AND o.price <= ?`;
      params.push(Number(max_price));
    }

    const [rows] = await this.db.execute(
      `
      SELECT o.*, p.code as product_code, p.name as product_name
      FROM operations o
      LEFT JOIN products p ON p.id = o.product_id
      ${where}
      ORDER BY o.id ASC
      LIMIT ${limitNum} OFFSET ${offset}
      `,
      [...params],
    );

    const [count]: any = await this.db.execute(
      `
      SELECT COUNT(*) as total
      FROM operations o
      LEFT JOIN products p ON p.id = o.product_id
      ${where}
      `,
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
      SELECT o.*, p.code as product_code, p.name as product_name
      FROM operations o
      LEFT JOIN products p ON p.id = o.product_id
      WHERE o.id = ? AND o.deleted_at IS NULL
      `,
      [id],
    );

    if (!rows.length) throw new NotFoundException('Operation not found');

    return rows[0];
  }

  // ================= GET BY USER
  async getByUser(userId: number) {
    const [rows] = await this.db.execute(
      `
      SELECT o.*, p.code as product_code
      FROM operations o
      JOIN assignments a ON a.operation_id = o.id
      JOIN products p ON p.id = o.product_id
      WHERE a.worker_id = ? AND o.deleted_at IS NULL
      ORDER BY o.id ASC
      `,
      [userId],
    );
    return rows;
  }

  // ================= CREATE
  async create(data: any, file?: Express.Multer.File) {
    const { name, price, product_id, is_open } = data;

    if (!name || !price || !product_id) {
      throw new BadRequestException('Missing required fields');
    }

    // check product tồn tại
    const [product]: any = await this.db.execute(
      `SELECT id FROM products WHERE id = ? AND deleted_at IS NULL`,
      [product_id],
    );

    if (!product.length) {
      throw new BadRequestException('Product not found');
    }

    const image = file ? `/uploads/operations/${file.filename}` : null;

    const [res]: any = await this.db.execute(
      `
      INSERT INTO operations (name, price, product_id, image, is_open)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, price, product_id, image, is_open === 'true' ? true : false],
    );

    return {
      id: res.insertId,
      name,
      price,
      product_id,
      image,
      is_open: is_open === 'true' ? true : false,
    };
  }

  // ================= UPDATE
  async update(id: number, data: any, file?: Express.Multer.File) {
    const { name, price, product_id, is_open } = data;

    const [exist]: any = await this.db.execute(
      `SELECT * FROM operations WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!exist.length) throw new NotFoundException('Operation not found');

    const current = exist[0];

    if (product_id) {
      const [product]: any = await this.db.execute(
        `SELECT id FROM products WHERE id = ? AND deleted_at IS NULL`,
        [product_id],
      );

      if (!product.length) {
        throw new BadRequestException('Product not found');
      }
    }

    const image = file ? `/uploads/operations/${file.filename}` : current.image;

    await this.db.execute(
      `
      UPDATE operations
      SET name = ?, price = ?, product_id = ?, image = ?, is_open = ?
      WHERE id = ?
      `,
      [
        name || current.name,
        price || current.price,
        product_id || current.product_id,
        image,
        is_open === 'true' ? true : false,
        id,
      ],
    );

    return { message: 'Updated successfully' };
  }

  // ================= DELETE
  async remove(id: number) {
    const [exist]: any = await this.db.execute(
      `SELECT id FROM operations WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!exist.length) throw new NotFoundException('Operation not found');

    await this.db.execute(
      `UPDATE operations SET deleted_at = NOW() WHERE id = ?`,
      [id],
    );

    return { message: 'Deleted successfully' };
  }

  // ================= GET BY PRODUCT
  async getByProduct(productId: number) {
    const [rows] = await this.db.execute(
      `
      SELECT *
      FROM operations
      WHERE product_id = ? AND deleted_at IS NULL
      ORDER BY id ASC
      `,
      [productId],
    );

    return rows;
  }
}
