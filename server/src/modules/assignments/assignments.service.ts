import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AssignmentsService {
  constructor(@Inject('MYSQL') private readonly db: any) {}

  // ================= GET ALL
  async findAll(query: any) {
    const { page, limit, worker_id, product_id } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const offset = (pageNum - 1) * limitNum;

    let where = `WHERE a.deleted_at IS NULL`;
    const params: any[] = [];

    if (worker_id) {
      where += ` AND a.worker_id = ?`;
      params.push(worker_id);
    }

    if (product_id) {
      where += ` AND o.product_id = ?`;
      params.push(product_id);
    }

    const [rows] = await this.db.execute(
      `
      SELECT 
        a.*,
        u.name as worker_name,
        o.name as operation_name,
        o.price,
        p.code as product_code
      FROM assignments a
      LEFT JOIN users u ON u.id = a.worker_id
      LEFT JOIN operations o ON o.id = a.operation_id
      LEFT JOIN products p ON p.id = o.product_id
      ${where}
      ORDER BY a.id DESC
      LIMIT ${limitNum} OFFSET ${offset}
      `,
      [...params],
    );

    const [count]: any = await this.db.execute(
      `SELECT COUNT(*) as total FROM assignments a
      LEFT JOIN operations o ON o.id = a.operation_id
      ${where}`,
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
      SELECT 
        a.*,
        u.name as worker_name,
        o.name as operation_name,
        o.price,
        p.code as product_code
      FROM assignments a
      LEFT JOIN users u ON u.id = a.worker_id
      LEFT JOIN operations o ON o.id = a.operation_id
      LEFT JOIN products p ON p.id = o.product_id
      WHERE a.id = ? AND a.deleted_at IS NULL
      `,
      [id],
    );

    if (!rows.length) throw new NotFoundException('Assignment not found');

    return rows[0];
  }

  // ================= CREATE
  async create(data: any) {
    const { worker_id, operation_id } = data;

    if (!worker_id || !operation_id) {
      throw new BadRequestException('Missing required fields');
    }

    // check worker
    const [worker]: any = await this.db.execute(
      `SELECT id FROM users WHERE id = ? AND role = 'worker' AND deleted_at IS NULL`,
      [worker_id],
    );

    if (!worker.length) {
      throw new BadRequestException('Worker not found');
    }

    // check operation + lấy product_id
    const [operation]: any = await this.db.execute(
      `SELECT id, product_id FROM operations WHERE id = ? AND deleted_at IS NULL`,
      [operation_id],
    );

    if (!operation.length) {
      throw new BadRequestException('Operation not found');
    }

    const [res]: any = await this.db.execute(
      `
      INSERT INTO assignments 
      (worker_id, operation_id)
      VALUES (?, ?)
      `,
      [worker_id, operation_id],
    );

    return {
      id: res.insertId,
      worker_id,
      operation_id,
    };
  }

  // ================= DELETE
  async remove(id: number) {
    const [exist]: any = await this.db.execute(
      `SELECT id FROM assignments WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!exist.length) throw new NotFoundException('Assignment not found');

    await this.db.execute(
      `UPDATE assignments SET deleted_at = NOW() WHERE id = ?`,
      [id],
    );

    return { message: 'Deleted successfully' };
  }
}
