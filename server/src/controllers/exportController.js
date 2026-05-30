/**
 * 数据导出控制器（薄层）
 * Excel 生成和流式传输保持在此层（属 HTTP 关注点）
 */

import ExcelJS from 'exceljs';
import * as exportService from '../services/exportService.js';
import Response from '../utils/response.js';

export async function exportStudents(req, res) {
  try {
    const rows = await exportService.getExportStudentsData(req.body);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('学生名单');

    sheet.columns = [
      { header: '学号', key: 'student_no', width: 12 },
      { header: '姓名', key: 'name', width: 15 },
      { header: '性别', key: 'gender', width: 8 },
      { header: '身份证号', key: 'id_card', width: 22 },
      { header: '出生日期', key: 'date_of_birth', width: 14 },
      { header: '电话', key: 'phone', width: 15 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '所属学院', key: 'college_name', width: 20 },
      { header: '班级', key: 'class_name', width: 20 },
      { header: '状态', key: 'status', width: 10 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    const dataRows = rows.map(r => ({
      ...r,
      status: r.status === 'active' ? '在校' : r.status === 'graduated' ? '毕业' : r.status === 'suspended' ? '休学' : '退学',
      gender: r.gender || '-',
      date_of_birth: r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString('zh-CN') : '-',
    }));
    sheet.addRows(dataRows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=学生名单_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

    console.log(`导出学生名单: ${rows.length} 条`);
  } catch (err) {
    console.error('导出学生名单出错:', err.message);
    return res.status(500).json(Response.error(500, '导出失败'));
  }
}

export async function exportScores(req, res) {
  try {
    const rows = await exportService.getExportScoresData(req.body);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('成绩单');

    sheet.columns = [
      { header: '学号', key: 'student_no', width: 12 },
      { header: '姓名', key: 'student_name', width: 15 },
      { header: '班级', key: 'class_name', width: 20 },
      { header: '课程', key: 'course_name', width: 25 },
      { header: '成绩', key: 'score', width: 10 },
      { header: '考试类型', key: 'exam_type', width: 12 },
      { header: '考试日期', key: 'exam_date', width: 14 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    const dataRows = rows.map(r => ({
      ...r,
      exam_type: r.exam_type === 'final' ? '期末' : r.exam_type === 'midterm' ? '期中' : r.exam_type === 'makeup' ? '补考' : '平时',
      exam_date: r.exam_date ? new Date(r.exam_date).toLocaleDateString('zh-CN') : '-',
    }));
    sheet.addRows(dataRows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=成绩单_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

    console.log(`导出成绩单: ${rows.length} 条`);
  } catch (err) {
    console.error('导出成绩单出错:', err.message);
    return res.status(500).json(Response.error(500, '导出失败'));
  }
}
