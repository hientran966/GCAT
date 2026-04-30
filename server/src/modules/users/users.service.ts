import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject('MYSQL') private readonly db: any) {}

  // ================= GET ALL
  async findAll(query: any) {
    const { page = 1, limit = 10, role, keyword } = query;

    const offset = (page - 1) * limit;

    let where = `WHERE deleted_at IS NULL`;
    const params: any[] = [];

    if (role) {
      where += ` AND role = ?`;
      params.push(role);
    }

    if (keyword) {
      where += ` AND (name LIKE ? OR phone LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [rows] = await this.db.execute(
      `
      SELECT id, name, phone, role, created_at
      FROM users
      ${where}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)],
    );

    const [count]: any = await this.db.execute(
      `SELECT COUNT(*) as total FROM users ${where}`,
      params,
    );

    return {
      data: rows,
      total: count[0].total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  // ================= GET ONE
  async findOne(id: number) {
    const [rows]: any = await this.db.execute(
      `SELECT id, name, phone, role, created_at
       FROM users
       WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!rows.length) throw new NotFoundException('User not found');

    return rows[0];
  }

  // ================= CREATE
  async create(data: any) {
    const { phone, name, password, role } = data;

    if (!phone || !password || !name) {
      throw new BadRequestException('Missing required fields');
    }

    // check duplicate phone
    const [exist]: any = await this.db.execute(
      `SELECT id FROM users WHERE phone = ? AND deleted_at IS NULL`,
      [phone],
    );

    if (exist.length) {
      throw new BadRequestException('Phone already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    const [res]: any = await this.db.execute(
      `
      INSERT INTO users (phone, name, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [phone, name, hash, role || 'worker'],
    );

    return {
      id: res.insertId,
      phone,
      name,
      role: role || 'worker',
    };
  }

  // ================= UPDATE
  async update(id: number, data: any) {
    const { name, role } = data;

    const [exist]: any = await this.db.execute(
      `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!exist.length) {
      throw new NotFoundException('User not found');
    }

    await this.db.execute(
      `
      UPDATE users
      SET name = ?, role = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [name, role, id],
    );

    return { message: 'Updated successfully' };
  }

  // ================= CHANGE PASSWORD
  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const [rows]: any = await this.db.execute(
      `SELECT password FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!rows.length) throw new NotFoundException('User not found');

    const user = rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password incorrect');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.db.execute(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
      [hash, id],
    );

    return { message: 'Password updated' };
  }

  // ================= DELETE (soft delete)
  async remove(id: number) {
    const [exist]: any = await this.db.execute(
      `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (!exist.length) {
      throw new NotFoundException('User not found');
    }

    await this.db.execute(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [
      id,
    ]);

    return { message: 'Deleted successfully' };
  }
}
