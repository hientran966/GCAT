import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ReportsService {
  constructor(@Inject('MYSQL') private readonly db: any) {}

  // ================= GET ALL
  async findAll(query: any) {
    const { page, limit, worker_id, from_date, to_date } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const offset = (pageNum - 1) * limitNum;

    let where = `WHERE r.deleted_at IS NULL`;
    const params: any[] = [];

    if (worker_id) {
      where += ` AND a.worker_id = ?`;
      params.push(worker_id);
    }

    if (from_date) {
      where += ` AND r.report_date >= ?`;
      params.push(from_date);
    }

    if (to_date) {
      where += ` AND r.report_date <= ?`;
      params.push(to_date);
    }

    const [rows] = await this.db.execute(
      `
      SELECT 
        r.*,
        u.name as worker_name,
        o.name as operation_name,
        o.price,
        p.code as product_code
      FROM reports r
      LEFT JOIN assignments a ON a.id = r.assignment_id
      LEFT JOIN users u ON u.id = a.worker_id
      LEFT JOIN operations o ON o.id = a.operation_id
      LEFT JOIN products p ON p.id = o.product_id
      ${where}
      ORDER BY r.report_date DESC
      LIMIT ${limitNum} OFFSET ${offset}
      `,
      [...params],
    );

    const [count]: any = await this.db.execute(
      `SELECT COUNT(*) as total FROM reports r
      LEFT JOIN assignments a ON a.id = r.assignment_id
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
        r.*,
        u.name as worker_name,
        o.name as operation_name,
        o.price,
        p.code as product_code
      FROM reports r
      LEFT JOIN assignments a ON a.id = r.assignment_id
      LEFT JOIN users u ON u.id = a.worker_id
      LEFT JOIN operations o ON o.id = a.operation_id
      LEFT JOIN products p ON p.id = o.product_id
      WHERE r.id = ? AND r.deleted_at IS NULL
      `,
      [id],
    );

    if (!rows.length) throw new NotFoundException('Report not found');

    return rows[0];
  }

  // ================= CREATE
  async create(data: any) {
    const { assignment_id, quantity, report_date } = data;

    if (!assignment_id || !quantity) {
      throw new BadRequestException('Missing required fields');
    }

    // lấy assignment
    const [assign]: any = await this.db.execute(
      `
      SELECT * FROM assignments
      WHERE id = ? AND deleted_at IS NULL
      `,
      [assignment_id],
    );

    if (!assign.length) {
      throw new BadRequestException('Assignment not found');
    }

    const [res]: any = await this.db.execute(
      `
      INSERT INTO reports
      (assignment_id, quantity, report_date)
      VALUES (?, ?, ?)
      `,
      [assignment_id, quantity, report_date || new Date()],
    );

    return {
      id: res.insertId,
      quantity,
    };
  }

  // ================= UPDATE
  async update(id: number, data: any) {
    const { quantity } = data;

    const [rows]: any = await this.db.execute(
      `SELECT * FROM reports WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!rows.length) throw new NotFoundException('Report not found');

    await this.db.execute(
      `
      UPDATE reports
      SET quantity = ?
      WHERE id = ?
      `,
      [quantity, id],
    );

    return { message: 'Updated successfully' };
  }

  // ================= DELETE
  async remove(id: number, user: any) {
    const [rows]: any = await this.db.execute(
      `
      SELECT r.*, a.worker_id
      FROM reports r
      JOIN assignments a ON a.id = r.assignment_id
      WHERE r.id = ? AND r.deleted_at IS NULL
      `,
      [id],
    );

    if (!rows.length) throw new NotFoundException('Report not found');

    const report = rows[0];

    if (report.worker_id !== user.id) {
      throw new BadRequestException('Not your report');
    }

    await this.db.execute(
      `UPDATE reports SET deleted_at = NOW() WHERE id = ?`,
      [id],
    );

    return { message: 'Deleted successfully' };
  }

  // ================= GET SALARY
  async getSalary(query: any) {
    const { worker_id, from_date, to_date } = query;

    if (!worker_id) {
      throw new BadRequestException('worker_id is required');
    }

    const params: any[] = [worker_id];

    let where = `WHERE a.worker_id = ? AND r.deleted_at IS NULL`;

    if (from_date) {
      where += ` AND r.report_date >= ?`;
      params.push(from_date);
    }

    if (to_date) {
      where += ` AND r.report_date <= ?`;
      params.push(to_date);
    }

    const [rows]: any = await this.db.execute(
      `
      SELECT 
        SUM(r.quantity * o.price) as total_salary
      FROM reports r
      JOIN assignments a ON a.id = r.assignment_id
      JOIN operations o ON o.id = a.operation_id
      ${where}
      `,
      params,
    );

    return {
      worker_id,
      total_salary: rows[0].total_salary || 0,
    };
  }
}
